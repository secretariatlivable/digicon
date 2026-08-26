import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  company_name: string;
  role: string;
  language: string;
  region: string;
  avatar_url: string;
};

export type BusinessCard = {
  id: string;
  user_id: string;
  full_name: string;
  job_title: string;
  company: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  bio: string;
  card_color: string;
  logo_url: string;
  design_template: 'futuristic' | 'professional' | 'simple' | 'custom';
  font_family: string;
  photo_url: string;
  accent_color: string;
  is_active: boolean;
  share_count: number;
  created_at: string;
  updated_at: string;
};

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
  consent_given: boolean;
  consent_date: string | null;
  source: string;
  status: string;
  synced_to_crm: boolean;
  created_at: string;
  updated_at: string;
};

export type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
  threshold: number;
  category: string;
};

export type UserBadge = {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
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
