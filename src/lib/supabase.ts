/**
 * DigiCon Supabase client.
 *
 * Browser-safe configuration only:
 *   VITE_SUPABASE_URL
 *   VITE_SUPABASE_ANON_KEY
 *
 * Never place service-role keys, PayPal secrets, Apple signing keys, or
 * Google service-account private keys in VITE_* variables.
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabaseConfigError =
  !supabaseUrl || !supabaseAnonKey
    ? "DigiCon is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
    : null;

export const supabase = createClient(
  supabaseUrl || "https://placeholder.invalid",
  supabaseAnonKey || "missing-anon-key",
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: "pkce",
    },
    realtime: {
      timeout: 20000,
    },
  },
);

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  company_name: string | null;
  language: string | null;
  region: string | null;
  avatar_url: string | null;
  role: "owner" | "admin" | "member" | null;
  created_at: string;
  updated_at: string;
  plan?: "startup" | "starter" | "growth" | "enterprise" | null;
  is_active_subscription?: boolean | null;
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
  theme_color: string;
  card_color: string;
  accent_color: string;
  design_template: string;
  font_family: string;
  is_active: boolean;
  share_count: number;
  created_at: string;
  updated_at: string;
};

export type Contact = {
  id: string;
  user_id: string;
  card_id?: string | null;
  full_name: string;
  email: string;
  phone: string;
  company: string | null;
  job_title: string | null;
  notes: string | null;
  status: "new" | "follow_up" | "converted" | "archived";
  source: string;
  consent_given: boolean;
  consent_date: string | null;
  synced_to_crm: boolean;
  created_at: string;
  updated_at: string;
};

export type EcoStats = {
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
  category?: string;
  created_at: string;
};
