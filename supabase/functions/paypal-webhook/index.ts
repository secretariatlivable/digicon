/**
 * DigiCon — PayPal subscription webhook.
 *
 * This function did not exist. Without it, a completed PayPal subscription
 * granted the user nothing: there was no `subscriptions` table, no entitlement
 * write, and no cancellation handling. Users could pay and receive no upgrade,
 * and could cancel and keep paid features forever.
 *
 * This is the **only** writer of billing state. The `subscriptions` table has
 * no INSERT or UPDATE policy for the `authenticated` role, so a user cannot
 * grant themselves a plan.
 *
 * Deployment:
 *   supabase functions deploy paypal-webhook --no-verify-jwt
 *
 * `--no-verify-jwt` is correct here — PayPal cannot present a Supabase JWT.
 * Authenticity comes from PayPal's own signature verification below, which is
 * mandatory: without it anyone could POST a forged "subscription activated"
 * event and upgrade any account for free.
 *
 * Required secrets:
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *   PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET
 *   PAYPAL_WEBHOOK_ID
 *   PAYPAL_STARTER_PLAN_ID, PAYPAL_GROWTH_PLAN_ID, PAYPAL_ENTERPRISE_PLAN_ID
 * Optional:
 *   PAYPAL_ENVIRONMENT  'sandbox' | 'production' (default: production)
 */

import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

type PlanId = 'startup' | 'starter' | 'growth' | 'enterprise';

type SubscriptionStatus =
  | 'active'
  | 'approval_pending'
  | 'suspended'
  | 'cancelled'
  | 'expired';

function required(name: string): string {
  const value = Deno.env.get(name)?.trim();
  if (!value) throw new Error(`CONFIG:${name}`);
  return value;
}

function paypalBaseUrl(): string {
  return (Deno.env.get('PAYPAL_ENVIRONMENT') ?? 'production') === 'sandbox'
    ? 'https://api-m.sandbox.paypal.com'
    : 'https://api-m.paypal.com';
}

