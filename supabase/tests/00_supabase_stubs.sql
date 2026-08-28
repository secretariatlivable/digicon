/*
 * 00_supabase_stubs.sql — local test scaffolding ONLY.
 *
 * Recreates the minimum Supabase platform surface that DigiCon's migrations
 * depend on, so they can be executed against a plain PostgreSQL instance.
 *
 * This file is NEVER applied to a real Supabase project — those objects already
 * exist there, managed by the platform. It exists so `supabase/tests/run.sh`
 * can verify our own migrations in CI without provisioning a cloud project.
 *
 * Fidelity notes (what this stub does and does not reproduce):
 *   - `auth.uid()` reads a session GUC instead of decoding a JWT. Behaviourally
 *     equivalent for RLS evaluation, which is all we assert on.
 *   - `auth.users` carries only the columns our trigger touches.
 *   - Storage is a structural stub: buckets/objects tables and
 *     `storage.foldername()`. Real upload behaviour is not simulated.
 */

/* ------------------------------------------------------------------ */
/*  Roles                                                              */
/* ------------------------------------------------------------------ */

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon NOLOGIN NOINHERIT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated NOLOGIN NOINHERIT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
    CREATE ROLE service_role NOLOGIN NOINHERIT BYPASSRLS;
  END IF;
END $$;

CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS storage;
CREATE SCHEMA IF NOT EXISTS extensions;

GRANT USAGE ON SCHEMA public  TO anon, authenticated, service_role;
GRANT USAGE ON SCHEMA auth    TO anon, authenticated, service_role;
GRANT USAGE ON SCHEMA storage TO anon, authenticated, service_role;

/* ------------------------------------------------------------------ */
/*  auth                                                               */
/* ------------------------------------------------------------------ */

CREATE TABLE IF NOT EXISTS auth.users (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email                text UNIQUE NOT NULL,
  raw_user_meta_data   jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at           timestamptz NOT NULL DEFAULT now()
);

/*
 * In production this decodes `request.jwt.claims`. Here it reads a GUC that the
 * test harness sets, which exercises the identical RLS code path.
 */
CREATE OR REPLACE FUNCTION auth.uid()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;

CREATE OR REPLACE FUNCTION auth.role()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT coalesce(nullif(current_setting('request.jwt.claim.role', true), ''), 'anon');
$$;

GRANT EXECUTE ON FUNCTION auth.uid(), auth.role() TO anon, authenticated, service_role;
GRANT SELECT ON auth.users TO service_role;

/* ------------------------------------------------------------------ */
/*  storage                                                            */
/* ------------------------------------------------------------------ */

CREATE TABLE IF NOT EXISTS storage.buckets (
  id                 text PRIMARY KEY,
  name               text NOT NULL,
  public             boolean NOT NULL DEFAULT false,
  file_size_limit    bigint,
  allowed_mime_types text[],
  created_at         timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS storage.objects (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket_id text REFERENCES storage.buckets(id),
  name      text NOT NULL,
  owner     uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

/** Splits an object path into its folder segments, as the platform does. */
CREATE OR REPLACE FUNCTION storage.foldername(name text)
RETURNS text[]
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  parts text[];
BEGIN
  parts := string_to_array(name, '/');
  RETURN parts[1:array_length(parts, 1) - 1];
END;
$$;

GRANT EXECUTE ON FUNCTION storage.foldername(text) TO anon, authenticated, service_role;
GRANT SELECT, INSERT, DELETE ON storage.objects TO anon, authenticated;
GRANT SELECT ON storage.buckets TO anon, authenticated;

/* ------------------------------------------------------------------ */
/*  Default grants                                                     */
/* ------------------------------------------------------------------ */

/*
 * Supabase grants table privileges to anon/authenticated by default and relies
 * on RLS for row-level control. Reproduced here so a policy failure surfaces as
 * "no rows"/"violates row-level security" rather than a misleading
 * "permission denied for table", which would mask what we are actually testing.
 */
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO anon, authenticated;
