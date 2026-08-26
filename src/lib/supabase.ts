import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pqjdhquhkuetyomgleul.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxamRocXVoa3VldHlvbWdsZXVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3NTU3NDUsImV4cCI6MjEwMzMzMTc0NX0.r8wIXWhwXMpDqN22muQaIidtrC4iv9vvqelWKXyGHC4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Contact = {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  source: string;
  status: string;
  created_at: string;
  consent_given: boolean;
};

export type EcoStats = {
  user_id: string;
  cards_shared: number;
  paper_saved_sqm: number;
  trees_saved: number;
  carbon_reduced_kg: number;
};
