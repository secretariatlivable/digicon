/*
 * DigiCon — normalize subscription status/plan casing
 * ===================================================
 *
 * THE BUG
 * -------
 * `20260828000000_production_security_subscriptions.sql` created
 * `subscriptions` with an UPPERCASE status constraint:
 *
 *     check (status in ('APPROVAL_PENDING','ACTIVE','SUSPENDED','CANCELLED','EXPIRED'))
 *
 * `20260828120000_fix_rls_billing_and_counters.sql` then declared the same
 * table with a lowercase constraint — but via `CREATE TABLE IF NOT EXISTS`.
 * On any project where the table already existed, that entire statement was a
 * no-op and the UPPERCASE constraint survived.
 *
 * Everything written since then uses lowercase:
 *   - paypal-webhook   → 'active' | 'suspended' | 'cancelled' | …
 *   - stripe-webhook   → same vocabulary
 *   - active_plan_for()          → WHERE status = 'active'
 *   - src/lib/auth.tsx           → subscription?.status === 'active'
 *
 * So on an affected project the webhook's upsert violates the check
 * constraint and is rejected. No row is recorded, `plan` falls back to
 * 'startup', and a paying customer is denied the features they bought —
 * wallet passes among them. The visible symptom is a wallet button that
 * opens the upgrade dialog and sends you to /settings.
 *
 * The same no-op applies to the plan constraint: the original omitted
 * 'startup', which the newer code writes for free-tier rows.
 *
 * THE FIX
 * -------
 * Drop the constraints, normalise the data that is already there, then add
 * the constraints back in the lowercase vocabulary. Order matters — existing
 * uppercase rows would fail the new constraint if it were added first.
 *
 * Idempotent and safe to re-run.
 */

/* ------------------------------------------------------------------ */
/*  1. Drop the constraints so existing rows can be rewritten          */
/* ------------------------------------------------------------------ */

ALTER TABLE public.subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_status_check;

ALTER TABLE public.subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_plan_check;

/* ------------------------------------------------------------------ */
/*  2. Normalise whatever is already stored                            */
/*                                                                     */
/*  Covers rows written before the vocabulary settled, whether by an    */
/*  early webhook or by hand in the Supabase table editor.              */
/* ------------------------------------------------------------------ */

UPDATE public.subscriptions
SET status = lower(btrim(status))
WHERE status IS DISTINCT FROM lower(btrim(status));

UPDATE public.subscriptions
SET plan = lower(btrim(plan))
WHERE plan IS DISTINCT FROM lower(btrim(plan));

/*
 * PayPal's own vocabulary leaks through in some historical rows
 * (APPROVAL_PENDING → approval_pending is handled by lower() above, but
 * 'approved' and 'active_subscription' were never valid here).
 */
UPDATE public.subscriptions
SET status = 'active'
WHERE status IN ('approved', 'active_subscription');

/* Anything still outside the vocabulary is parked as approval_pending
   rather than dropped, so no billing history is lost. */
UPDATE public.subscriptions
SET status = 'approval_pending'
WHERE status NOT IN
  ('active', 'approval_pending', 'suspended', 'cancelled', 'expired');

UPDATE public.subscriptions
SET plan = 'startup'
WHERE plan NOT IN ('startup', 'starter', 'growth', 'enterprise');

/* ------------------------------------------------------------------ */
/*  3. Reinstate the constraints, lowercase                            */
/* ------------------------------------------------------------------ */

ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_status_check
  CHECK (status IN ('active', 'approval_pending', 'suspended', 'cancelled', 'expired'));

ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_plan_check
  CHECK (plan IN ('startup', 'starter', 'growth', 'enterprise'));

ALTER TABLE public.subscriptions
  ALTER COLUMN status SET DEFAULT 'approval_pending';

/* ------------------------------------------------------------------ */
/*  4. Make the server-side plan lookup case-insensitive               */
/*                                                                     */
/*  Defensive: a single stray uppercase row must never silently         */
/*  downgrade a paying customer again.                                  */
/* ------------------------------------------------------------------ */

CREATE OR REPLACE FUNCTION active_plan_for(p_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT coalesce(
    (SELECT lower(plan) FROM subscriptions
      WHERE user_id = p_user_id AND lower(status) = 'active'
      ORDER BY updated_at DESC LIMIT 1),
    'startup'
  );
$$;

COMMENT ON CONSTRAINT subscriptions_status_check ON public.subscriptions IS
  'Lowercase vocabulary. Both webhooks, active_plan_for() and the client all '
  'write and read lowercase — do not reintroduce the uppercase variant.';

/* ------------------------------------------------------------------ */
/*  5. Report what changed                                             */
/* ------------------------------------------------------------------ */

DO $$
DECLARE
  v_active int;
  v_total  int;
BEGIN
  SELECT count(*) FILTER (WHERE status = 'active'), count(*)
    INTO v_active, v_total
  FROM public.subscriptions;

  RAISE NOTICE 'DigiCon subscriptions normalised: % active of % total.',
    v_active, v_total;
END $$;
