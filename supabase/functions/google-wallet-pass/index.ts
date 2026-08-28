/**
 * DigiCon — Google Wallet pass issuance.
 *
 * This file previously contained a byte-for-byte copy of the Apple Wallet
 * function: it built a `.pkpass`, signed it with Apple certificates, and
 * returned `passBase64`. Both callers require a `saveUrl`, so Google Wallet
 * failed 100% of the time.
 *
 * Correct behaviour: build a `GenericObject`, sign a JWT with the Google
 * service-account RS256 key, and return a `pay.google.com/gp/v/save/<jwt>`
 * link. No Google API call is required for the save flow — the signed JWT is
 * itself the authorisation.
 *
 * Required secrets:
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *   GOOGLE_WALLET_ISSUER_ID              e.g. 3388000000012345678
 *   GOOGLE_WALLET_CLASS_ID               e.g. 3388000000012345678.digicon-card
 *   GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL
 *   GOOGLE_WALLET_PRIVATE_KEY            PEM, literal \n sequences permitted
 *   PUBLIC_APP_URL
 * Optional:
 *   WALLET_ALLOWED_ORIGINS               comma-separated allowlist
 */

import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

/* ------------------------------------------------------------------ */
/*  CORS                                                               */
/* ------------------------------------------------------------------ */

/*
 * The previous implementation defaulted `Access-Control-Allow-Origin` to `*`.
 * Combined with `verify_jwt = false` that let any site on the internet drive
 * this endpoint. Origins are now matched against an explicit allowlist.
 */
