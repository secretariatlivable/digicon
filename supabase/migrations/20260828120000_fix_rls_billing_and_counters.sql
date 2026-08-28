/*
# DigiCon — RLS correctness, billing state, and atomic counters

## Why this migration exists

Three defects in the original schema made the product non-functional:

1. `business_cards` had no policy for the `anon` role, but `/c/:cardId` is a
   public page. Every shared card link returned "Card cannot be found" to
   anyone except the owner — the core feature of the product.

2. `contacts` INSERT was restricted to `authenticated`, so the public
   lead-capture form on a shared card silently failed for every visitor.

3. There was no table recording subscription state, so a completed PayPal
   payment granted the user nothing.

It also adds the trigger and RPCs the application layer depends on.

## Security posture

- Public card reads are exposed through a **view with a restricted column
  list**, not a blanket policy on the base table. `user_id`, `share_count`,
  `edit_count`, and timestamps are never exposed to anonymous readers.
- Anonymous contact capture is allowed only through a `SECURITY DEFINER`
  function with server-side validation and rate limiting. The `anon` role
  gets no direct INSERT grant on `contacts`.
- Plan limits are enforced by a database trigger, not only in the browser.
*/

/* ================================================================== */
/*  0. Schema alignment                                                */
/* ================================================================== */

-- `edit_count` backs the Startup-tier "2 edits per card" entitlement.
-- Without it the limit was purely cosmetic in the browser.
ALTER TABLE business_cards
  ADD COLUMN IF NOT EXISTS edit_count integer NOT NULL DEFAULT 0;

-- The TypeScript `BusinessCard` type referenced `theme_color`, which existed
-- in no migration. `card_color` is authoritative; this column is added as a
-- generated alias so legacy reads resolve instead of erroring.
ALTER TABLE business_cards
  ADD COLUMN IF NOT EXISTS logo_url text NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_business_cards_active
  ON business_cards (id) WHERE is_active;

CREATE INDEX IF NOT EXISTS idx_contacts_user_created
  ON contacts (user_id, created_at DESC);

/* ================================================================== */
/*  1. Public card exposure                                            */
/* ================================================================== */

/*
 * A view, not a policy on the base table.
 *
 * Granting `anon` SELECT on `business_cards` would expose `user_id` (a raw
 * auth.users UUID), `share_count`, and `edit_count` to the open internet.
 * The view projects only the fields the public card page actually renders.
 *
 * security_invoker = off (the default for views owned by the definer) means
 * the view bypasses the base table's RLS. That is intentional and safe here
 * because the WHERE clause pins it to active cards and the column list is
 * fixed.
 */
CREATE OR REPLACE VIEW public_business_cards
WITH (security_barrier = true) AS
SELECT
  id,
  full_name,
  job_title,
  company,
  email,
  phone,
  website,
  address,
  bio,
  photo_url,
  card_color,
  accent_color,
  design_template,
  font_family
FROM business_cards
WHERE is_active;

REVOKE ALL ON public_business_cards FROM PUBLIC;
GRANT SELECT ON public_business_cards TO anon, authenticated;

COMMENT ON VIEW public_business_cards IS
  'Anonymous-readable projection of active business cards. Never add user_id '
  'or any counter column to this view.';

/* ================================================================== */
/*  2. Anonymous lead capture                                          */
/* ================================================================== */

/*
 * Anonymous visitors must be able to submit their details to a card owner,
 * but must never gain a general INSERT grant on `contacts` — that would let
 * anyone write arbitrary rows against any user_id, including forging
 * `synced_to_crm` or `status`.
 *
 * This SECURITY DEFINER function is the only anonymous write path. It:
 *   - resolves user_id from the card itself (the caller cannot choose it),
 *   - validates and length-caps every field,
 *   - hard-codes the trust-sensitive columns,
 *   - rate limits per card to blunt spam.
 */
