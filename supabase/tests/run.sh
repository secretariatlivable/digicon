#!/usr/bin/env bash
#
# supabase/tests/run.sh — verify DigiCon's migrations against a real PostgreSQL.
#
# Applies the Supabase primitive stubs, then every migration in order, then the
# behavioural assertions. Also re-applies the migrations a second time to prove
# they are idempotent, which matters because they run on staging before prod.
#
# This does NOT replace testing against a live Supabase project: the stubs model
# auth.uid() and Storage structurally, not the real auth system. It catches the
# class of defect that is cheapest to catch early — broken policies, plpgsql
# errors, and logic regressions in the triggers and RPCs.
#
# Usage:
#   ./supabase/tests/run.sh                      # uses a throwaway local cluster
#   PGURL=postgres://... ./supabase/tests/run.sh # runs against a given database
#
# Exits non-zero if any assertion fails.

set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SUPA="$(dirname "$HERE")"
DB_NAME="${DB_NAME:-digicon_test}"

red()   { printf '\033[31m%s\033[0m\n' "$*"; }
green() { printf '\033[32m%s\033[0m\n' "$*"; }
bold()  { printf '\033[1m%s\033[0m\n' "$*"; }

if [[ -n "${PGURL:-}" ]]; then
  PSQL=(psql "$PGURL" -v ON_ERROR_STOP=1)
else
  : "${PGHOST:=localhost}" "${PGPORT:=5432}" "${PGUSER:=postgres}"
  bold "Recreating database ${DB_NAME} on ${PGHOST}:${PGPORT}"
  psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d postgres -q \
    -c "DROP DATABASE IF EXISTS ${DB_NAME};" \
    -c "CREATE DATABASE ${DB_NAME};"
  PSQL=(psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$DB_NAME" -v ON_ERROR_STOP=1)
fi

bold "→ Applying Supabase primitive stubs"
"${PSQL[@]}" -q -f "$HERE/00_supabase_stubs.sql"

bold "→ Applying migrations"
for migration in "$SUPA"/migrations/*.sql; do
  printf '   %s\n' "$(basename "$migration")"
  "${PSQL[@]}" -q -f "$migration" 2>&1 | grep -v '^NOTICE:' || true
done

bold "→ Re-applying migrations (idempotency check)"
for migration in "$SUPA"/migrations/*.sql; do
  if ! "${PSQL[@]}" -q -f "$migration" > /dev/null 2>&1; then
    red "   NOT IDEMPOTENT: $(basename "$migration")"
    red "   Re-running this migration fails. Fix before promoting to production."
    exit 1
  fi
done
green "   migrations are idempotent"

bold "→ Running behavioural assertions"
if "${PSQL[@]}" -f "$HERE/01_rls_and_entitlements.sql"; then
  green "
All assertions passed."
else
  red "
Assertions failed — see the table above. Do not deploy this migration."
  exit 1
fi
