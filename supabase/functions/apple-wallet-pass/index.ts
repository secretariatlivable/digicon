/**
 * DigiCon - Apple Wallet (.pkpass) issuance.
 *
 * Required secrets:
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *   APPLE_PASS_TYPE_IDENTIFIER, APPLE_TEAM_IDENTIFIER
 *   APPLE_CERTIFICATE_PEM, APPLE_PRIVATE_KEY_PEM, APPLE_WWDR_CERTIFICATE_PEM
 *   PUBLIC_APP_URL
 * Optional:
 *   WALLET_ALLOWED_ORIGINS  comma-separated allowlist
 */

import JSZip from 'npm:jszip@3.10.1';
import forge from 'npm:node-forge@1.3.1';
import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

/*
 * Previously defaulted to '*'. Combined with `verify_jwt = false` that let any
 * origin on the internet drive this endpoint.
 */
const ALLOWED_ORIGINS = (Deno.env.get('WALLET_ALLOWED_ORIGINS') ??
  Deno.env.get('WALLET_ALLOWED_ORIGIN') ??
  'https://digicon.cards')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

function corsHeaders(origin: string | null): Record<string, string> {
  const allowed =
    origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Headers':
      'authorization, apikey, content-type, x-client-info',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
    'Cache-Control': 'no-store',
  };
}

const json = (body: unknown, status: number, origin: string | null) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
  });

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/*
 * Throws a CONFIG:-prefixed error so the handler can distinguish an operator
 * misconfiguration from a runtime fault without echoing the secret name to
 * the caller.
 */
function required(name: string): string {
  const value = Deno.env.get(name)?.trim();
  if (!value) throw new Error(`CONFIG:${name}`);
  return value;
}

/**
 * Escapes text interpolated into a pass `attributedValue`, which PassKit
 * renders as limited HTML. Card fields are user-controlled, so raw
 * interpolation allowed markup injection into the rendered pass.
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * PassKit accepts colours only as `rgb(r,g,b)`.
 *
 * Cards store hex (`#007AFF`), which was passed through verbatim. iOS rejects
 * the resulting pass, so every generated .pkpass failed to open.
 */
function toPassKitColor(value: unknown, fallback = 'rgb(0,122,255)'): string {
  const raw = String(value ?? '').trim();

  if (/^rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)$/i.test(raw)) {
    return raw;
  }

  const long = raw.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (long) {
    return `rgb(${parseInt(long[1], 16)},${parseInt(long[2], 16)},${parseInt(long[3], 16)})`;
  }

  const short = raw.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i);
  if (short) {
    const expand = (c: string) => parseInt(c + c, 16);
    return `rgb(${expand(short[1])},${expand(short[2])},${expand(short[3])})`;
  }

  return fallback;
}

function normalizePem(value: string): string {
  return value.replace(/\\n/g, '\n').trim();
}

function toBytes(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 0x8000;

  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(
      ...bytes.subarray(offset, Math.min(offset + chunkSize, bytes.length)),
    );
  }

  return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

async function sha1Hex(value: Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-1', value);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function safeFilename(name: string): string {
  return (
    name
      .trim()
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9._-]/g, '')
      .slice(0, 80) || 'digicon-card'
  );
}

async function getPublicAsset(path: string): Promise<Uint8Array | null> {
  const appUrl = Deno.env.get('PUBLIC_APP_URL')?.trim();
  if (!appUrl) return null;

  try {
    const response = await fetch(
      `${appUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`,
    );

    if (!response.ok) return null;

    return new Uint8Array(await response.arrayBuffer());
  } catch {
    return null;
  }
}

