/*
 * DigiCon ORDER 1 — trusted card mutation boundary
 * =================================================
 *
 * Browser code must not be the final authorization layer for card writes.
 * These SECURITY DEFINER RPCs are the trusted application mutation boundary.
 *
 * The functions:
 *   1. derive the actor from auth.uid();
 *   2. never accept user_id from the client;
 *   3. re-check capability on the server;
 *   4. perform the actual INSERT/UPDATE;
 *   5. remain protected by enforce_card_limits() for resource limits.
 *
 * RLS remains the row-access boundary. The functions do not weaken ownership:
 * every update explicitly targets the authenticated user's own card.
 */

CREATE OR REPLACE FUNCTION create_business_card(
  p_full_name text,
  p_job_title text DEFAULT '',
  p_company text DEFAULT '',
  p_phone text DEFAULT '',
  p_email text DEFAULT '',
  p_website text DEFAULT '',
  p_address text DEFAULT '',
  p_bio text DEFAULT '',
  p_card_color text DEFAULT '#007AFF',
  p_accent_color text DEFAULT '#5856D6',
  p_design_template text DEFAULT 'professional',
  p_font_family text DEFAULT 'Inter',
  p_photo_url text DEFAULT ''
)
RETURNS business_cards
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_card business_cards;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.' USING ERRCODE = '28000';
  END IF;

  IF btrim(coalesce(p_full_name, '')) = '' THEN
    RAISE EXCEPTION 'Full name is required.' USING ERRCODE = '22023';
  END IF;

  IF length(p_full_name) > 200
     OR length(coalesce(p_job_title, '')) > 200
     OR length(coalesce(p_company, '')) > 200
     OR length(coalesce(p_phone, '')) > 50
     OR length(coalesce(p_email, '')) > 320
     OR length(coalesce(p_website, '')) > 500
     OR length(coalesce(p_address, '')) > 500
     OR length(coalesce(p_bio, '')) > 2000
     OR length(coalesce(p_photo_url, '')) > 2000 THEN
    RAISE EXCEPTION 'One or more card fields exceed the allowed length.'
      USING ERRCODE = '22023';
  END IF;

  IF NOT digicon_has_capability(v_user_id, 'card.create', NULL) THEN
    RAISE EXCEPTION 'Your current DigiCon entitlement does not allow another card.'
      USING ERRCODE = '42501';
  END IF;

  INSERT INTO business_cards (
    user_id,
    full_name,
    job_title,
    company,
    phone,
    email,
    website,
    address,
    bio,
    card_color,
    accent_color,
    design_template,
    font_family,
    photo_url,
    is_active,
    share_count
  )
  VALUES (
    v_user_id,
    btrim(p_full_name),
    btrim(coalesce(p_job_title, '')),
    btrim(coalesce(p_company, '')),
    btrim(coalesce(p_phone, '')),
    lower(btrim(coalesce(p_email, ''))),
    btrim(coalesce(p_website, '')),
    btrim(coalesce(p_address, '')),
    btrim(coalesce(p_bio, '')),
    coalesce(nullif(btrim(p_card_color), ''), '#007AFF'),
    coalesce(nullif(btrim(p_accent_color), ''), '#5856D6'),
    coalesce(nullif(btrim(p_design_template), ''), 'professional'),
    coalesce(nullif(btrim(p_font_family), ''), 'Inter'),
    btrim(coalesce(p_photo_url, '')),
    true,
    0
  )
  RETURNING * INTO v_card;

  RETURN v_card;
END;
$$;

REVOKE ALL ON FUNCTION create_business_card(
  text,text,text,text,text,text,text,text,text,text,text,text,text
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION create_business_card(
  text,text,text,text,text,text,text,text,text,text,text,text,text
) TO authenticated;

COMMENT ON FUNCTION create_business_card IS
  'Trusted DigiCon card creation boundary. Actor is auth.uid(); card limits are additionally enforced by the database trigger.';

CREATE OR REPLACE FUNCTION update_business_card(
  p_card_id uuid,
  p_full_name text,
  p_job_title text DEFAULT '',
  p_company text DEFAULT '',
  p_phone text DEFAULT '',
  p_email text DEFAULT '',
  p_website text DEFAULT '',
  p_address text DEFAULT '',
  p_bio text DEFAULT '',
  p_card_color text DEFAULT '#007AFF',
  p_accent_color text DEFAULT '#5856D6',
  p_design_template text DEFAULT 'professional',
  p_font_family text DEFAULT 'Inter',
  p_photo_url text DEFAULT ''
)
RETURNS business_cards
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_card business_cards;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.' USING ERRCODE = '28000';
  END IF;

  IF p_card_id IS NULL THEN
    RAISE EXCEPTION 'Card id is required.' USING ERRCODE = '22023';
  END IF;

  IF btrim(coalesce(p_full_name, '')) = '' THEN
    RAISE EXCEPTION 'Full name is required.' USING ERRCODE = '22023';
  END IF;

  IF length(p_full_name) > 200
     OR length(coalesce(p_job_title, '')) > 200
     OR length(coalesce(p_company, '')) > 200
     OR length(coalesce(p_phone, '')) > 50
     OR length(coalesce(p_email, '')) > 320
     OR length(coalesce(p_website, '')) > 500
     OR length(coalesce(p_address, '')) > 500
     OR length(coalesce(p_bio, '')) > 2000
     OR length(coalesce(p_photo_url, '')) > 2000 THEN
    RAISE EXCEPTION 'One or more card fields exceed the allowed length.'
      USING ERRCODE = '22023';
  END IF;

  IF NOT digicon_has_capability(v_user_id, 'card.edit', p_card_id) THEN
    RAISE EXCEPTION 'This card cannot be edited under your current DigiCon entitlement.'
      USING ERRCODE = '42501';
  END IF;

  UPDATE business_cards
  SET
    full_name = btrim(p_full_name),
    job_title = btrim(coalesce(p_job_title, '')),
    company = btrim(coalesce(p_company, '')),
    phone = btrim(coalesce(p_phone, '')),
    email = lower(btrim(coalesce(p_email, ''))),
    website = btrim(coalesce(p_website, '')),
    address = btrim(coalesce(p_address, '')),
    bio = btrim(coalesce(p_bio, '')),
    card_color = coalesce(nullif(btrim(p_card_color), ''), '#007AFF'),
    accent_color = coalesce(nullif(btrim(p_accent_color), ''), '#5856D6'),
    design_template = coalesce(nullif(btrim(p_design_template), ''), 'professional'),
    font_family = coalesce(nullif(btrim(p_font_family), ''), 'Inter'),
    photo_url = btrim(coalesce(p_photo_url, '')),
    is_active = true,
    updated_at = now()
  WHERE id = p_card_id
    AND user_id = v_user_id
  RETURNING * INTO v_card;

  IF v_card.id IS NULL THEN
    RAISE EXCEPTION 'Card not found or not owned by the current user.'
      USING ERRCODE = '42501';
  END IF;

  RETURN v_card;
END;
$$;

REVOKE ALL ON FUNCTION update_business_card(
  uuid,text,text,text,text,text,text,text,text,text,text,text,text
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION update_business_card(
  uuid,text,text,text,text,text,text,text,text,text,text,text,text
) TO authenticated;

COMMENT ON FUNCTION update_business_card IS
  'Trusted DigiCon card update boundary. Ownership and resource-specific entitlement are evaluated on the server.';

DO $$
BEGIN
  RAISE NOTICE 'DigiCon ORDER 1 trusted card mutation boundary installed.';
END $$;