async function getAccessToken(): Promise<string> {
  const clientId = required('PAYPAL_CLIENT_ID');
  const clientSecret = required('PAYPAL_CLIENT_SECRET');

  const response = await fetch(`${paypalBaseUrl()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) throw new Error('PayPal authentication failed.');

  const data = await response.json();
  if (typeof data.access_token !== 'string') {
    throw new Error('PayPal did not return an access token.');
  }

  return data.access_token;
}

/**
 * Verifies the webhook signature with PayPal.
 *
 * Skipping this would make the endpoint a free-upgrade API: a forged
 * BILLING.SUBSCRIPTION.ACTIVATED payload naming any `custom_id` would
 * activate that user's plan.
 */
async function verifySignature(
  headers: Headers,
  rawBody: string,
  accessToken: string,
): Promise<boolean> {
  const transmissionId = headers.get('paypal-transmission-id');
  const transmissionTime = headers.get('paypal-transmission-time');
  const transmissionSig = headers.get('paypal-transmission-sig');
  const certUrl = headers.get('paypal-cert-url');
  const authAlgo = headers.get('paypal-auth-algo');

  if (
    !transmissionId ||
    !transmissionTime ||
    !transmissionSig ||
    !certUrl ||
    !authAlgo
  ) {
    return false;
  }

  // Guard against a spoofed cert URL pointing at attacker-controlled hosting.
  let parsedCertUrl: URL;
  try {
    parsedCertUrl = new URL(certUrl);
  } catch {
    return false;
  }

  if (
    parsedCertUrl.protocol !== 'https:' ||
    !/(^|\.)paypal\.com$/i.test(parsedCertUrl.hostname)
  ) {
    console.error('Rejected webhook: untrusted cert URL host.');
    return false;
  }

  const response = await fetch(
    `${paypalBaseUrl()}/v1/notifications/verify-webhook-signature`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        auth_algo: authAlgo,
        cert_url: certUrl,
        transmission_id: transmissionId,
        transmission_sig: transmissionSig,
        transmission_time: transmissionTime,
        webhook_id: required('PAYPAL_WEBHOOK_ID'),
        // Must be the parsed object, not the raw string, per the PayPal API.
        webhook_event: JSON.parse(rawBody),
      }),
    },
  );

  if (!response.ok) {
    console.error('Signature verification call failed:', response.status);
    return false;
  }

  const result = await response.json();
  return result.verification_status === 'SUCCESS';
}

/** Maps a PayPal plan id back to a DigiCon plan using server-held secrets. */
function planFromPayPalId(paypalPlanId: string | undefined): PlanId | null {
  if (!paypalPlanId) return null;

  const map: Array<[string | undefined, PlanId]> = [
    [Deno.env.get('PAYPAL_STARTER_PLAN_ID')?.trim(), 'starter'],
    [Deno.env.get('PAYPAL_GROWTH_PLAN_ID')?.trim(), 'growth'],
    [Deno.env.get('PAYPAL_ENTERPRISE_PLAN_ID')?.trim(), 'enterprise'],
  ];

  for (const [configured, plan] of map) {
    if (configured && configured === paypalPlanId) return plan;
  }

  return null;
}

const STATUS_BY_EVENT: Record<string, SubscriptionStatus> = {
  'BILLING.SUBSCRIPTION.ACTIVATED': 'active',
  'BILLING.SUBSCRIPTION.RE-ACTIVATED': 'active',
  'BILLING.SUBSCRIPTION.CREATED': 'approval_pending',
  'BILLING.SUBSCRIPTION.UPDATED': 'active',
  'BILLING.SUBSCRIPTION.SUSPENDED': 'suspended',
  'BILLING.SUBSCRIPTION.CANCELLED': 'cancelled',
  'BILLING.SUBSCRIPTION.EXPIRED': 'expired',
  'BILLING.SUBSCRIPTION.PAYMENT.FAILED': 'suspended',
};

Deno.serve(async (request) => {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed.' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Always 200 on handled-but-ignored events so PayPal does not retry forever.
  const ok = (body: Record<string, unknown> = { received: true }) =>
    new Response(JSON.stringify(body), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  try {
    const rawBody = await request.text();

    const accessToken = await getAccessToken();
    const verified = await verifySignature(
      request.headers,
      rawBody,
      accessToken,
    );

    if (!verified) {
      console.error('Rejected webhook: signature verification failed.');
      return new Response(JSON.stringify({ error: 'Invalid signature.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const event = JSON.parse(rawBody);
    const eventType = String(event?.event_type ?? '');
    const status = STATUS_BY_EVENT[eventType];

    if (!status) {
      // Unrelated event type. Acknowledge without touching billing state.
      return ok({ received: true, ignored: eventType });
    }

    const resource = event?.resource ?? {};
    const subscriptionId = String(resource?.id ?? '').trim();

    if (!subscriptionId) {
      console.error('Webhook missing resource.id for', eventType);
      return ok({ received: true, ignored: 'missing_subscription_id' });
    }

    const admin = createClient(
      required('SUPABASE_URL'),
      required('SUPABASE_SERVICE_ROLE_KEY'),
      { auth: { persistSession: false, autoRefreshToken: false } },
    );

    /*
     * `custom_id` is set to the Supabase user id when the subscription is
     * created (see paypal-create-subscription). Where PayPal omits it on a
     * later event, fall back to the row we already stored.
     */
    let userId = String(resource?.custom_id ?? '').trim();

    if (!userId) {
      const { data: existing } = await admin
        .from('subscriptions')
        .select('user_id')
        .eq('provider', 'paypal')
        .eq('provider_subscription_id', subscriptionId)
        .maybeSingle();

      userId = existing?.user_id ?? '';
    }

    if (!userId) {
      console.error(
        'Unable to resolve a DigiCon user for subscription',
        subscriptionId,
      );
      return ok({ received: true, ignored: 'unresolved_user' });
    }

    const plan = planFromPayPalId(resource?.plan_id);

    if (!plan && status === 'active') {
      // Never activate a plan we cannot identify from server-held config.
      console.error('Unrecognised PayPal plan_id:', resource?.plan_id);
      return ok({ received: true, ignored: 'unknown_plan' });
    }

    const periodEnd =
      resource?.billing_info?.next_billing_time ??
      resource?.status_update_time ??
      null;

    const { error: upsertError } = await admin.from('subscriptions').upsert(
      {
        user_id: userId,
        provider: 'paypal',
        provider_subscription_id: subscriptionId,
        plan: plan ?? 'startup',
        status,
        current_period_end: periodEnd,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'provider,provider_subscription_id' },
    );

    if (upsertError) {
      console.error('Subscription upsert failed:', upsertError);
      // 500 so PayPal retries — losing an activation would be worse than a
      // duplicate delivery, which the unique constraint makes idempotent.
      return new Response(
        JSON.stringify({ error: 'Unable to record subscription state.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      );
    }

    return ok({ received: true, subscriptionId, status });
  } catch (cause) {
    console.error('paypal-webhook:', cause);

    const isConfig =
      cause instanceof Error && cause.message.startsWith('CONFIG:');

    return new Response(
      JSON.stringify({
        error: isConfig
          ? 'Billing is not configured for this deployment.'
          : 'Unexpected server error.',
      }),
      {
        status: isConfig ? 503 : 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
});
