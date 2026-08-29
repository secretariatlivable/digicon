/*
 * DigiCon — deployment verification
 * =================================
 *
 * Paste into the Supabase SQL editor and run. Every row comes back with a
 * PASS/FAIL verdict, so you can see in one go whether the migrations actually
 * applied — which matters if a push ran while the project was paused.
 *
 * Read-only. Changes nothing.
 */

/* ---------------------------------------------------------------- 1 */
/*  Did the migrations land?                                          */
/* ---------------------------------------------------------------- */
SELECT
  '1. public_business_cards view' AS check,
  CASE WHEN to_regclass('public.public_business_cards') IS NOT NULL
       THEN 'PASS — public card pages can resolve'
       ELSE 'FAIL — run: supabase db push  (this is why /c/<id> says "card isn''t available")'
  END AS verdict

UNION ALL SELECT
  '2. card-photos storage bucket',
  CASE WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'card-photos')
       THEN 'PASS — photo/logo upload has somewhere to write'
       ELSE 'FAIL — run: supabase db push  (this is why uploads report an RLS violation)'
  END

UNION ALL SELECT
  '3. card-photos insert policy',
  CASE WHEN EXISTS (
         SELECT 1 FROM pg_policies
         WHERE schemaname = 'storage' AND tablename = 'objects'
           AND policyname = 'card_photos_owner_insert')
       THEN 'PASS'
       ELSE 'FAIL — bucket exists but the owner-insert policy does not'
  END

UNION ALL SELECT
  '4. capture_public_contact RPC',
  CASE WHEN to_regprocedure('public.capture_public_contact(uuid,text,text,text)') IS NOT NULL
       THEN 'PASS — visitors can send you their details'
       ELSE 'FAIL — the reciprocal exchange on the public card will not save'
  END

/* ---------------------------------------------------------------- 2 */
/*  The billing bug: is the status constraint lowercase?              */
/* ---------------------------------------------------------------- */
UNION ALL SELECT
  '5. subscriptions status casing',
  CASE
    WHEN NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'subscriptions_status_check'
        AND conrelid = 'public.subscriptions'::regclass)
      THEN 'FAIL — constraint missing entirely'
    WHEN (SELECT pg_get_constraintdef(oid) FROM pg_constraint
          WHERE conname = 'subscriptions_status_check'
            AND conrelid = 'public.subscriptions'::regclass) LIKE '%ACTIVE%'
      THEN 'FAIL — still the UPPERCASE constraint. Webhook writes are being rejected. Push 20260830000000_normalize_subscription_status.sql'
    ELSE 'PASS — lowercase vocabulary, webhooks can write'
  END

UNION ALL SELECT
  '6. no uppercase rows left',
  CASE WHEN EXISTS (
         SELECT 1 FROM public.subscriptions
         WHERE status <> lower(status) OR plan <> lower(plan))
       THEN 'FAIL — some rows still hold uppercase values; they read as inactive'
       ELSE 'PASS'
  END

UNION ALL SELECT
  '7. active_plan_for() is case-insensitive',
  CASE WHEN (SELECT prosrc FROM pg_proc WHERE proname = 'active_plan_for' LIMIT 1)
            LIKE '%lower(status)%'
       THEN 'PASS'
       ELSE 'WARN — older definition; a stray uppercase row would downgrade the user'
  END

ORDER BY 1;

/* ---------------------------------------------------------------- 3 */
/*  Your own entitlement, end to end                                  */
/*                                                                     */
/*  Run while signed in (the SQL editor runs as the service role, so   */
/*  substitute your user id for auth.uid() if it comes back null).      */
/* ---------------------------------------------------------------- */

SELECT
  s.provider,
  s.plan,
  s.status,
  s.current_period_end,
  active_plan_for(s.user_id) AS resolved_plan,
  CASE
    WHEN active_plan_for(s.user_id) = 'startup'
      THEN 'BLOCKED — wallet passes and paid features are denied'
    ELSE 'ENTITLED — wallet passes available'
  END AS wallet_access
FROM public.subscriptions s
ORDER BY s.updated_at DESC;

/*
 * Expected for a live Starter subscriber:
 *
 *   provider | plan    | status | resolved_plan | wallet_access
 *   ---------+---------+--------+---------------+---------------------------
 *   paypal   | starter | active | starter       | ENTITLED — wallet passes …
 *
 * `resolved_plan = 'startup'` next to `status = 'active'` means the casing
 * bug is still in play: the row exists but is not being recognised.
 *
 * No rows at all, despite having subscribed through PayPal, is the other
 * bug from this round — subscriptions were created client-side without
 * `custom_id`, so the webhook could not bind them to an account and dropped
 * the event as `unresolved_user`. That fix ships in the client; existing
 * orphaned subscriptions have to be reconciled by hand:
 *
 *   INSERT INTO public.subscriptions
 *     (user_id, provider, provider_subscription_id, plan, status)
 *   VALUES
 *     ('<your-auth-user-id>', 'paypal', '<I-XXXXXXXXXXXX>', 'starter', 'active')
 *   ON CONFLICT (provider, provider_subscription_id) DO UPDATE
 *     SET status = excluded.status, plan = excluded.plan, updated_at = now();
 */
