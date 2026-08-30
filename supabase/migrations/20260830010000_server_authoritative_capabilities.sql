/*
 * DigiCon ORDER 1 — server-authoritative capability boundary
 *
 * Safe prerequisite for the trusted card mutation RPCs.
 */

CREATE OR REPLACE FUNCTION public.digicon_has_capability(
  p_user_id uuid,
  p_capability text,
  p_resource_id uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_plan text;
  v_count integer;
  v_owner uuid;
  v_edits integer;
BEGIN
  IF p_user_id IS NULL OR p_capability IS NULL THEN
    RETURN false;
  END IF;

  v_plan := lower(coalesce(public.active_plan_for(p_user_id), 'startup'));

  CASE lower(btrim(p_capability))
    WHEN 'card.create' THEN
      IF v_plan IN ('growth', 'enterprise') THEN
        RETURN true;
      END IF;

      SELECT count(*) INTO v_count
      FROM public.business_cards
      WHERE user_id = p_user_id;

      IF v_plan = 'starter' THEN
        RETURN v_count < 3;
      END IF;

      RETURN v_count < 2;

    WHEN 'card.edit' THEN
      IF p_resource_id IS NULL THEN
        RETURN false;
      END IF;

      SELECT user_id, edit_count
        INTO v_owner, v_edits
      FROM public.business_cards
      WHERE id = p_resource_id;

      IF v_owner IS DISTINCT FROM p_user_id THEN
        RETURN false;
      END IF;

      IF v_plan IN ('growth', 'enterprise') THEN
        RETURN true;
      END IF;

      RETURN coalesce(v_edits, 0) < 2;

    WHEN 'wallet.export' THEN
      RETURN v_plan IN ('starter', 'growth', 'enterprise');

    ELSE
      RETURN false;
  END CASE;
END;
$$;

REVOKE ALL ON FUNCTION public.digicon_has_capability(uuid, text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.digicon_has_capability(uuid, text, uuid)
  TO authenticated;

CREATE OR REPLACE FUNCTION public.digicon_check_capability(
  p_capability text,
  p_resource_id uuid DEFAULT NULL
)
RETURNS TABLE (
  capability text,
  allowed boolean,
  plan text,
  code text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_plan text;
  v_allowed boolean;
  v_code text;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN QUERY
    SELECT lower(btrim(coalesce(p_capability, ''))), false,
           'startup'::text, 'authentication_required'::text;
    RETURN;
  END IF;

  v_plan := lower(coalesce(public.active_plan_for(v_user_id), 'startup'));

  IF p_capability IS NULL OR btrim(p_capability) = '' THEN
    RETURN QUERY
    SELECT ''::text, false, v_plan, 'invalid_capability'::text;
    RETURN;
  END IF;

  v_allowed := public.digicon_has_capability(
    v_user_id, p_capability, p_resource_id
  );

  v_code := CASE
    WHEN v_allowed THEN 'allowed'
    WHEN lower(btrim(p_capability)) = 'wallet.export'
      THEN 'paid_plan_required'
    WHEN lower(btrim(p_capability)) IN ('card.create', 'card.edit')
      THEN 'limit_reached_or_forbidden'
    ELSE 'capability_not_available'
  END;

  RETURN QUERY
  SELECT lower(btrim(p_capability)), v_allowed, v_plan, v_code;
END;
$$;

REVOKE ALL ON FUNCTION public.digicon_check_capability(text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.digicon_check_capability(text, uuid)
  TO authenticated;

CREATE OR REPLACE FUNCTION public.digicon_get_my_capabilities()
RETURNS TABLE (
  capability text,
  allowed boolean,
  plan text,
  code text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT * FROM public.digicon_check_capability('card.create', NULL)
  UNION ALL
  SELECT * FROM public.digicon_check_capability('wallet.export', NULL);
$$;

REVOKE ALL ON FUNCTION public.digicon_get_my_capabilities() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.digicon_get_my_capabilities()
  TO authenticated;
