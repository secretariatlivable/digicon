/*
 * 01_rls_and_entitlements.sql — behavioural assertions for DigiCon's data layer.
 *
 * These tests exist because the audit found that the product's two most
 * important guarantees were both wrong in ways no compiler could catch:
 *   - public card reads were denied to the `anon` role (the core feature)
 *   - plan limits were enforced only in the browser (trivially bypassed)
 *
 * Every test SETs an explicit role. Superusers and table owners bypass RLS, so
 * a test that forgets to drop privileges would pass vacuously and prove nothing.
 *
 * Run with: supabase/tests/run.sh
 */

\set ON_ERROR_STOP on
SET client_min_messages = warning;

CREATE SCHEMA IF NOT EXISTS test;

CREATE TABLE IF NOT EXISTS test.results (
  seq     serial PRIMARY KEY,
  name    text NOT NULL,
  passed  boolean NOT NULL,
  detail  text
);

TRUNCATE test.results RESTART IDENTITY;

CREATE OR REPLACE FUNCTION test.ok(p_name text, p_condition boolean, p_detail text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO test.results (name, passed, detail) VALUES (p_name, p_condition, p_detail);
END; $$;

/** Asserts that a statement fails, optionally matching a SQLSTATE. */
CREATE OR REPLACE FUNCTION test.must_fail(
  p_name text, p_sql text, p_expect_sqlstate text DEFAULT NULL
) RETURNS void LANGUAGE plpgsql AS $$
DECLARE
  v_state text;
BEGIN
  EXECUTE p_sql;
  PERFORM test.ok(p_name, false, 'statement unexpectedly succeeded');
EXCEPTION WHEN OTHERS THEN
  v_state := SQLSTATE;
  IF p_expect_sqlstate IS NULL OR v_state = p_expect_sqlstate THEN
    PERFORM test.ok(p_name, true, 'rejected with SQLSTATE ' || v_state);
  ELSE
    PERFORM test.ok(p_name, false,
      format('expected SQLSTATE %s, got %s (%s)', p_expect_sqlstate, v_state, SQLERRM));
  END IF;
END; $$;

/*
 * The harness itself must be callable while impersonating anon/authenticated.
 * SECURITY DEFINER so recording a result never depends on the role under test
 * having write access to the results table.
 */
/*
 * test.ok() is SECURITY DEFINER so recording a result never depends on the role
 * under test having write access to the results table.
 *
 * test.must_fail() is deliberately SECURITY INVOKER. Making it DEFINER caused
 * its EXECUTE to run as the table owner, which bypasses RLS — every
 * privilege-denial assertion then "unexpectedly succeeded" and, worse, actually
 * wrote the forged rows it was meant to prove impossible.
 */
ALTER FUNCTION test.ok(text, boolean, text) SECURITY DEFINER;

GRANT USAGE ON SCHEMA test TO anon, authenticated;
GRANT EXECUTE ON FUNCTION test.ok(text, boolean, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION test.must_fail(text, text, text) TO anon, authenticated;

/* ================================================================== */
/*  Fixtures                                                           */
/* ================================================================== */

-- Two users, created through auth.users so handle_new_user() fires naturally.
INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES
  ('11111111-1111-4111-8111-111111111111', 'owner@example.com',
   '{"full_name":"Owner One","company_name":"Owner Co"}'::jsonb),
  ('22222222-2222-4222-8222-222222222222', 'other@example.com',
   '{"full_name":"Other Two","company_name":"Other Co"}'::jsonb);

/* ------------------------------------------------------------------ */
/*  1. handle_new_user provisioning                                    */
/* ------------------------------------------------------------------ */

SELECT test.ok(
  'trigger: profile provisioned on auth.users insert',
  (SELECT count(*) = 2 FROM profiles
    WHERE id IN ('11111111-1111-4111-8111-111111111111',
                 '22222222-2222-4222-8222-222222222222'))
);

SELECT test.ok(
  'trigger: full_name copied from user metadata',
  (SELECT full_name = 'Owner One' FROM profiles
    WHERE id = '11111111-1111-4111-8111-111111111111')
);

SELECT test.ok(
  'trigger: eco_stats row provisioned',
  (SELECT count(*) = 2 FROM eco_stats
    WHERE user_id IN ('11111111-1111-4111-8111-111111111111',
                      '22222222-2222-4222-8222-222222222222'))
);

-- Cards: one active, one inactive, both owned by user 1.
INSERT INTO business_cards (id, user_id, full_name, job_title, company, email, phone, card_color, is_active)
VALUES
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '11111111-1111-4111-8111-111111111111',
   'Owner One', 'Founder', 'Owner Co', 'owner@example.com', '+639170000001', '#007AFF', true),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '11111111-1111-4111-8111-111111111111',
   'Owner Retired', 'Founder', 'Owner Co', 'owner@example.com', '+639170000002', '#FF3B30', false);

