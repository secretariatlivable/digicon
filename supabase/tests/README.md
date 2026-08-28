# Migration tests

Verifies DigiCon's database layer against a real PostgreSQL instance before it
touches a Supabase project.

```bash
# local (creates and drops a throwaway database)
PGHOST=localhost PGPORT=5432 PGUSER=postgres ./supabase/tests/run.sh

# against a specific database
PGURL=postgres://user:pass@host:5432/dbname ./supabase/tests/run.sh
```

Exits non-zero if any assertion fails.

## Why this exists

The audit found that the two guarantees the product depends on were both wrong,
and neither produced a compiler error or a runtime exception:

- public card reads were denied to the `anon` role, so every shared QR link
  returned "not found" to everyone except the card owner
- plan limits lived only in the browser and were bypassable with a direct REST
  call

Both are policy-level behaviour. The only way to know they work is to execute
them as the role in question and assert the outcome.

## Files

| File | Purpose |
|---|---|
| `00_supabase_stubs.sql` | Recreates the Supabase platform surface (`auth.users`, `auth.uid()`, storage tables, the `anon`/`authenticated`/`service_role` roles). **Never applied to a real project** — those objects exist there already. |
| `01_rls_and_entitlements.sql` | 41 behavioural assertions. |
| `run.sh` | Applies stubs → migrations → migrations again (idempotency) → assertions. |

## What is covered

- `handle_new_user` provisioning of `profiles` and `eco_stats`
- anonymous reads through `public_business_cards`, including the columns the
  view withholds and the exclusion of inactive cards
- denial of direct `contacts` inserts by `anon`
- `capture_public_contact()` validation, owner derivation from the card, and
  `card_id` attribution
- cross-user isolation for cards, contacts, and subscriptions
- card-count and edit-count limits under free and paid plans
- counter integrity (`share_count`, `eco_stats`)
- storage folder-ownership policies

## What is not covered

The stubs model `auth.uid()` and Storage **structurally**, not faithfully. This
suite proves the SQL is correct; it does not prove it behaves correctly against
real Supabase auth, real JWT claims, or real object storage. Run the staging
checklist in `docs/AUDIT-2026-08-28.md` as well.

Edge Functions are not covered here at all — they need Apple/Google signing
credentials and PayPal sandbox keys.

## Writing new assertions

Two rules, both learned the hard way while building this suite:

1. **Always `SET ROLE` explicitly.** Superusers and table owners bypass RLS. A
   test that forgets to drop privilege passes vacuously and proves nothing.

2. **Never make an assertion helper `SECURITY DEFINER` if it executes the
   statement under test.** `test.must_fail()` was briefly written that way; its
   `EXECUTE` ran as the table owner, so every privilege-denial test reported
   success while actually writing the forged rows it was meant to prove
   impossible. A security test that runs with more privilege than the attacker
   it models will pass whether or not the control works.

Add assertions with `test.ok(name, condition)` or
`test.must_fail(name, sql [, sqlstate])`. Omit the SQLSTATE when more than one
denial path is legitimate — pinning it makes the test brittle to
defence-in-depth changes that are not regressions.
