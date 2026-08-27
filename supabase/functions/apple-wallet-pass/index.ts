import JSZip from "npm:jszip@3.10.1";
import forge from "npm:node-forge@1.3.1";
import { createClient } from "npm:@supabase/supabase-js@2";

const allowedOrigin =
  Deno.env.get("WALLET_ALLOWED_ORIGIN")?.trim() || "https://digicon.cards";

const corsHeaders = {
  "Access-Control-Allow-Origin": allowedOrigin,
  "Access-Control-Allow-Headers":
    "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Cache-Control": "no-store",
  Vary: "Origin",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });

function required(name: string): string {
  const value = Deno.env.get(name)?.trim();
  if (!value) {
    throw new Error(`Server configuration is missing: ${name}.`);
  }
  return value;
}

function normalizePem(value: string): string {
  return value.replace(/\\n/g, "\n").trim();
}

function hexToRgb(value: string): string {
  const hex = value.trim().replace(/^#/, "");

  if (!/^[0-9a-f]{6}$/i.test(hex)) {
    return "rgb(0,122,255)";
  }

  const red = Number.parseInt(hex.slice(0, 2), 16);
  const green = Number.parseInt(hex.slice(2, 4), 16);
  const blue = Number.parseInt(hex.slice(4, 6), 16);

  return `rgb(${red},${green},${blue})`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
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
  const digest = await crypto.subtle.digest("SHA-1", value);

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function safeFilename(value: string): string {
  return (
    value
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9._-]/g, "")
      .slice(0, 80) || "digicon-card"
  );
}

function getBearerToken(request: Request): string | null {
  const value = request.headers.get("Authorization") || "";
  return value.startsWith("Bearer ") ? value.slice(7).trim() : null;
}

async function authenticate(
  request: Request,
  admin: ReturnType<typeof createClient>,
) {
  const token = getBearerToken(request);

  if (!token) {
    throw new Error("Authentication required.");
  }

  const { data, error } = await admin.auth.getUser(token);

  if (error || !data.user) {
    throw new Error("Authentication required.");
  }

  return data.user;
}

async function getPublicAsset(path: string): Promise<Uint8Array | null> {
  const appUrl = Deno.env.get("PUBLIC_APP_URL")?.trim();
  if (!appUrl) return null;

  try {
    const response = await fetch(
      `${appUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`,
    );

    if (!response.ok) return null;

    return new Uint8Array(await response.arrayBuffer());
  } catch {
    return null;
  }
}

