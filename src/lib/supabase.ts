/**
 * DigiCon Supabase client.
 *
 * SECURITY
 * --------
 * No credentials are hardcoded. Configuration is read from Vite environment
 * variables, which must be prefixed with `VITE_` to be exposed to the browser
 * bundle. The anon key is a *public* key: it is safe in the client only
 * because Row Level Security is enforced on every table. Never place the
 * service-role key behind a `VITE_` prefix.
 *
 * Required:
 *   VITE_SUPABASE_URL
 *   VITE_SUPABASE_ANON_KEY
 *
 * IMPORTANT (Vite): environment variables must be accessed as *static*
 * property reads (`import.meta.env.VITE_FOO`). Dynamic indexing such as
 * `import.meta.env[key]` is not reliably statically replaced at build time
 * and can silently resolve to `undefined` in a production bundle.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/* ------------------------------------------------------------------ */
/*  Configuration                                                      */
/* ------------------------------------------------------------------ */

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL ?? '').trim();
const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim();

export const missingSupabaseConfig: string[] = [
  SUPABASE_URL ? null : 'VITE_SUPABASE_URL',
  SUPABASE_ANON_KEY ? null : 'VITE_SUPABASE_ANON_KEY',
].filter((value): value is string => value !== null);

export const isSupabaseConfigured = missingSupabaseConfig.length === 0;

if (!isSupabaseConfigured) {
  // Do NOT throw at module scope. A throw here happens before React mounts
  // and produces a blank white page with no diagnostics for the operator.
  // The app renders an actionable configuration screen instead.
  console.error(
    `[DigiCon] Missing environment variables: ${missingSupabaseConfig.join(', ')}. ` +
      'Copy .env.example to .env and provide your Supabase project credentials.',
  );
}

/* ------------------------------------------------------------------ */
/*  Client                                                             */
/* ------------------------------------------------------------------ */

/**
 * When configuration is absent we still construct a client against a
 * syntactically valid placeholder so that importing modules do not explode.
 * `isSupabaseConfigured` is checked by the app shell before any route that
 * performs network calls is rendered.
 */
export const supabase: SupabaseClient = createClient(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY || 'public-anon-key-placeholder',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
    global: {
      headers: { 'x-application-name': 'digicon-web' },
    },
    realtime: { timeout: 20_000 },
  },
);

/* ------------------------------------------------------------------ */
/*  Row types — kept in sync with supabase/migrations                   */
/* ------------------------------------------------------------------ */

export type PlanId = 'startup' | 'starter' | 'growth' | 'enterprise';

export type SubscriptionStatus =
  | 'active'
  | 'approval_pending'
  | 'suspended'
  | 'cancelled'
  | 'expired';

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  company_name: string | null;
  language: string | null;
  region: string | null;
  avatar_url: string | null;
  role: 'owner' | 'admin' | 'member' | null;
  created_at: string;
  updated_at: string;
};

export type BusinessCard = {
  id: string;
  user_id: string;
  full_name: string;
  job_title: string;
  company: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  bio: string;
  photo_url: string;
  /** Legacy alias retained by the schema; `card_color` is authoritative. */
  logo_url: string;
  card_color: string;
  accent_color: string;
  design_template: string;
  font_family: string;
  is_active: boolean;
  share_count: number;
  edit_count: number;
  created_at: string;
  updated_at: string;
};

/**
 * Projection returned by the `public_business_cards` view.
 *
 * Deliberately excludes `user_id`, `share_count`, `edit_count`, `is_active`,
 * and timestamps: this shape is readable by anonymous visitors.
 */
export type PublicBusinessCard = Pick<
  BusinessCard,
  | 'id'
  | 'full_name'
  | 'job_title'
  | 'company'
  | 'email'
  | 'phone'
  | 'website'
  | 'address'
  | 'bio'
  | 'photo_url'
  | 'card_color'
  | 'accent_color'
  | 'design_template'
  | 'font_family'
>;

export type Contact = {
  id: string;
  user_id: string;
  card_id: string | null;
  full_name: string;
  email: string;
  phone: string;
  company: string;
  job_title: string;
  notes: string;
  status: 'new' | 'follow_up' | 'converted' | 'archived';
  source: string;
  consent_given: boolean;
  consent_date: string | null;
  synced_to_crm: boolean;
  created_at: string;
  updated_at: string;
};

export type EcoStats = {
  id: string;
  user_id: string;
  cards_shared: number;
  contacts_saved: number;
  paper_saved_sqm: number;
  trees_saved: number;
  carbon_reduced_kg: number;
  updated_at: string;
};

export type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
  threshold: number;
  category: string;
  created_at: string;
};

export type Subscription = {
  id: string;
  user_id: string;
  provider: string;
  provider_subscription_id: string;
  plan: PlanId;
  status: SubscriptionStatus;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
};

/* ------------------------------------------------------------------ */
/*  Server-authoritative capabilities                                  */
/* ------------------------------------------------------------------ */

/**
 * Capability names accepted by `public.digicon_has_capability`.
 *
 * Kept in sync with
 * supabase/migrations/20260830010000_server_authoritative_capabilities.sql.
 */
export type DigiConCapability = 'card.create' | 'card.edit' | 'wallet.export';

/** One row of `public.digicon_check_capability`. */
export type DigiConCapabilityCheck = {
  capability: string;
  allowed: boolean;
  plan: PlanId;
  code:
    | 'allowed'
    | 'authentication_required'
    | 'invalid_capability'
    | 'paid_plan_required'
    | 'limit_reached_or_forbidden'
    | 'capability_not_available';
};

/**
 * Ask the database whether the current user may perform `capability`.
 *
 * The entitlement helpers in `@/lib/entitlements` exist to shape the UI; they
 * are advisory only, because anything computed in the browser can be edited by
 * the person holding the browser. This RPC is the authoritative check and runs
 * `SECURITY DEFINER` against the caller's `auth.uid()`.
 *
 * Returns `null` when the check could not be completed (network failure, RPC
 * error, or an empty result set). Callers must treat `null` as "unknown" and
 * refuse the action rather than assuming it is permitted.
 */
export async function checkServerCapability(
  capability: DigiConCapability,
  resourceId?: string,
): Promise<DigiConCapabilityCheck | null> {
  const { data, error } = await supabase.rpc('digicon_check_capability', {
    p_capability: capability,
    p_resource_id: resourceId ?? null,
  });

  if (error) {
    console.error('[DigiCon] digicon_check_capability failed:', error);
    return null;
  }

  // The function `RETURNS TABLE`, so supabase-js yields an array of rows.
  const row = (Array.isArray(data) ? data[0] : data) as
    | DigiConCapabilityCheck
    | undefined;

  return row ?? null;
}
