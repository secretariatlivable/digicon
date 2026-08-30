/**
 * DigiCon Supabase client.
 *
 * SECURITY
 * --------
 * No credentials are hardcoded. Configuration is read from Vite environment
 * variables, which must be prefixed with `VITE_` to be exposed to the browser
 * bundle.
 *
 * The anon key is a public key. It is safe in the browser only because
 * authorization is enforced server-side through PostgreSQL functions, RLS,
 * ownership checks, and entitlement checks.
 *
 * NEVER expose a Supabase service-role key through VITE_ environment variables.
 *
 * Required:
 *   VITE_SUPABASE_URL
 *   VITE_SUPABASE_ANON_KEY
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/* ------------------------------------------------------------------ */
/* Configuration                                                       */
/* ------------------------------------------------------------------ */

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL ?? '').trim();
const SUPABASE_ANON_KEY = (
  import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''
).trim();

export const missingSupabaseConfig: string[] = [
  SUPABASE_URL ? null : 'VITE_SUPABASE_URL',
  SUPABASE_ANON_KEY ? null : 'VITE_SUPABASE_ANON_KEY',
].filter((value): value is string => value !== null);

export const isSupabaseConfigured =
  missingSupabaseConfig.length === 0;

if (!isSupabaseConfigured) {
  console.error(
    `[DigiCon] Missing environment variables: ${missingSupabaseConfig.join(
      ', ',
    )}. ` +
      'Copy .env.example to .env and provide your Supabase project credentials.',
  );
}

/* ------------------------------------------------------------------ */
/* Client                                                              */
/* ------------------------------------------------------------------ */

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
      headers: {
        'x-application-name': 'digicon-web',
      },
    },
    realtime: {
      timeout: 20_000,
    },
  },
);

/* ------------------------------------------------------------------ */
/* Domain types                                                        */
/* ------------------------------------------------------------------ */

export type PlanId =
  | 'startup'
  | 'starter'
  | 'growth'
  | 'enterprise';

export type SubscriptionStatus =
  | 'active'
  | 'approval_pending'
  | 'suspended'
  | 'cancelled'
  | 'expired';

/**
 * Server-authorized capabilities currently used by the frontend.
 *
 * Keep this list deliberately small and synchronized with the database
 * capability registry.
 */
export type DigiConCapability =
  | 'card.create'
  | 'card.edit'
  | 'wallet.export';

export type CapabilityResultCode =
  | 'allowed'
  | 'authentication_required'
  | 'paid_plan_required'
  | 'capability_not_available'
  | 'limit_reached_or_forbidden';

export type ServerCapabilityResult = {
  capability: DigiConCapability;
  allowed: boolean;
  plan: PlanId;
  code: CapabilityResultCode;
};

/* ------------------------------------------------------------------ */
/* Capability authority                                                */
/* ------------------------------------------------------------------ */

/**
 * Performs a server-side capability preflight.
 *
 * IMPORTANT:
 * This function is NOT the final authorization boundary.
 *
 * It exists so the UI can provide an immediate, understandable response
 * before attempting a mutation or wallet operation.
 *
 * The trusted RPC / Edge Function MUST independently repeat:
 *   - authentication checks
 *   - capability checks
 *   - ownership checks
 *   - entitlement checks
 *   - resource validation
 *
 * Never use a client-side boolean as proof of authorization.
 */
export async function checkServerCapability(
  capability: DigiConCapability,
  resourceId?: string,
): Promise<ServerCapabilityResult | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    return {
      capability,
      allowed: false,
      plan: 'startup',
      code: 'authentication_required',
    };
  }

  const { data, error } = await supabase.rpc(
    'digicon_check_capability',
    {
      p_capability: capability,
      p_resource_id: resourceId ?? null,
    },
  );

  if (error) {
    console.error(
      '[DigiCon] Server capability check failed:',
      error,
    );

    return null;
  }

  const result = (
    Array.isArray(data) ? data[0] : data
  ) as
    | {
        capability?: string;
        allowed?: boolean;
        plan?: string;
        code?: string;
      }
    | null
    | undefined;

  if (!result) {
    return null;
  }

  const plan: PlanId =
    result.plan === 'starter' ||
    result.plan === 'growth' ||
    result.plan === 'enterprise'
      ? result.plan
      : 'startup';

  const code: CapabilityResultCode =
    result.code === 'allowed' ||
    result.code === 'authentication_required' ||
    result.code === 'paid_plan_required' ||
    result.code === 'capability_not_available' ||
    result.code === 'limit_reached_or_forbidden'
      ? result.code
      : result.allowed
        ? 'allowed'
        : 'capability_not_available';

  return {
    capability,
    allowed: Boolean(result.allowed),
    plan,
    code,
  };
}

/* ------------------------------------------------------------------ */
/* Row types                                                           */
/* ------------------------------------------------------------------ */

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
  /** Legacy schema alias. `card_color` is authoritative. */
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