function makePassJson(
  card: Record<string, unknown>,
  publicUrl: string,
) {
  const fullName = String(card.full_name || "DigiCon Contact");
  const company = String(card.company || "DigiCon");
  const website = String(card.website || "");
  const phone = String(card.phone || "");
  const email = String(card.email || "");

  const genericFields = [
    {
      key: "name",
      label: "NAME",
      value: fullName,
    },
  ];

  if (card.job_title) {
    genericFields.push({
      key: "title",
      label: "TITLE",
      value: String(card.job_title),
    });
  }

  const secondaryFields = [];

  if (company) {
    secondaryFields.push({
      key: "company",
      label: "COMPANY",
      value: company,
    });
  }

  if (phone) {
    secondaryFields.push({
      key: "phone",
      label: "PHONE",
      value: phone,
      attributedValue: `<a href="tel:${escapeHtml(phone)}">${escapeHtml(phone)}</a>`,
    });
  }

  if (email) {
    secondaryFields.push({
      key: "email",
      label: "EMAIL",
      value: email,
      attributedValue: `<a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>`,
    });
  }

  const auxiliaryFields = [];

  if (website) {
    auxiliaryFields.push({
      key: "website",
      label: "WEB",
      value: website,
      attributedValue: `<a href="${escapeHtml(website)}">${escapeHtml(website)}</a>`,
    });
  }

  return {
    formatVersion: 1,
    passTypeIdentifier: required("APPLE_PASS_TYPE_IDENTIFIER"),
    serialNumber: String(card.id),
    teamIdentifier: required("APPLE_TEAM_IDENTIFIER"),
    organizationName: company,
    description: `${fullName} - DigiCon digital business card`,
    logoText: "DigiCon",
    foregroundColor: "rgb(255,255,255)",
    backgroundColor: hexToRgb(String(card.card_color || "#007AFF")),
    labelColor: "rgb(255,255,255)",
    barcodes: [
      {
        message: publicUrl,
        format: "PKBarcodeFormatQR",
        messageEncoding: "iso-8859-1",
      },
    ],
    generic: {
      primaryFields: genericFields,
      secondaryFields,
      auxiliaryFields,
      backFields: [
        {
          key: "card",
          label: "DIGITAL BUSINESS CARD",
          value: publicUrl,
        },
        ...(card.address
          ? [
              {
                key: "address",
                label: "ADDRESS",
                value: String(card.address),
              },
            ]
          : []),
      ],
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
  p7.content = forge.util.createBuffer(manifestJson, "utf8");

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

  return base64ToBytes(
    forge.util.encode64(
      forge.asn1.toDer(p7.toAsn1()).getBytes(),
    ),
  );
}

async function buildPkpass(
  card: Record<string, unknown>,
): Promise<Uint8Array> {
  const publicAppUrl = required("PUBLIC_APP_URL").replace(/\/$/, "");
  const publicUrl = `${publicAppUrl}/c/${encodeURIComponent(
    String(card.id),
  )}`;

  const passBytes = new TextEncoder().encode(
    JSON.stringify(makePassJson(card, publicUrl)),
  );

  const manifest: Record<string, string> = {
    "pass.json": await sha1Hex(passBytes),
  };

  const logo = await getPublicAsset("DigiCon.png");

  if (logo) {
    manifest["icon.png"] = await sha1Hex(logo);
    manifest["icon@2x.png"] = await sha1Hex(logo);
    manifest["logo.png"] = await sha1Hex(logo);
    manifest["logo@2x.png"] = await sha1Hex(logo);
  }

  const manifestJson = JSON.stringify(manifest);

  const signature = await signManifest(
    manifestJson,
    normalizePem(required("APPLE_CERTIFICATE_PEM")),
    normalizePem(required("APPLE_PRIVATE_KEY_PEM")),
    normalizePem(required("APPLE_WWDR_CERTIFICATE_PEM")),
  );

  const zip = new JSZip();

  zip.file("pass.json", passBytes);
  zip.file("manifest.json", manifestJson);
  zip.file("signature", signature);

  if (logo) {
    zip.file("icon.png", logo);
    zip.file("icon@2x.png", logo);
    zip.file("logo.png", logo);
    zip.file("logo@2x.png", logo);
  }

  return new Uint8Array(
    await zip.generateAsync({
      type: "uint8array",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    }),
  );
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return json({ error: "Method not allowed." }, 405);
  }

  try {
    const body = await request.json();
    const cardId = String(body?.card_id || "").trim();

    if (!/^[0-9a-f-]{36}$/i.test(cardId)) {
      return json({ error: "A valid card_id is required." }, 400);
    }

    const admin = createClient(
      required("SUPABASE_URL"),
      required("SUPABASE_SERVICE_ROLE_KEY"),
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      },
    );

    const user = await authenticate(request, admin);

    const { data: subscription, error: subscriptionError } = await admin
      .from("subscriptions")
      .select("plan,status")
      .eq("user_id", user.id)
      .eq("status", "ACTIVE")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (subscriptionError) {
      console.error("Wallet subscription lookup failed:", subscriptionError);
      return json(
        { error: "Unable to verify your DigiCon subscription." },
        500,
      );
    }

    if (!subscription) {
      return json(
        {
          error:
            "Wallet downloads require an active DigiCon subscription. Please upgrade your plan to continue.",
        },
        402,
      );
    }

    const { data: card, error } = await admin
      .from("business_cards")
      .select(
        "id,user_id,full_name,job_title,company,email,phone,website,address,card_color,accent_color,photo_url,is_active",
      )
      .eq("id", cardId)
      .eq("user_id", user.id)
      .eq("is_active", true)
      .maybeSingle();

    if (error) {
      console.error("Apple card lookup failed:", error);
      return json({ error: "Unable to load the business card." }, 500);
    }

    if (!card) {
      return json({ error: "Active business card not found." }, 404);
    }

    const pass = await buildPkpass(card);

    return json({
      passBase64: bytesToBase64(pass),
      filename: `${safeFilename(String(card.full_name))}.pkpass`,
    });
  } catch (cause) {
    console.error("Apple Wallet pass generation failed:", cause);

    return json(
      {
        error:
          cause instanceof Error
            ? cause.message
            : "Apple Wallet pass generation failed.",
      },
      500,
    );
  }
});