const ALLOWED_ORIGINS = (Deno.env.get('WALLET_ALLOWED_ORIGINS') ??
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

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function required(name: string): string {
  const value = Deno.env.get(name)?.trim();
  if (!value) throw new Error(`CONFIG:${name}`);
  return value;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function pemToPkcs8(pem: string): Uint8Array {
  const normalized = pem.replace(/\\n/g, '\n').trim();
  const body = normalized
    .replace(/-----BEGIN [^-]+-----/, '')
    .replace(/-----END [^-]+-----/, '')
    .replace(/\s+/g, '');

  if (!body) throw new Error('CONFIG:GOOGLE_WALLET_PRIVATE_KEY');

  const raw = atob(body);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

async function signRs256(payload: string, privateKeyPem: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemToPkcs8(privateKeyPem),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    new TextEncoder().encode(payload),
  );

  return base64UrlEncode(new Uint8Array(signature));
}

/** Google rejects oversized field values; cap everything defensively. */
function clamp(value: unknown, max = 400): string {
  return String(value ?? '').trim().slice(0, max);
}

/**
 * Normalises a stored colour to the `#rrggbb` form Google expects.
 * Cards store `#007AFF`, but a malformed value would be rejected outright.
 */
function normalizeHexColor(value: unknown, fallback = '#007aff'): string {
  const raw = String(value ?? '').trim();
  if (/^#[0-9a-f]{6}$/i.test(raw)) return raw.toLowerCase();

  const short = raw.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i);
  if (short) {
    const [, r, g, b] = short;
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }

  return fallback;
}

/* ------------------------------------------------------------------ */
/*  Pass object                                                        */
/* ------------------------------------------------------------------ */

type CardRow = Record<string, unknown>;

function buildGenericObject(card: CardRow, publicUrl: string) {
  const issuerId = required('GOOGLE_WALLET_ISSUER_ID');
  const classId = required('GOOGLE_WALLET_CLASS_ID');

  const fullName = clamp(card.full_name) || 'DigiCon Contact';
  const company = clamp(card.company) || 'DigiCon';
  const jobTitle = clamp(card.job_title);
  const email = clamp(card.email, 320);
  const phone = clamp(card.phone, 50);
  const website = clamp(card.website, 2000);

  // Object IDs must be <issuerId>.<suffix> with a restricted character set.
  const objectId = `${issuerId}.${String(card.id).replace(/[^a-zA-Z0-9._-]/g, '')}`;

  const textModulesData: Array<Record<string, string>> = [];
  if (jobTitle) textModulesData.push({ id: 'title', header: 'Title', body: jobTitle });
  if (company) textModulesData.push({ id: 'company', header: 'Company', body: company });
  if (email) textModulesData.push({ id: 'email', header: 'Email', body: email });
  if (phone) textModulesData.push({ id: 'phone', header: 'Phone', body: phone });
  if (card.address) {
    textModulesData.push({
      id: 'address',
      header: 'Address',
      body: clamp(card.address),
    });
  }

  const uris: Array<Record<string, string>> = [
    { id: 'card', uri: publicUrl, description: 'View digital card' },
  ];

  // Only http(s) links are accepted — never interpolate an unvalidated scheme.
  if (/^https?:\/\//i.test(website)) {
    uris.push({ id: 'website', uri: website, description: 'Website' });
  }
  if (email) {
    uris.push({ id: 'mailto', uri: `mailto:${email}`, description: 'Send email' });
  }
  if (phone) {
    const dialable = phone.replace(/[^\d+]/g, '');
    if (dialable) {
      uris.push({ id: 'tel', uri: `tel:${dialable}`, description: 'Call' });
    }
  }

  const photoUrl = clamp(card.photo_url, 2000);

  return {
    id: objectId,
    classId,
    state: 'ACTIVE',
    hexBackgroundColor: normalizeHexColor(card.card_color),
    cardTitle: { defaultValue: { language: 'en-US', value: 'DigiCon' } },
    header: { defaultValue: { language: 'en-US', value: fullName } },
    subheader: {
      defaultValue: { language: 'en-US', value: jobTitle || company },
    },
    textModulesData,
    linksModuleData: { uris },
    barcode: { type: 'QR_CODE', value: publicUrl, alternateText: fullName },
    ...(/^https:\/\//i.test(photoUrl)
      ? {
          heroImage: {
            sourceUri: { uri: photoUrl },
            contentDescription: {
              defaultValue: {
                language: 'en-US',
                value: `${fullName} profile photo`,
              },
            },
          },
        }
      : {}),
  };
}

async function buildSaveUrl(card: CardRow): Promise<string> {
  const appUrl = required('PUBLIC_APP_URL').replace(/\/$/, '');
  const publicUrl = `${appUrl}/c/${encodeURIComponent(String(card.id))}`;

  const issuer = required('GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL');
  const privateKey = required('GOOGLE_WALLET_PRIVATE_KEY');

  const header = { alg: 'RS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);

  const claims = {
    iss: issuer,
    aud: 'google',
    typ: 'savetowallet',
    iat: now,
    // Short-lived: the link is consumed immediately by the client redirect.
    exp: now + 300,
    origins: ALLOWED_ORIGINS,
    payload: { genericObjects: [buildGenericObject(card, publicUrl)] },
  };

  const encoder = new TextEncoder();
  const signingInput = `${base64UrlEncode(
    encoder.encode(JSON.stringify(header)),
  )}.${base64UrlEncode(encoder.encode(JSON.stringify(claims)))}`;

  const signature = await signRs256(signingInput, privateKey);

  return `https://pay.google.com/gp/v/save/${signingInput}.${signature}`;
}

/* ------------------------------------------------------------------ */
/*  Handler                                                            */
/* ------------------------------------------------------------------ */

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
     * The previous version ran with `verify_jwt = false`, a service-role
     * client, and no auth check at all, so anyone who guessed a card UUID
     * could mint passes — and each request performed expensive signing work,
     * making it a cheap amplification vector.
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

    if (!UUID_RE.test(cardId)) {
      return json({ error: 'A valid card_id is required.' }, 400, origin);
    }

    const { data: card, error: cardError } = await admin
      .from('business_cards')
      .select(
        'id,user_id,full_name,job_title,company,email,phone,website,address,bio,photo_url,card_color,accent_color,is_active',
      )
      .eq('id', cardId)
      .eq('is_active', true)
      .maybeSingle();

    if (cardError) {
      console.error('Card lookup failed:', cardError);
      return json({ error: 'Unable to load the business card.' }, 500, origin);
    }

    // Not-found and not-yours return the same response so the endpoint cannot
    // be used to enumerate which card UUIDs exist.
    if (!card || card.user_id !== user.id) {
      return json({ error: 'Active business card not found.' }, 404, origin);
    }

    /*
     * Wallet download is a paid entitlement. Enforced here rather than
     * trusting the browser check in src/lib/entitlements.ts, which a user can
     * bypass by calling this endpoint directly.
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
            'Google Wallet download is available after upgrading your DigiCon plan.',
          upgradeRequired: true,
        },
        402,
        origin,
      );
    }

    return json({ saveUrl: await buildSaveUrl(card) }, 200, origin);
  } catch (cause) {
    console.error('Google Wallet pass generation failed:', cause);

    /*
     * Configuration failures name the missing secret in the logs only.
     * The previous implementation returned `error.message` verbatim, leaking
     * strings such as "Missing required secret: GOOGLE_WALLET_PRIVATE_KEY"
     * to unauthenticated callers.
     */
    const isConfig =
      cause instanceof Error && cause.message.startsWith('CONFIG:');

    return json(
      {
        error: isConfig
          ? 'Google Wallet is not configured for this deployment.'
          : 'Unable to generate the Google Wallet pass.',
      },
      isConfig ? 503 : 500,
      origin,
    );
  }
});
