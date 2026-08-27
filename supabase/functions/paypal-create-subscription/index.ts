import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

type RequestBody = {
  planId?: string;
  digiconPlanId?: "starter" | "growth";
  returnUrl?: string;
  cancelUrl?: string;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://digicon.cards",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: corsHeaders,
  });

async function getPayPalAccessToken(): Promise<string> {
  const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
  const clientSecret = Deno.env.get("PAYPAL_CLIENT_SECRET");
  const environment = Deno.env.get("PAYPAL_ENVIRONMENT") ?? "production";

  if (!clientId || !clientSecret) {
    throw new Error("PayPal server credentials are not configured.");
  }

  const baseUrl =
    environment === "sandbox"
      ? "https://api-m.sandbox.paypal.com"
      : "https://api-m.paypal.com";

  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error("PayPal authentication failed.");
  }

  const data = await response.json();

  if (typeof data.access_token !== "string") {
    throw new Error("PayPal did not return an access token.");
  }

  return data.access_token;
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return json({ error: "Method not allowed." }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      return json({ error: "Supabase server configuration is incomplete." }, 500);
    }

    const authorization = request.headers.get("Authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return json({ error: "Authentication required." }, 401);
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(
      authorization.slice("Bearer ".length).trim(),
    );

    if (userError || !user) {
      return json({ error: "Invalid authentication session." }, 401);
    }

    const body = (await request.json()) as RequestBody;

    if (body.digiconPlanId !== "starter" && body.digiconPlanId !== "growth") {
      return json({ error: "Invalid DigiCon subscription plan." }, 400);
    }

    const configuredPlanId =
      body.digiconPlanId === "starter"
        ? Deno.env.get("PAYPAL_STARTER_PLAN_ID")
        : Deno.env.get("PAYPAL_GROWTH_PLAN_ID");

    if (!configuredPlanId || body.planId !== configuredPlanId) {
      return json({ error: "Invalid or unconfigured PayPal plan." }, 400);
    }

    const origin = "https://digicon.cards";

    const returnUrl =
      body.returnUrl?.startsWith(origin)
        ? body.returnUrl
        : `${origin}/settings?billing=success`;

    const cancelUrl =
      body.cancelUrl?.startsWith(origin)
        ? body.cancelUrl
        : `${origin}/#pricing`;

    const environment = Deno.env.get("PAYPAL_ENVIRONMENT") ?? "production";
    const baseUrl =
      environment === "sandbox"
        ? "https://api-m.sandbox.paypal.com"
        : "https://api-m.paypal.com";

    const accessToken = await getPayPalAccessToken();

    const response = await fetch(
      `${baseUrl}/v1/billing/subscriptions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
          "PayPal-Request-Id": crypto.randomUUID(),
        },
        body: JSON.stringify({
          plan_id: configuredPlanId,
          custom_id: user.id,
          application_context: {
            brand_name: "DigiCon",
            locale: "en-PH",
            user_action: "SUBSCRIBE_NOW",
            return_url: returnUrl,
            cancel_url: cancelUrl,
          },
        }),
      },
    );

    if (!response.ok) {
      console.error(
        "PayPal subscription creation failed:",
        await response.text(),
      );
      return json(
        { error: "Unable to create the PayPal subscription." },
        502,
      );
    }

    const subscription = await response.json();

    if (typeof subscription.id !== "string") {
      return json(
        { error: "PayPal returned an invalid subscription response." },
        502,
      );
    }

    /*
     * Do not grant paid entitlements here.
     * Your verified PayPal webhook should be the source of truth for
     * ACTIVE/CANCELLED/SUSPENDED billing state.
     */
    return json({
      subscriptionId: subscription.id,
      status: subscription.status,
    });
  } catch (cause) {
    console.error("paypal-create-subscription:", cause);

    return json(
      {
        error:
          cause instanceof Error
            ? cause.message
            : "Unexpected server error.",
      },
      500,
    );
  }
});
