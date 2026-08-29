/*
 * DigiCon — post-migration check and subscription reconciliation
 * ==============================================================
 *
 * Run AFTER `supabase db push` applies
 * 20260830000000_normalize_subscription_status.sql.
 *
 * Sections 1–2 are read-only. Section 3 is the only statement that writes,
 * and it is commented out until you fill in your own values.
 */

/* ---------------------------------------------------------------- 1 */
/*  Did the constraint repair actually apply?                         */
/*                                                                     */
/*  Also lists any duplicate check constraints (Postgres appends a     */
/*  numeric suffix — subscriptions_status_check1 — if a second one was */
/*  ever added, and a stale one would keep rejecting writes).          */
/* ---------------------------------------------------------------- */
SELECT
  conname                        AS constraint_name,
  pg_get_constraintdef(oid)      AS definition,
  CASE WHEN pg_get_constraintdef(oid) LIKE '%ACTIVE%'
       THEN 'FAIL — uppercase still present'
       ELSE 'PASS — lowercase'
  END                            AS verdict
FROM pg_constraint
WHERE conrelid = 'public.subscriptions'::regclass
  AND contype = 'c'
ORDER BY conname;

/* ---------------------------------------------------------------- 2 */
/*  What is actually in the table, and who am I?                      */
/*                                                                     */
/*  An empty result here is the finding: it means no subscription was  */
/*  ever recorded, because the old constraint rejected every write.    */
/* ---------------------------------------------------------------- */
SELECT
  u.id            AS your_user_id,
  u.email,
  s.provider,
  s.provider_subscription_id,
  s.plan,
  s.status,
  active_plan_for(u.id) AS resolved_plan,
  CASE
    WHEN s.id IS NULL THEN 'NO SUBSCRIPTION ROW — see section 3'
    WHEN active_plan_for(u.id) = 'startup'
      THEN 'BLOCKED — row exists but is not recognised as active'
    ELSE 'ENTITLED — wallet passes and paid features available'
  END AS wallet_access
FROM auth.users u
LEFT JOIN public.subscriptions s ON s.user_id = u.id
ORDER BY u.created_at;

/* ---------------------------------------------------------------- 3 */
/*  Reconcile a subscription that was paid for but never recorded     */
/*                                                                     */
/*  Only needed if section 2 shows NO SUBSCRIPTION ROW. Going forward  */
/*  the webhooks record this automatically — this is purely to repair  */
/*  what the constraint bug dropped on the floor.                     */
/*                                                                     */
/*  Find the PayPal subscription id (I-XXXXXXXXXXXX) in your PayPal    */
/*  dashboard under Pay & Get Paid → Subscriptions, or in the buyer's  */
/*  confirmation email. For Stripe it looks like sub_XXXXXXXXXXXX.     */
/*                                                                     */
/*  Uncomment, substitute the three values, and run.                   */
/* ---------------------------------------------------------------- */

-- INSERT INTO public.subscriptions
--   (user_id, provider, provider_subscription_id, plan, status, current_period_end)
-- VALUES (
--   '00000000-0000-0000-0000-000000000000',   -- your_user_id from section 2
--   'paypal',                                  -- 'paypal' or 'stripe'
--   'I-XXXXXXXXXXXX',                          -- the provider's subscription id
--   'starter',                                 -- startup | starter | growth | enterprise
--   'active',                                  -- lowercase, always
--   now() + interval '1 month'
-- )
-- ON CONFLICT (provider, provider_subscription_id) DO UPDATE
--   SET plan       = excluded.plan,
--       status     = excluded.status,
--       updated_at = now();

/* ---------------------------------------------------------------- 4 */
/*  Confirm the fix took                                              */
/* ---------------------------------------------------------------- */

-- SELECT email, active_plan_for(id) AS plan FROM auth.users;
--
-- Expected: 'starter' rather than 'startup'. Then hard-refresh the app —
-- the plan is read once when the session loads, so an open tab keeps the
-- old value until you reload.
