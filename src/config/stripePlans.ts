/**
 * Stripe plan configuration.
 *
 * Deliberately contains **no** `price_...` identifiers. Each paid DigiCon plan
 * is addressed by a stable Stripe **lookup key**; the Edge Function resolves
 * the key to a live Price at checkout time. That means pricing can change in
 * the Stripe dashboard — a new Price with the same lookup key — without a code
 * change or a redeploy, and no environment-specific IDs leak into the bundle.
 *
 * Setup (once, per Stripe environment):
 *   1. Create a recurring Price for each plan below.
 *   2. Set its `lookup_key` to the value in `stripeLookupKey`.
 *   3. Ship. Nothing here changes.
 *
 * The only Stripe value the browser ever sees is the publishable key, which is
 * public by design. The secret/restricted key lives exclusively in Supabase
 * Edge Function secrets and is never referenced from `src/`.
 */

import type { DigiConPlanId } from '@/config/paypalPlans';

/** DigiCon plans that can be purchased self-serve through Stripe. */
export type StripePlanId = Extract<
  DigiConPlanId,
  'starter' | 'growth' | 'enterprise'
>;

export interface StripePlanConfig {
  id: StripePlanId;
  /** `lookup_key` set on the recurring Price in the Stripe dashboard. */
  stripeLookupKey: string;
  /** Shown on the button while redirecting. */
  label: string;
}

export const DIGICON_STRIPE_PLANS: Readonly<
  Record<StripePlanId, StripePlanConfig>
> = {
  starter: {
    id: 'starter',
    stripeLookupKey: 'digicon_starter_monthly',
    label: 'Starter',
  },
  growth: {
    id: 'growth',
    stripeLookupKey: 'digicon_growth_monthly',
    label: 'Growth',
  },
  enterprise: {
    id: 'enterprise',
    stripeLookupKey: 'digicon_enterprise_monthly',
    label: 'Enterprise',
  },
} as const;

export function isStripePlanId(value: string): value is StripePlanId {
  return value === 'starter' || value === 'growth' || value === 'enterprise';
}

export function getStripePlan(id: StripePlanId): StripePlanConfig {
  return DIGICON_STRIPE_PLANS[id];
}

/**
 * The publishable key is optional for this integration.
 *
 * Redirecting to Stripe-hosted Checkout only needs the session URL the Edge
 * Function returns, so we do not load Stripe.js on the landing page at all —
 * that keeps a third-party script off the critical path. The key is read here
 * only so a future embedded Payment Element has one place to find it.
 */
export const STRIPE_PUBLISHABLE_KEY = (
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? ''
).trim();

/** Where the Edge Functions live, derived from the Supabase project URL. */
export const STRIPE_CHECKOUT_FUNCTION = 'stripe-create-checkout-session';