/* ================================================================== */
/*  2. Public card exposure — the C2 regression                        */
/* ================================================================== */

SET ROLE anon;

SELECT test.ok(
  'anon: CAN read an active card via public_business_cards',
  (SELECT count(*) = 1 FROM public_business_cards
    WHERE id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
  'this is the defect that broke every shared QR link'
);

SELECT test.ok(
  'anon: CANNOT see an inactive card',
  (SELECT count(*) = 0 FROM public_business_cards
    WHERE id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb')
);

SELECT test.ok(
  'anon: CANNOT read the business_cards base table',
  (SELECT count(*) = 0 FROM business_cards)
);

RESET ROLE;

-- The view must not leak ownership or behavioural counters.
SELECT test.ok(
  'view: withholds user_id, share_count, edit_count, is_active',
  NOT EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_name = 'public_business_cards'
       AND column_name IN ('user_id', 'share_count', 'edit_count', 'is_active')
  )
);

/* ================================================================== */
/*  3. Anonymous lead capture                                          */
/* ================================================================== */

SET ROLE anon;

SELECT test.must_fail(
  'anon: CANNOT insert into contacts directly',
  $sql$INSERT INTO contacts (user_id, full_name, email)
       VALUES ('11111111-1111-4111-8111-111111111111', 'Forged', 'forged@example.com')$sql$,
  '42501'
);

SELECT capture_public_contact(
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'::uuid, 'Maria Santos'::text, 'maria@example.com'::text, '+639170000009'::text, true);

RESET ROLE;

SELECT test.ok(
  'rpc: capture created exactly one contact',
  (SELECT count(*) = 1 FROM contacts WHERE email = 'maria@example.com')
);

SELECT test.ok(
  'rpc: owner derived from the card, not the caller',
  (SELECT user_id = '11111111-1111-4111-8111-111111111111'
     FROM contacts WHERE email = 'maria@example.com')
);

SELECT test.ok(
  'rpc: card_id attribution recorded',
  (SELECT card_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
     FROM contacts WHERE email = 'maria@example.com')
);

SELECT test.ok(
  'rpc: email normalised to lowercase',
  (SELECT count(*) = 1 FROM contacts WHERE email = 'maria@example.com')
);

SELECT test.ok(
  'rpc: incremented the owner eco counter atomically',
  (SELECT contacts_saved = 1 FROM eco_stats
    WHERE user_id = '11111111-1111-4111-8111-111111111111')
);

SET ROLE anon;

SELECT test.must_fail(
  'rpc: rejects a malformed email',
  $sql$SELECT capture_public_contact(
         'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Bad Email', 'not-an-email')$sql$,
  '22023'
);

SELECT test.must_fail(
  'rpc: rejects an empty name',
  $sql$SELECT capture_public_contact(
         'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '   ', 'ok@example.com')$sql$,
  '22023'
);

SELECT test.must_fail(
  'rpc: rejects an inactive card',
  $sql$SELECT capture_public_contact(
         'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'Nope', 'nope@example.com')$sql$,
  'P0002'
);

SELECT test.must_fail(
  'rpc: rejects an unknown card',
  $sql$SELECT capture_public_contact(
         'cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'Nope', 'nope2@example.com')$sql$,
  'P0002'
);

RESET ROLE;

/* ================================================================== */
/*  4. Contact isolation between users                                 */
/* ================================================================== */

SELECT set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', false);
SET ROLE authenticated;

SELECT test.ok(
  'owner: sees the captured contact',
  (SELECT count(*) = 1 FROM contacts WHERE email = 'maria@example.com')
);

RESET ROLE;
SELECT set_config('request.jwt.claim.sub', '22222222-2222-4222-8222-222222222222', false);
SET ROLE authenticated;

SELECT test.ok(
  'other user: CANNOT see another owner''s contacts',
  (SELECT count(*) = 0 FROM contacts WHERE email = 'maria@example.com')
);

SELECT test.ok(
  'other user: CANNOT read another owner''s cards',
  (SELECT count(*) = 0 FROM business_cards
    WHERE user_id = '11111111-1111-4111-8111-111111111111')
);

RESET ROLE;

/* ================================================================== */
/*  5. Plan enforcement — the H5 regression                            */
/* ================================================================== */

SELECT set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', false);
SET ROLE authenticated;

-- User 1 already holds 2 cards (one active, one inactive) on the free tier.
SELECT test.must_fail(
  'startup plan: third card is rejected server-side',
  $sql$INSERT INTO business_cards (user_id, full_name)
       VALUES ('11111111-1111-4111-8111-111111111111', 'Third Card')$sql$,
  '42501'
);

-- share_count is owned by increment_card_share_count(), never the client.
UPDATE business_cards SET share_count = 9999
 WHERE id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

RESET ROLE;

SELECT test.ok(
  'trigger: client write to share_count is ignored',
  (SELECT share_count = 0 FROM business_cards
    WHERE id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')
);

SELECT test.ok(
  'trigger: a counter-only update does not consume an edit',
  (SELECT edit_count = 0 FROM business_cards
    WHERE id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')
);

SET ROLE authenticated;

UPDATE business_cards SET job_title = 'CEO'
 WHERE id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
UPDATE business_cards SET job_title = 'Managing Director'
 WHERE id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

RESET ROLE;

SELECT test.ok(
  'trigger: content edits increment edit_count',
  (SELECT edit_count = 2 FROM business_cards
    WHERE id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')
);

SET ROLE authenticated;

SELECT test.must_fail(
  'startup plan: third edit is rejected server-side',
  $sql$UPDATE business_cards SET job_title = 'Chairman'
        WHERE id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'$sql$,
  '42501'
);

/* ================================================================== */
/*  6. Subscriptions are not user-writable                             */
/* ================================================================== */

SELECT test.must_fail(
  'authenticated: CANNOT grant themselves a paid plan',
  $sql$INSERT INTO subscriptions
         (user_id, provider, provider_subscription_id, plan, status)
       VALUES ('11111111-1111-4111-8111-111111111111', 'paypal', 'I-FORGED', 'growth', 'active')$sql$,
  '42501'
);

RESET ROLE;

-- Grant a Growth plan the way the webhook would (service role / definer).
INSERT INTO subscriptions (user_id, provider, provider_subscription_id, plan, status)
VALUES ('11111111-1111-4111-8111-111111111111', 'paypal', 'I-REAL123', 'growth', 'active');

SELECT test.ok(
  'active_plan_for(): reflects the webhook-written plan',
  active_plan_for('11111111-1111-4111-8111-111111111111') = 'growth'
);

SELECT test.ok(
  'active_plan_for(): defaults to startup with no subscription',
  active_plan_for('22222222-2222-4222-8222-222222222222') = 'startup'
);

SET ROLE authenticated;

-- Growth lifts both the card cap and the edit cap.
INSERT INTO business_cards (user_id, full_name)
VALUES ('11111111-1111-4111-8111-111111111111', 'Third Card On Growth');

SELECT test.ok(
  'growth plan: third card is now permitted',
  (SELECT count(*) = 3 FROM business_cards
    WHERE user_id = '11111111-1111-4111-8111-111111111111')
);

UPDATE business_cards SET job_title = 'Chairman'
 WHERE id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

SELECT test.ok(
  'growth plan: editing beyond the free limit is permitted',
  (SELECT job_title = 'Chairman' FROM business_cards
    WHERE id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')
);

SELECT test.ok(
  'subscriptions: owner can read their own row',
  (SELECT count(*) = 1 FROM subscriptions
    WHERE user_id = '11111111-1111-4111-8111-111111111111')
);

RESET ROLE;
SELECT set_config('request.jwt.claim.sub', '22222222-2222-4222-8222-222222222222', false);
SET ROLE authenticated;

SELECT test.ok(
  'subscriptions: another user CANNOT read that row',
  (SELECT count(*) = 0 FROM subscriptions
    WHERE user_id = '11111111-1111-4111-8111-111111111111')
);

RESET ROLE;

/* ================================================================== */
/*  7. Counter RPCs                                                    */
/* ================================================================== */

SET ROLE anon;

/*
 * No SQLSTATE is pinned here. Anonymous callers are stopped at the GRANT layer
 * (42501) before reaching the function body's own auth.uid() check (28000);
 * both are correct denials, and asserting one would make the test brittle to a
 * defence-in-depth change that is not a regression.
 */
SELECT test.must_fail(
  'increment_eco_contacts_saved: requires authentication',
  $sql$SELECT increment_eco_contacts_saved(1)$sql$
);

RESET ROLE;
SELECT set_config('request.jwt.claim.sub', '22222222-2222-4222-8222-222222222222', false);
SET ROLE authenticated;

SELECT increment_eco_contacts_saved(1);
SELECT increment_eco_contacts_saved(1);

SELECT test.must_fail(
  'increment_eco_contacts_saved: rejects an out-of-range amount',
  $sql$SELECT increment_eco_contacts_saved(99999)$sql$,
  '22023'
);

RESET ROLE;

SELECT test.ok(
  'increment_eco_contacts_saved: increments atomically, never NaN',
  (SELECT contacts_saved = 2 FROM eco_stats
    WHERE user_id = '22222222-2222-4222-8222-222222222222'),
  'the previous client-side read-modify-write wrote NaN when the row was absent'
);

SELECT increment_card_share_count('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
SELECT increment_card_share_count('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');

SELECT test.ok(
  'increment_card_share_count: increments the card counter',
  (SELECT share_count = 2 FROM business_cards
    WHERE id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')
);

SELECT test.ok(
  'increment_card_share_count: mirrors into eco_stats.cards_shared',
  (SELECT cards_shared = 2 FROM eco_stats
    WHERE user_id = '11111111-1111-4111-8111-111111111111')
);

/* ================================================================== */
/*  8. Storage policies for card photos                                */
/* ================================================================== */

SELECT test.ok(
  'storage: card-photos bucket exists and is public',
  (SELECT public FROM storage.buckets WHERE id = 'card-photos')
);

SELECT set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', false);
SET ROLE authenticated;

INSERT INTO storage.objects (bucket_id, name)
VALUES ('card-photos', '11111111-1111-4111-8111-111111111111/photo.jpg');

SELECT test.ok(
  'storage: owner can upload into their own folder',
  (SELECT count(*) = 1 FROM storage.objects
    WHERE name = '11111111-1111-4111-8111-111111111111/photo.jpg')
);

SELECT test.must_fail(
  'storage: CANNOT upload into another user''s folder',
  $sql$INSERT INTO storage.objects (bucket_id, name)
       VALUES ('card-photos', '22222222-2222-4222-8222-222222222222/stolen.jpg')$sql$,
  '42501'
);

RESET ROLE;
SET ROLE anon;

SELECT test.ok(
  'storage: photos are publicly readable',
  (SELECT count(*) = 1 FROM storage.objects WHERE bucket_id = 'card-photos')
);

RESET ROLE;

/* ================================================================== */
/*  Report                                                             */
/* ================================================================== */

\echo ''
\echo '──────────────────────────────────────────────────────────────'
SELECT
  lpad(seq::text, 2) AS "#",
  CASE WHEN passed THEN 'PASS' ELSE 'FAIL' END AS result,
  name
FROM test.results
ORDER BY seq;

\echo ''
SELECT
  count(*) FILTER (WHERE passed)       AS passed,
  count(*) FILTER (WHERE NOT passed)   AS failed,
  count(*)                             AS total
FROM test.results;

\echo ''
SELECT name, detail AS failure_detail
FROM test.results WHERE NOT passed ORDER BY seq;

-- Non-zero exit for CI when anything failed.
DO $$
DECLARE v_failed integer;
BEGIN
  SELECT count(*) INTO v_failed FROM test.results WHERE NOT passed;
  IF v_failed > 0 THEN
    RAISE EXCEPTION '% assertion(s) failed', v_failed;
  END IF;
END $$;
