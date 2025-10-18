-- add_created_by_to_lists.sql
-- Purpose: add a created_by column to the `lists` table, create a trigger
-- to populate it from the authenticated JWT when missing, and add
-- row-level security (RLS) policies that allow owners to CRUD their lists.
--
-- Usage: Paste this entire file into the Supabase SQL editor and run it.
-- Review the policies and adapt them to your sharing/membership model if needed.

BEGIN;

-- 1) Add the column if it doesn't exist
ALTER TABLE public.lists
  ADD COLUMN IF NOT EXISTS created_by uuid;

-- 1b) Create an index on created_by for faster lookups (idempotent)
CREATE INDEX IF NOT EXISTS lists_created_by_idx ON public.lists (created_by);

-- 2) (Optional) Backfill existing rows if you have a sensible default.
-- Example: set created_by to NULL (no-op) or a specific UUID for testing.
-- Uncomment and edit the following line to backfill if desired:
-- UPDATE public.lists SET created_by = NULL WHERE created_by IS NULL;

-- 3) Create function to set created_by from JWT (sub claim) when missing
CREATE OR REPLACE FUNCTION public.set_created_by()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  jwt_claims text;
  sub_text text;
  user_sub uuid;
BEGIN
  -- If created_by already provided by client, keep it
  IF NEW.created_by IS NOT NULL THEN
    RETURN NEW;
  END IF;

  -- request.jwt.claims is provided by PostgREST/Supabase for authenticated requests
  jwt_claims := current_setting('request.jwt.claims', true);
  IF jwt_claims IS NULL THEN
    -- no JWT available, leave created_by NULL (policy might reject later)
    RETURN NEW;
  END IF;

  -- Safely extract the 'sub' claim (the user's UUID) from the JWT claims JSON.
  -- Guard with a regex check before attempting to cast to uuid to avoid
  -- throwing an exception on malformed data.
  BEGIN
    sub_text := (jwt_claims::json ->> 'sub');
  EXCEPTION WHEN others THEN
    sub_text := NULL;
  END;

  IF sub_text IS NOT NULL AND sub_text ~* '^[0-9a-fA-F-]{36}$' THEN
    BEGIN
      user_sub := sub_text::uuid;
    EXCEPTION WHEN others THEN
      user_sub := NULL;
    END;
  ELSE
    user_sub := NULL;
  END IF;

  IF user_sub IS NOT NULL THEN
    NEW.created_by := user_sub;
  END IF;

  RETURN NEW;
END;
$$;

-- 4) Create trigger to run before insert
DROP TRIGGER IF EXISTS set_created_by_trigger ON public.lists;
CREATE TRIGGER set_created_by_trigger
  BEFORE INSERT ON public.lists
  FOR EACH ROW
  EXECUTE FUNCTION public.set_created_by();

-- 5) Enable Row Level Security on the table (idempotent)
ALTER TABLE public.lists ENABLE ROW LEVEL SECURITY;

-- 6) Policies: restrict operations to owners (created_by = auth.uid())
-- Insert: require that the inserted row's created_by matches the authenticated uid
-- (the trigger sets created_by from JWT when missing, so clients don't strictly
-- need to supply it themselves)
DROP POLICY IF EXISTS lists_allow_insert_auth_user ON public.lists;
CREATE POLICY lists_allow_insert_auth_user
  ON public.lists
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Select: owners may select their rows
DROP POLICY IF EXISTS lists_select_owner ON public.lists;
CREATE POLICY lists_select_owner
  ON public.lists
  FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

-- Update: owners may update their rows; ensure created_by stays the same
DROP POLICY IF EXISTS lists_update_owner ON public.lists;
CREATE POLICY lists_update_owner
  ON public.lists
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Delete: owners may delete their rows
DROP POLICY IF EXISTS lists_delete_owner ON public.lists;
CREATE POLICY lists_delete_owner
  ON public.lists
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

COMMIT;

-- Notes:
-- - If you want broader access (e.g., board members can see lists), modify the
--   USING/WITH CHECK clauses to consult membership tables (boards, board_members).
-- - The trigger relies on PostgREST/Supabase exposing JWT claims via
--   current_setting('request.jwt.claims', true). This is the default behavior
--   for requests authenticated with a user's JWT (the anon key won't provide a
--   matching 'sub').
-- - After applying these changes, test creating a list from the client while
--   authenticated. If you prefer the DB to always populate created_by (and to
--   reject anonymous inserts), keep the policies as-is.
--
-- Testing and operational notes:
-- * Run this in the Supabase SQL editor (or any environment where
--   request.jwt.claims is populated) and wait a few seconds for the schema
--   cache to refresh before testing inserts from the client.
-- * The trigger will set created_by only when the client doesn't provide it.
--   The INSERT policy requires created_by = auth.uid(), so anonymous
--   requests (no JWT) will be rejected by the policy even if the trigger leaves
--   created_by NULL.
-- * If you need server-side processes (e.g., background jobs) to insert rows,
--   perform those using the service_role (service role bypasses RLS), or add a
--   specific policy that permits inserts from a permitted role or function.
-- * If you use a membership/teams model (boards with members), consider
--   replacing the simple owner-check policies with membership-aware policies
--   that consult board_members or organization_members tables.
-- * To revert: DROP the trigger, DROP the function, DROP the index (if desired),
--   and (optionally) DROP the column. Always backup data before destructive ops.
