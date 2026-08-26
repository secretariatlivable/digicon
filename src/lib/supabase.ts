/**
 * DigiCon Supabase Client
 * 
 * SECURITY: This file NO LONGER contains any hardcoded credentials.
 * All configuration is loaded from environment variables at runtime.
 * 
 * Required env vars (VITE_ prefix required for Vite client-side exposure):
 *   - VITE_SUPABASE_URL
 *   - VITE_SUPABASE_ANON_KEY
 * 
 * Never commit .env files to Git. See .env.example for the template.
 */

import { createClient } from '@supabase/supabase-js';

/* ------------------------------------------------------------------ */
/*  Runtime environment validation                                      */
/* ------------------------------------------------------------------ */

function getEnvVar(key: string): string {
  const value = import.meta.env[key];
  if (!value || value.trim() === '') {
    throw new Error(
      `[DigiCon Config] Missing required environment variable: ${key}\n` +
      `Ensure you have copied .env.example to .env and filled in your Supabase credentials.\n` +
      `For Vite, variables must be prefixed with VITE_ to be exposed to the client bundle.`
    );
  }
  return value.trim();
}

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

/* ------------------------------------------------------------------ */
/*  Client initialization                                               */
/* ------------------------------------------------------------------ */

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    timeout: 20000,
  },
});

/* ------------------------------------------------------------------ */
/*  Database types                                                      */
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
  created_at: string;
};
