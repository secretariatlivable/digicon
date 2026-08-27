import JSZip from 'npm:jszip@3.10.1';
import forge from 'npm:node-forge@1.3.1';
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('WALLET_ALLOWED_ORIGIN') || '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Cache-Control': 'no-store',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

function required(name: string): string {
  const value = Deno.env.get(name)?.trim();
  if (!value) throw new Error(`Missing required secret: ${name}`);
  return value;
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
      attributedValue: `<a href="tel:${phone}">${phone}</a>`,
    });
  }

  if (email) {
    secondaryFields.push({
      key: 'email',
      label: 'EMAIL',
      value: email,
      attributedValue: `<a href="mailto:${email}">${email}</a>`,
    });
  }

  const auxiliaryFields = [];
  if (website) {
    auxiliaryFields.push({
      key: 'website',
      label: 'WEB',
      value: website,
      attributedValue: `<a href="${website}">${website}</a>`,
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
    backgroundColor: String(card.card_color || 'rgb(0,122,255)'),
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

async function signManifest(
  manifestJson: string,
  certificatePem: string,
  privateKeyPem: string,
  wwdrPem: string,
): Promise<Uint8Array> {
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
  const signature = await signManifest(
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
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed.' }, 405);
  }

  try {
    const body = await request.json();
    const cardId = String(body?.card_id || '').trim();

    if (!cardId || !/^[0-9a-f-]{36}$/i.test(cardId)) {
      return json({ error: 'A valid card_id is required.' }, 400);
    }

    const supabaseUrl = required('SUPABASE_URL');
    const serviceRoleKey = required('SUPABASE_SERVICE_ROLE_KEY');

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

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
      return json({ error: 'Unable to load the business card.' }, 500);
    }

    if (!card) {
      return json({ error: 'Active business card not found.' }, 404);
    }

    const pass = await buildPkpass(card);

    return json({
      passBase64: bytesToBase64(pass),
      filename: `${safeFilename(String(card.full_name))}.pkpass`,
    });
  } catch (error) {
    console.error('Apple Wallet pass generation failed:', error);
    return json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Apple Wallet pass generation failed.',
      },
      500,
    );
  }
});
