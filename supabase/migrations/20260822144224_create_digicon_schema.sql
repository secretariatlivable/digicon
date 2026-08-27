/*
# DigiCon Core Schema

## Overview
Creates the foundational database tables for DigiCon, a digital business card and CRM platform for Philippine SMEs and startups.

## New Tables
1. `profiles` - Extends auth.users with company info, language preference, region, and role
2. `business_cards` - Digital business cards created by users
3. `contacts` - Leads/contacts captured via business cards (with consent tracking)
4. `badges` - Gamification badge definitions
5. `user_badges` - Badges earned by users
6. `eco_stats` - Eco-impact metrics per user (paper saved, trees saved, carbon reduced)

## Security
- RLS enabled on all tables
- All tables are owner-scoped (user_id) with authenticated-only access
- Owner columns default to auth.uid() so inserts work without explicit user_id
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL DEFAULT '',
  company_name text DEFAULT '',
  role text NOT NULL DEFAULT 'owner',
  language text NOT NULL DEFAULT 'en',
  region text NOT NULL DEFAULT 'metro-manila',
  avatar_url text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Business cards table
CREATE TABLE IF NOT EXISTS business_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  job_title text NOT NULL DEFAULT '',
  company text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  website text DEFAULT '',
  address text DEFAULT '',
  bio text DEFAULT '',
  card_color text NOT NULL DEFAULT '#007AFF',
  logo_url text DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  share_count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE business_cards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_cards" ON business_cards;
CREATE POLICY "select_own_cards" ON business_cards FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_cards" ON business_cards;
CREATE POLICY "insert_own_cards" ON business_cards FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_cards" ON business_cards;
CREATE POLICY "update_own_cards" ON business_cards FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_cards" ON business_cards;
CREATE POLICY "delete_own_cards" ON business_cards FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Contacts table (captured leads)
CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id uuid REFERENCES business_cards(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  company text DEFAULT '',
  job_title text DEFAULT '',
  notes text DEFAULT '',
  consent_given boolean NOT NULL DEFAULT false,
  consent_date timestamptz,
  source text NOT NULL DEFAULT 'qr',
  status text NOT NULL DEFAULT 'new',
  synced_to_crm boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_contacts" ON contacts;
CREATE POLICY "select_own_contacts" ON contacts FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_contacts" ON contacts;
CREATE POLICY "insert_own_contacts" ON contacts FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_contacts" ON contacts;
CREATE POLICY "update_own_contacts" ON contacts FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_contacts" ON contacts;
CREATE POLICY "delete_own_contacts" ON contacts FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Badges table (definitions)
CREATE TABLE IF NOT EXISTS badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text NOT NULL,
  icon text NOT NULL DEFAULT 'Award',
  threshold integer NOT NULL DEFAULT 1,
  category text NOT NULL DEFAULT 'eco',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_all_badges" ON badges;
CREATE POLICY "select_all_badges" ON badges FOR SELECT
  TO authenticated USING (true);

-- User badges table (earned badges)
CREATE TABLE IF NOT EXISTS user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id uuid NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at timestamptz DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_user_badges" ON user_badges;
CREATE POLICY "select_own_user_badges" ON user_badges FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_user_badges" ON user_badges;
CREATE POLICY "insert_own_user_badges" ON user_badges FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_user_badges" ON user_badges;
CREATE POLICY "delete_own_user_badges" ON user_badges FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Eco stats table
CREATE TABLE IF NOT EXISTS eco_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  cards_shared integer NOT NULL DEFAULT 0,
  contacts_saved integer NOT NULL DEFAULT 0,
  paper_saved_sqm real NOT NULL DEFAULT 0,
  trees_saved real NOT NULL DEFAULT 0,
  carbon_reduced_kg real NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE eco_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_eco_stats" ON eco_stats;
CREATE POLICY "select_own_eco_stats" ON eco_stats FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_eco_stats" ON eco_stats;
CREATE POLICY "insert_own_eco_stats" ON eco_stats FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_eco_stats" ON eco_stats;
CREATE POLICY "update_own_eco_stats" ON eco_stats FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Insert default badges
INSERT INTO badges (name, description, icon, threshold, category) VALUES
  ('First Step', 'Shared your first digital card', 'Sparkles', 1, 'eco'),
  ('Eco Warrior', 'Saved 10 paper cards by going digital', 'Leaf', 10, 'eco'),
  ('Tree Hugger', 'Saved 50 paper cards - a tree thanks you', 'TreePine', 50, 'eco'),
  ('Carbon Crusher', 'Reduced 1kg of carbon footprint', 'Factory', 25, 'eco'),
  ('Network Builder', 'Captured 25 contacts', 'Users', 25, 'network'),
  ('Connector', 'Captured 100 contacts', 'Network', 100, 'network'),
  ('CRM Master', 'Synced 50 contacts to CRM', 'RefreshCw', 50, 'crm'),
  ('Sustainability Star', 'Saved 100 paper cards', 'Star', 100, 'eco')
ON CONFLICT (name) DO NOTHING;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_business_cards_user_id ON business_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_eco_stats_user_id ON eco_stats(user_id);
