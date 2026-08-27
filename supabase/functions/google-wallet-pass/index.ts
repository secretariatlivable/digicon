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

function base64UrlEncode(value: string | Uint8Array): string {
  let binary: string;

  if (typeof value === "string") {
    binary = value;
  } else {
    binary = String.fromCharCode(...value);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function utf8Base64Url(value: string): string {
  return base64UrlEncode(
    new TextEncoder().encode(value),
  );
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const normalized = pem
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\s+/g, "");

  const binary = atob(normalized);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes.buffer;
}

async function signJwt(
  header: Record<string, unknown>,
  payload: Record<string, unknown>,
  privateKeyPem: string,
): Promise<string> {
  const encodedHeader = utf8Base64Url(JSON.stringify(header));
  const encodedPayload = utf8Base64Url(JSON.stringify(payload));
  const unsigned = `${encodedHeader}.${encodedPayload}`;

  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(privateKeyPem),
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(unsigned),
  );

  return `${unsigned}.${base64UrlEncode(new Uint8Array(signature))}`;
}

function safeObjectSuffix(cardId: string): string {
  return cardId.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function hexColor(value: string): string {
  const hex = value.trim().replace(/^#/, "");
  return /^[0-9a-f]{6}$/i.test(hex) ? `#${hex}` : "#007AFF";
}

function buildGenericClass(
  issuerId: string,
  card: Record<string, unknown>,
) {
  return {
    id: `${issuerId}.digicon_card`,
    issuerName: "DigiCon",
    reviewStatus: "UNDER_REVIEW",
    title: "DigiCon Digital Business Card",
    hexBackgroundColor: hexColor(
      String(card.card_color || "#007AFF"),
    ),
    logo: {
      sourceUri: {
        uri: "https://digicon.cards/DigiCon.png",
      },
      contentDescription: {
        defaultValue: {
          language: "en-US",
          value: "DigiCon logo",
        },
      },
    },
  };
}

function buildGenericObject(
  issuerId: string,
  card: Record<string, unknown>,
  publicUrl: string,
) {
  const objectId = `${issuerId}.${safeObjectSuffix(String(card.id))}`;
  const classId = `${issuerId}.digicon_card`;

  const textModulesData = [];

  if (card.company) {
    textModulesData.push({
      id: "company",
      header: "Company",
      body: String(card.company),
    });
  }

  if (card.job_title) {
    textModulesData.push({
      id: "title",
      header: "Role",
      body: String(card.job_title),
    });
  }

  if (card.phone) {
    textModulesData.push({
      id: "phone",
      header: "Phone",
      body: String(card.phone),
    });
  }

  if (card.email) {
    textModulesData.push({
      id: "email",
      header: "Email",
      body: String(card.email),
    });
  }

  if (card.website) {
    textModulesData.push({
      id: "website",
      header: "Website",
      body: String(card.website),
    });
  }

  return {
    id: objectId,
    classId,
    state: "ACTIVE",
    hexBackgroundColor: hexColor(
      String(card.card_color || "#007AFF"),
    ),
    cardTitle: {
      defaultValue: {
        language: "en-US",
        value: "DigiCon",
      },
    },
    header: {
      defaultValue: {
        language: "en-US",
        value: String(card.full_name || "DigiCon Contact"),
      },
    },
    subheader: {
      defaultValue: {
        language: "en-US",
        value: "Digital Business Card",
      },
    },
    logo: {
      sourceUri: {
        uri: "https://digicon.cards/DigiCon.png",
      },
      contentDescription: {
        defaultValue: {
          language: "en-US",
          value: "DigiCon logo",
        },
      },
    },
    textModulesData,
    linksModuleData: {
      uris: [
        {
          id: "card",
          uri: publicUrl,
          description: "Open DigiCon digital card",
        },
      ],
    },
  };
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
      console.error("Google card lookup failed:", error);
      return json({ error: "Unable to load the business card." }, 500);
    }

    if (!card) {
      return json({ error: "Active business card not found." }, 404);
    }

    const serviceAccount = JSON.parse(
      required("GOOGLE_WALLET_SERVICE_ACCOUNT_JSON"),
    ) as {
      client_email?: string;
      private_key?: string;
    };

    if (!serviceAccount.client_email || !serviceAccount.private_key) {
      throw new Error(
        "Google Wallet service account configuration is incomplete.",
      );
    }

    const issuerId = required("GOOGLE_WALLET_ISSUER_ID");
    const publicUrl =
      `${required("PUBLIC_APP_URL").replace(/\/$/, "")}/c/` +
      encodeURIComponent(String(card.id));

    const now = Math.floor(Date.now() / 1000);

    const payload = {
      iss: serviceAccount.client_email,
      aud: "google",
      typ: "savetowallet",
      iat: now,
      origins: ["https://digicon.cards"],
      payload: {
        genericClasses: [buildGenericClass(issuerId, card)],
        genericObjects: [buildGenericObject(issuerId, card, publicUrl)],
      },
    };

    const token = await signJwt(
      {
        alg: "RS256",
        typ: "JWT",
      },
      payload,
      serviceAccount.private_key.replace(/\\n/g, "\n"),
    );

    return json({
      saveUrl: `https://pay.google.com/gp/v/save/${token}`,
    });
  } catch (cause) {
    console.error("Google Wallet pass generation failed:", cause);

    return json(
      {
        error:
          cause instanceof Error
            ? cause.message
            : "Google Wallet pass generation failed.",
      },
      500,
    );
  }
});