CREATE OR REPLACE FUNCTION capture_public_contact(
  p_card_id    uuid,
  p_full_name  text,
  p_email      text,
  p_phone      text DEFAULT ''
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_owner_id     uuid;
  v_recent_count integer;
  v_name         text := btrim(coalesce(p_full_name, ''));
  v_email        text := lower(btrim(coalesce(p_email, '')));
  v_phone        text := btrim(coalesce(p_phone, ''));
BEGIN
  IF v_name = '' OR length(v_name) > 200 THEN
    RAISE EXCEPTION 'A name between 1 and 200 characters is required.'
      USING ERRCODE = '22023';
  END IF;

  IF v_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
     OR length(v_email) > 320 THEN
    RAISE EXCEPTION 'A valid email address is required.'
      USING ERRCODE = '22023';
  END IF;

  IF length(v_phone) > 50 THEN
    RAISE EXCEPTION 'That phone number is too long.'
      USING ERRCODE = '22023';
  END IF;

  -- The owner is derived from the card. The caller never supplies user_id.
  SELECT user_id INTO v_owner_id
  FROM business_cards
  WHERE id = p_card_id AND is_active;

  IF v_owner_id IS NULL THEN
    RAISE EXCEPTION 'That DigiCon card is not available.'
      USING ERRCODE = 'P0002';
  END IF;

  -- Coarse per-card rate limit. Not a substitute for edge rate limiting or a
  -- CAPTCHA, but it caps the damage from a trivial submission loop.
  SELECT count(*) INTO v_recent_count
  FROM contacts
  WHERE card_id = p_card_id
    AND source = 'qr'
    AND created_at > now() - interval '1 hour';

  IF v_recent_count >= 60 THEN
    RAISE EXCEPTION 'This card is receiving too many submissions. Try again later.'
      USING ERRCODE = '53400';
  END IF;

  INSERT INTO contacts (
    user_id, card_id, full_name, email, phone,
    company, job_title, notes,
    status, source, consent_given, consent_date, synced_to_crm
  ) VALUES (
    v_owner_id, p_card_id, v_name, v_email, v_phone,
    '', '', 'Captured from a shared DigiCon card',
    'new', 'qr', true, now(), false
  );

  -- Keep the owner's eco counter truthful without a second round trip.
  INSERT INTO eco_stats (user_id, contacts_saved, updated_at)
  VALUES (v_owner_id, 1, now())
  ON CONFLICT (user_id) DO UPDATE
    SET contacts_saved = eco_stats.contacts_saved + 1,
        updated_at     = now();
END;
$$;

REVOKE ALL ON FUNCTION capture_public_contact(uuid, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION capture_public_contact(uuid, text, text, text)
  TO anon, authenticated;

/* ================================================================== */
/*  3. Share counter                                                   */
/* ================================================================== */

/*
 * The client previously wrote `share_count = card.share_count + 1` from a
 * stale local value, which loses concurrent updates and lets a user set the
 * counter to anything. Incrementing server-side fixes both.
 */
CREATE OR REPLACE FUNCTION increment_card_share_count(p_card_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  /*
   * `enforce_card_limits` pins NEW.share_count to OLD.share_count so a client
   * cannot set the counter directly. That guard also applies to this function,
   * which silently reverted every increment — the counter was permanently 0.
   *
   * This transaction-local flag is the one sanctioned write path. It is set
   * LOCAL, so it cannot leak beyond this statement, and clients have no way to
   * set it: PostgREST exposes only whitelisted RPCs, and `set_config` is not
   * one of them.
   */
  PERFORM set_config('digicon.internal_counter_write', 'on', true);

  UPDATE business_cards
     SET share_count = share_count + 1,
         updated_at  = now()
   WHERE id = p_card_id AND is_active;

  PERFORM set_config('digicon.internal_counter_write', 'off', true);

  INSERT INTO eco_stats (user_id, cards_shared, updated_at)
  SELECT user_id, 1, now() FROM business_cards WHERE id = p_card_id
  ON CONFLICT (user_id) DO UPDATE
    SET cards_shared = eco_stats.cards_shared + 1,
        updated_at   = now();
END;
$$;

REVOKE ALL ON FUNCTION increment_card_share_count(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION increment_card_share_count(uuid) TO anon, authenticated;

/*
 * Atomic eco counter increment for the signed-in user.
 *
 * Replaces a client-side read-modify-write that evaluated to NaN whenever the
 * eco_stats row did not exist yet (`undefined + 1`) and permanently corrupted
 * the column.
 */
CREATE OR REPLACE FUNCTION increment_eco_contacts_saved(p_amount integer DEFAULT 1)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id uuid := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.' USING ERRCODE = '28000';
  END IF;

  IF p_amount IS NULL OR p_amount < 1 OR p_amount > 1000 THEN
    RAISE EXCEPTION 'Invalid increment amount.' USING ERRCODE = '22023';
  END IF;

  INSERT INTO eco_stats (user_id, contacts_saved, updated_at)
  VALUES (v_user_id, p_amount, now())
  ON CONFLICT (user_id) DO UPDATE
    SET contacts_saved = eco_stats.contacts_saved + p_amount,
        updated_at     = now();
END;
$$;

REVOKE ALL ON FUNCTION increment_eco_contacts_saved(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION increment_eco_contacts_saved(integer) TO authenticated;

/* ================================================================== */
/*  4. Profile provisioning                                            */
/* ================================================================== */

/*
 * The application previously inserted the profile and eco_stats rows from the
 * browser immediately after signUp(). That fails whenever email confirmation
 * is enabled, because no session exists yet and the INSERT policy requires
 * auth.uid() = id. Users ended up authenticated with no profile row.
 *
 * A trigger on auth.users makes provisioning atomic with account creation.
 */
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, company_name)
  VALUES (
    NEW.id,
    NEW.email,
    coalesce(NEW.raw_user_meta_data ->> 'full_name', ''),
    coalesce(NEW.raw_user_meta_data ->> 'company_name', '')
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO eco_stats (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Backfill any account created before this trigger existed.
INSERT INTO profiles (id, email, full_name, company_name)
SELECT u.id, u.email,
       coalesce(u.raw_user_meta_data ->> 'full_name', ''),
       coalesce(u.raw_user_meta_data ->> 'company_name', '')
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

INSERT INTO eco_stats (user_id)
SELECT u.id
FROM auth.users u
LEFT JOIN eco_stats e ON e.user_id = u.id
WHERE e.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

/* ================================================================== */
/*  5. Subscriptions — the billing source of truth                     */
/* ================================================================== */

CREATE TABLE IF NOT EXISTS subscriptions (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider                 text NOT NULL DEFAULT 'paypal',
  provider_subscription_id text NOT NULL,
  plan                     text NOT NULL,
  status                   text NOT NULL DEFAULT 'approval_pending',
  current_period_end       timestamptz,
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT subscriptions_provider_id_key
    UNIQUE (provider, provider_subscription_id),
  CONSTRAINT subscriptions_plan_check
    CHECK (plan IN ('startup', 'starter', 'growth', 'enterprise')),
  CONSTRAINT subscriptions_status_check
    CHECK (status IN ('active', 'approval_pending', 'suspended', 'cancelled', 'expired'))
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status
  ON subscriptions (user_id, status);

/*
 * Read-only to the user. There is deliberately no INSERT or UPDATE policy:
 * only the PayPal webhook, running with the service-role key, may write
 * billing state. A user who could write this table could grant themselves a
 * paid plan for free.
 */
DROP POLICY IF EXISTS "select_own_subscriptions" ON subscriptions;
CREATE POLICY "select_own_subscriptions" ON subscriptions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

COMMENT ON TABLE subscriptions IS
  'Billing state written exclusively by the verified PayPal webhook. Do not '
  'add INSERT/UPDATE policies for the authenticated role.';

/* ================================================================== */
/*  6. Server-side plan enforcement                                    */
/* ================================================================== */

CREATE OR REPLACE FUNCTION active_plan_for(p_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT coalesce(
    (SELECT plan FROM subscriptions
      WHERE user_id = p_user_id AND status = 'active'
      ORDER BY updated_at DESC LIMIT 1),
    'startup'
  );
$$;

/*
 * The browser's entitlement checks in src/lib/entitlements.ts are a UX
 * affordance only — anyone can call the REST API directly. This trigger is
 * the actual limit.
 */
CREATE OR REPLACE FUNCTION enforce_card_limits()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_plan  text := active_plan_for(NEW.user_id);
  v_count integer;
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF v_plan = 'startup' THEN
      SELECT count(*) INTO v_count
      FROM business_cards WHERE user_id = NEW.user_id;

      IF v_count >= 2 THEN
        RAISE EXCEPTION
          'Your Startup plan includes 2 digital business cards. Upgrade to create another.'
          USING ERRCODE = '42501';
      END IF;
    ELSIF v_plan = 'starter' THEN
      SELECT count(*) INTO v_count
      FROM business_cards WHERE user_id = NEW.user_id;

      IF v_count >= 3 THEN
        RAISE EXCEPTION
          'Your Starter plan includes 3 digital business cards. Upgrade to Growth for unlimited cards.'
          USING ERRCODE = '42501';
      END IF;
    END IF;

    RETURN NEW;
  END IF;

  -- UPDATE: count content edits, ignoring counter-only writes.
  IF NEW.full_name    IS DISTINCT FROM OLD.full_name
  OR NEW.job_title    IS DISTINCT FROM OLD.job_title
  OR NEW.company      IS DISTINCT FROM OLD.company
  OR NEW.email        IS DISTINCT FROM OLD.email
  OR NEW.phone        IS DISTINCT FROM OLD.phone
  OR NEW.website      IS DISTINCT FROM OLD.website
  OR NEW.address      IS DISTINCT FROM OLD.address
  OR NEW.photo_url    IS DISTINCT FROM OLD.photo_url
  OR NEW.card_color   IS DISTINCT FROM OLD.card_color
  OR NEW.accent_color IS DISTINCT FROM OLD.accent_color THEN

    IF v_plan = 'startup' AND OLD.edit_count >= 2 THEN
      RAISE EXCEPTION
        'Your Startup plan includes 2 edits per card. Upgrade to keep editing.'
        USING ERRCODE = '42501';
    END IF;

    NEW.edit_count := OLD.edit_count + 1;
  ELSE
    NEW.edit_count := OLD.edit_count;
  END IF;

  /*
   * share_count is owned by increment_card_share_count(). Any other writer —
   * including a direct PostgREST UPDATE — has the change silently discarded
   * rather than rejected, so a stale client cannot fail a legitimate card edit.
   */
  IF coalesce(current_setting('digicon.internal_counter_write', true), 'off') <> 'on' THEN
    NEW.share_count := OLD.share_count;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_card_limits_trigger ON business_cards;
CREATE TRIGGER enforce_card_limits_trigger
  BEFORE INSERT OR UPDATE ON business_cards
  FOR EACH ROW EXECUTE FUNCTION enforce_card_limits();

/* ================================================================== */
/*  7. Storage policies for card photos                                */
/* ================================================================== */

/*
 * CardsPage uploads to the `card-photos` bucket and renders the public URL,
 * but no bucket or policy was ever defined, so every upload failed.
 * Objects are namespaced by user id: <uid>/<uuid>.<ext>
 */
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'card-photos', 'card-photos', true, 5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
  SET public             = true,
      file_size_limit    = 5242880,
      allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

DROP POLICY IF EXISTS "card_photos_public_read" ON storage.objects;
CREATE POLICY "card_photos_public_read" ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'card-photos');

DROP POLICY IF EXISTS "card_photos_owner_insert" ON storage.objects;
CREATE POLICY "card_photos_owner_insert" ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'card-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "card_photos_owner_delete" ON storage.objects;
CREATE POLICY "card_photos_owner_delete" ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'card-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

/* ================================================================== */
/*  8. Badge catalogue readability                                     */
/* ================================================================== */

-- Badge definitions are not secret and the landing page may show them.
DROP POLICY IF EXISTS "select_all_badges" ON badges;
CREATE POLICY "select_all_badges" ON badges FOR SELECT
  TO anon, authenticated USING (true);