function makePassJson(card: Record<string, unknown>, publicUrl: string) {
  const fullName = String(card.full_name || 'DigiCon Contact');
  const company = String(card.company || 'DigiCon');
  const website = String(card.website || '');
  const phone = String(card.phone || '');
  const email = String(card.email || '');

  const genericFields = [
    { key: 'name', label: 'NAME', value: fullName },
  ];

  if (card.job_title) {
    genericFields.push({
      key: 'title',
      label: 'TITLE',
      value: String(card.job_title),
    });
  }

  const secondaryFields = [];
  if (company) {
    secondaryFields.push({
      key: 'company',
      label: 'COMPANY',
      value: company,
    });
  }

  if (phone) {
    secondaryFields.push({
      key: 'phone',
      label: 'PHONE',
      value: phone,
      attributedValue: `<a href="tel:${escapeHtml(phone)}">${escapeHtml(phone)}</a>`,
    });
  }

  if (email) {
    secondaryFields.push({
      key: 'email',
      label: 'EMAIL',
      value: email,
      attributedValue: `<a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>`,
    });
  }

  const auxiliaryFields = [];
  if (website) {
    // Only http(s) becomes a link. Interpolating an unvalidated scheme allowed
    // javascript: and data: URLs to reach the rendered pass.
    const isSafeLink = /^https?:\/\//i.test(website);

    auxiliaryFields.push({
      key: 'website',
      label: 'WEB',
      value: website,
      ...(isSafeLink
        ? {
            attributedValue: `<a href="${escapeHtml(website)}">${escapeHtml(website)}</a>`,
          }
        : {}),
    });
  }

  return {
    formatVersion: 1,
    passTypeIdentifier: required('APPLE_PASS_TYPE_IDENTIFIER'),
    serialNumber: String(card.id),
    teamIdentifier: required('APPLE_TEAM_IDENTIFIER'),
    organizationName: company,
    description: `${fullName} - DigiCon digital business card`,
    logoText: 'DigiCon',
    foregroundColor: 'rgb(255,255,255)',
    backgroundColor: toPassKitColor(card.card_color),
    labelColor: 'rgb(255,255,255)',
    generic: {
      primaryFields: genericFields,
      secondaryFields,
      auxiliaryFields,
      backFields: [
        {
          key: 'card',
          label: 'DIGITAL BUSINESS CARD',
          value: publicUrl,
        },
        ...(card.address
          ? [
              {
                key: 'address',
                label: 'ADDRESS',
                value: String(card.address),
              },
            ]
          : []),
        ...(card.bio
          ? [
              {
                key: 'bio',
                label: 'ABOUT',
                value: String(card.bio),
              },
            ]
          : []),
      ],
    },
    userInfo: {
      cardId: String(card.id),
      publicUrl,
    },
  };
}

// Synchronous: node-forge performs no async work here.
function signManifest(
  manifestJson: string,
  certificatePem: string,
  privateKeyPem: string,
  wwdrPem: string,
): Uint8Array {
  const p7 = forge.pkcs7.createSignedData();
  p7.content = forge.util.createBuffer(manifestJson, 'utf8');

  const certificate = forge.pki.certificateFromPem(certificatePem);
  const wwdrCertificate = forge.pki.certificateFromPem(wwdrPem);
  const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);

  p7.addCertificate(certificate);
  p7.addCertificate(wwdrCertificate);
  p7.addSigner({
    key: privateKey,
    certificate,
    digestAlgorithm: forge.pki.oids.sha1,
    authenticatedAttributes: [
      {
        type: forge.pki.oids.contentType,
        value: forge.pki.oids.data,
      },
      {
        type: forge.pki.oids.messageDigest,
      },
      {
        type: forge.pki.oids.signingTime,
        value: new Date(),
      },
    ],
  });

  p7.sign({ detached: true });

  return base64ToBytes(forge.util.encode64(forge.asn1.toDer(p7.toAsn1()).getBytes()));
}

async function buildPkpass(
  card: Record<string, unknown>,
): Promise<Uint8Array> {
  const publicAppUrl = required('PUBLIC_APP_URL').replace(/\/$/, '');
  const publicUrl = `${publicAppUrl}/c/${encodeURIComponent(String(card.id))}`;

  const passJson = JSON.stringify(makePassJson(card, publicUrl));
  const passBytes = toBytes(passJson);

  const manifest: Record<string, string> = {
    'pass.json': await sha1Hex(passBytes),
  };

  const logo = await getPublicAsset('DigiCon.png');
  if (logo) {
    manifest['icon.png'] = await sha1Hex(logo);
    manifest['icon@2x.png'] = await sha1Hex(logo);
    manifest['logo.png'] = await sha1Hex(logo);
    manifest['logo@2x.png'] = await sha1Hex(logo);
  }

  const manifestJson = JSON.stringify(manifest);
  const signature = signManifest(
    manifestJson,
    normalizePem(required('APPLE_CERTIFICATE_PEM')),
    normalizePem(required('APPLE_PRIVATE_KEY_PEM')),
    normalizePem(required('APPLE_WWDR_CERTIFICATE_PEM')),
  );

  const zip = new JSZip();
  zip.file('pass.json', passBytes);
  zip.file('manifest.json', manifestJson);
  zip.file('signature', signature);

  if (logo) {
    zip.file('icon.png', logo);
    zip.file('icon@2x.png', logo);
    zip.file('logo.png', logo);
    zip.file('logo@2x.png', logo);
  }

  return new Uint8Array(
    await zip.generateAsync({
      type: 'uint8array',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    }),
  );
}

