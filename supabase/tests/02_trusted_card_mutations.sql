/*
 * ORDER 1 — trusted card mutation signature/security assertions.
 *
 * Add this file to the existing Supabase test run once the migration stack is
 * applied.
 */

SELECT test.ok(
  'trusted RPC: create_business_card signature',
  EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'create_business_card'
      AND pg_get_function_identity_arguments(p.oid) =
        'p_full_name text, p_job_title text, p_company text, p_phone text, p_email text, p_website text, p_address text, p_bio text, p_card_color text, p_accent_color text, p_design_template text, p_font_family text, p_photo_url text'
  )
);

SELECT test.ok(
  'trusted RPC: update_business_card signature',
  EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'update_business_card'
      AND pg_get_function_identity_arguments(p.oid) =
        'p_card_id uuid, p_full_name text, p_job_title text, p_company text, p_phone text, p_email text, p_website text, p_address text, p_bio text, p_card_color text, p_accent_color text, p_design_template text, p_font_family text, p_photo_url text'
  )
);

SELECT test.ok(
  'trusted RPC: create executable by authenticated',
  has_function_privilege(
    'authenticated',
    'public.create_business_card(text,text,text,text,text,text,text,text,text,text,text,text,text)',
    'EXECUTE'
  )
);

SELECT test.ok(
  'trusted RPC: update executable by authenticated',
  has_function_privilege(
    'authenticated',
    'public.update_business_card(uuid,text,text,text,text,text,text,text,text,text,text,text,text)',
    'EXECUTE'
  )
);
