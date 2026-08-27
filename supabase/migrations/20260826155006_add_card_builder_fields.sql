/*
# Add Card Builder Fields

## Overview
Adds new columns to the business_cards table to support the upgraded card builder:
- design_template: card visual style preset (futuristic, professional, simple, custom)
- font_family: font choice for the card
- photo_url: user-uploaded profile photo
- accent_color: secondary accent color for custom designs

## Modified Tables
1. `business_cards`
   - `design_template` (text, default 'professional') - which visual preset to use
   - `font_family` (text, default 'Inter') - font choice for card text
   - `photo_url` (text, default '') - URL of uploaded profile photo
   - `accent_color` (text, default '') - secondary accent color for custom designs

## Security
- No RLS policy changes needed; existing owner-scoped policies already cover these columns.
- All columns are nullable or have safe defaults.
*/

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'business_cards' AND column_name = 'design_template') THEN
    ALTER TABLE business_cards ADD COLUMN design_template text NOT NULL DEFAULT 'professional';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'business_cards' AND column_name = 'font_family') THEN
    ALTER TABLE business_cards ADD COLUMN font_family text NOT NULL DEFAULT 'Inter';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'business_cards' AND column_name = 'photo_url') THEN
    ALTER TABLE business_cards ADD COLUMN photo_url text NOT NULL DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'business_cards' AND column_name = 'accent_color') THEN
    ALTER TABLE business_cards ADD COLUMN accent_color text NOT NULL DEFAULT '';
  END IF;
END $$;