Deno.serve(async (request) => {
  const origin = request.headers.get('Origin');

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed.' }, 405, origin);
  }

  try {
    const supabaseUrl = required('SUPABASE_URL');
    const serviceRoleKey = required('SUPABASE_SERVICE_ROLE_KEY');

    /*
     * Wallet issuance is an authenticated, entitled action.
     *
     * This endpoint previously ran with `verify_jwt = false`, a service-role
     * client, and no auth check, so anyone who guessed a card UUID could mint
     * a signed pass. Each request also performs PKCS#7 signing and DEFLATE
     * compression, making it a cheap cost-amplification target.
     */
    const authorization = request.headers.get('Authorization');
    if (!authorization?.startsWith('Bearer ')) {
      return json({ error: 'Authentication required.' }, 401, origin);
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const {
      data: { user },
      error: userError,
    } = await admin.auth.getUser(authorization.slice('Bearer '.length).trim());

    if (userError || !user) {
      return json({ error: 'Invalid authentication session.' }, 401, origin);
    }

    const body = await request.json().catch(() => null);
    const cardId = String(
      (body as { card_id?: unknown } | null)?.card_id ?? '',
    ).trim();

    // Strict RFC 4122 shape. The previous /^[0-9a-f-]{36}$/i accepted values
    // such as 36 consecutive hyphens.
    if (!UUID_RE.test(cardId)) {
      return json({ error: 'A valid card_id is required.' }, 400, origin);
    }

    const { data: card, error } = await admin
      .from('business_cards')
      .select(
        'id,user_id,full_name,job_title,company,email,phone,website,address,bio,photo_url,card_color,accent_color,is_active',
      )
      .eq('id', cardId)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error('Card lookup failed:', error);
      return json({ error: 'Unable to load the business card.' }, 500, origin);
    }

    // Not-found and not-yours return an identical response so this endpoint
    // cannot be used to enumerate which card UUIDs exist.
    if (!card || card.user_id !== user.id) {
      return json({ error: 'Active business card not found.' }, 404, origin);
    }

    /*
     * Wallet download is a paid entitlement. Enforced server-side because the
     * browser check in src/lib/entitlements.ts can be bypassed by calling this
     * endpoint directly.
     */
    const { data: subscription } = await admin
      .from('subscriptions')
      .select('plan,status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .limit(1)
      .maybeSingle();

    if (!subscription) {
      return json(
        {
          error:
            'Apple Wallet download is available after upgrading your DigiCon plan.',
          upgradeRequired: true,
        },
        402,
        origin,
      );
    }

    const pass = await buildPkpass(card);

    return json(
      {
        passBase64: bytesToBase64(pass),
        filename: `${safeFilename(String(card.full_name))}.pkpass`,
      },
      200,
      origin,
    );
  } catch (cause) {
    console.error('Apple Wallet pass generation failed:', cause);

    /*
     * Configuration failures are logged with the secret name but never
     * returned. The previous version echoed `error.message` verbatim, leaking
     * strings such as "Missing required secret: APPLE_PRIVATE_KEY_PEM".
     */
    const isConfig =
      cause instanceof Error && cause.message.startsWith('CONFIG:');

    return json(
      {
        error: isConfig
          ? 'Apple Wallet is not configured for this deployment.'
          : 'Unable to generate the Apple Wallet pass.',
      },
      isConfig ? 503 : 500,
      origin,
    );
  }
});
