-- white_label_multitenancy.sql
-- Purpose: add organization-based multi-tenancy (white-label) support.
-- Adds organizations, organization_members, master_labels, master_calendars,
-- adds org_id to workspaces/boards/lists/cards, triggers to keep org_id in sync
-- and RLS helper/check functions plus example RLS policies enforcing isolation.
--
-- Safe / idempotent: uses "IF NOT EXISTS" and "ADD COLUMN IF NOT EXISTS".
-- Run in Supabase SQL editor. Backup first.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

BEGIN;

-- 1) Organizations table
CREATE TABLE IF NOT EXISTS public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE,
  domain text,
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_organizations_slug ON public.organizations(slug);

-- 2) Organization members mapping (user->org) with roles
CREATE TABLE IF NOT EXISTS public.organization_members (
  org_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member', -- e.g. 'admin'|'member'
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (org_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_org_members_user ON public.organization_members(user_id);

-- 2b) Board-level membership mapping (allows inviting users to specific boards
-- independent of organization membership; supports roles like 'admin'|'member'|'observer')
CREATE TABLE IF NOT EXISTS public.board_members (
  board_id uuid REFERENCES public.boards(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member',
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (board_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_board_members_user ON public.board_members(user_id);

-- 3) Add org_id to workspaces, boards, lists, cards (idempotent)
ALTER TABLE IF EXISTS public.workspaces
  ADD COLUMN IF NOT EXISTS org_id uuid REFERENCES public.organizations(id);

ALTER TABLE IF EXISTS public.boards
  ADD COLUMN IF NOT EXISTS org_id uuid REFERENCES public.organizations(id);

ALTER TABLE IF EXISTS public.lists
  ADD COLUMN IF NOT EXISTS org_id uuid REFERENCES public.organizations(id);

ALTER TABLE IF EXISTS public.cards
  ADD COLUMN IF NOT EXISTS org_id uuid REFERENCES public.organizations(id);

-- 4) Backfill org_id where possible (safe guarded casts)
-- backfill boards.org_id from workspaces.org_id when boards.workspace_id stores a UUID string
UPDATE public.boards b
SET org_id = w.org_id
FROM public.workspaces w
WHERE b.org_id IS NULL
  AND b.workspace_id IS NOT NULL
  AND b.workspace_id ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
  AND (b.workspace_id::uuid = w.id)
  AND w.org_id IS NOT NULL;

-- backfill lists.org_id from boards.org_id
UPDATE public.lists l
SET org_id = b.org_id
FROM public.boards b
WHERE l.org_id IS NULL
  AND l.board_id IS NOT NULL
  AND l.board_id::uuid = b.id
  AND b.org_id IS NOT NULL;

-- backfill cards.org_id from boards.org_id
UPDATE public.cards c
SET org_id = b.org_id
FROM public.boards b
WHERE c.org_id IS NULL
  AND c.board_id IS NOT NULL
  AND c.board_id::uuid = b.id
  AND b.org_id IS NOT NULL;

-- 5) Triggers to populate org_id automatically on inserts
-- boards: if org_id missing but workspace_id has an org, keep as-is (we backfilled earlier)

-- lists: set org_id from board
CREATE OR REPLACE FUNCTION public.set_list_org_id()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.org_id IS NULL AND NEW.board_id IS NOT NULL THEN
    BEGIN
      NEW.org_id := (SELECT org_id FROM public.boards WHERE id = NEW.board_id::uuid LIMIT 1);
    EXCEPTION WHEN OTHERS THEN
      NEW.org_id := NULL;
    END;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_list_org_id_trigger ON public.lists;
CREATE TRIGGER set_list_org_id_trigger
  BEFORE INSERT ON public.lists
  FOR EACH ROW EXECUTE FUNCTION public.set_list_org_id();

-- cards: set org_id from board (or from list)
CREATE OR REPLACE FUNCTION public.set_card_org_id()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.org_id IS NULL THEN
    IF NEW.board_id IS NOT NULL THEN
      BEGIN
        NEW.org_id := (SELECT org_id FROM public.boards WHERE id = NEW.board_id::uuid LIMIT 1);
      EXCEPTION WHEN OTHERS THEN
        NEW.org_id := NULL;
      END;
    ELSIF NEW.list_id IS NOT NULL THEN
      BEGIN
        NEW.org_id := (SELECT org_id FROM public.lists WHERE id = NEW.list_id::uuid LIMIT 1);
      EXCEPTION WHEN OTHERS THEN
        NEW.org_id := NULL;
      END;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_card_org_id_trigger ON public.cards;
CREATE TRIGGER set_card_org_id_trigger
  BEFORE INSERT ON public.cards
  FOR EACH ROW EXECUTE FUNCTION public.set_card_org_id();

-- 6) Master labels and master calendars per organization
CREATE TABLE IF NOT EXISTS public.master_labels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  color text DEFAULT '#cccccc',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_master_labels_org ON public.master_labels(org_id);

CREATE TABLE IF NOT EXISTS public.master_calendars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_master_calendars_org ON public.master_calendars(org_id);

-- 7) Helper function: is_member_of_org(org_id) and is_org_admin(org_id)
CREATE OR REPLACE FUNCTION public.is_member_of_org(p_org uuid)
RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.organization_members om
    WHERE om.org_id = p_org AND om.user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_org_admin(p_org uuid)
RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.organization_members om
    WHERE om.org_id = p_org AND om.user_id = auth.uid() AND (om.role = 'admin' OR om.role = 'owner')
  );
$$;

-- Board-level membership checks
CREATE OR REPLACE FUNCTION public.is_member_of_board(p_board uuid)
RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.board_members bm
    WHERE bm.board_id = p_board AND bm.user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_board_admin(p_board uuid)
RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.board_members bm
    WHERE bm.board_id = p_board AND bm.user_id = auth.uid() AND (bm.role = 'admin' OR bm.role = 'owner')
  );
$$;

-- 8) RLS policies examples: boards/lists/cards scoped to organization membership
-- Make sure RLS is enabled on these tables before creating policies (idempotent below)
ALTER TABLE IF EXISTS public.boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.cards ENABLE ROW LEVEL SECURITY;

-- Boards: allow members to select boards in their org, allow org admins to insert/update/delete
DROP POLICY IF EXISTS boards_select_org_policy ON public.boards;
CREATE POLICY boards_select_org_policy ON public.boards
  FOR SELECT TO authenticated
  USING (
    (
      EXISTS (SELECT 1 FROM public.organization_members om WHERE om.org_id = public.boards.org_id AND om.user_id = auth.uid())
      OR public.is_member_of_board(public.boards.id)
    )
  );

DROP POLICY IF EXISTS boards_manage_org_policy ON public.boards;
CREATE POLICY boards_manage_org_policy ON public.boards
  FOR ALL TO authenticated
  USING (
    public.is_member_of_org(public.boards.org_id) OR public.is_member_of_board(public.boards.id)
  )
  WITH CHECK (
    public.is_org_admin(public.boards.org_id) OR public.is_board_admin(public.boards.id) OR public.is_member_of_org(public.boards.org_id) OR public.is_member_of_board(public.boards.id)
  );

-- Lists: allow members to select lists where list.org_id matches an org the user belongs to
DROP POLICY IF EXISTS lists_select_org_policy ON public.lists;
CREATE POLICY lists_select_org_policy ON public.lists
  FOR SELECT TO authenticated
  USING (
    (
      public.is_member_of_org(public.lists.org_id)
      OR public.is_member_of_board(public.lists.board_id::uuid)
      OR public.is_member_of_board((SELECT b.id FROM public.boards b WHERE b.id = public.lists.board_id::uuid LIMIT 1))
    )
  );

DROP POLICY IF EXISTS lists_manage_org_policy ON public.lists;
CREATE POLICY lists_manage_org_policy ON public.lists
  FOR ALL TO authenticated
  USING (
    public.is_member_of_org(public.lists.org_id) OR public.is_member_of_board(public.lists.board_id::uuid)
  )
  WITH CHECK (
    public.is_member_of_org(public.lists.org_id) OR public.is_member_of_board(public.lists.board_id::uuid)
  );

-- Cards: similar
DROP POLICY IF EXISTS cards_select_org_policy ON public.cards;
CREATE POLICY cards_select_org_policy ON public.cards
  FOR SELECT TO authenticated
  USING (
    (
      public.is_member_of_org(public.cards.org_id)
      OR public.is_member_of_board(public.cards.board_id::uuid)
      OR public.is_member_of_board((SELECT b.id FROM public.boards b WHERE b.id = public.cards.board_id::uuid LIMIT 1))
    )
  );

DROP POLICY IF EXISTS cards_manage_org_policy ON public.cards;
CREATE POLICY cards_manage_org_policy ON public.cards
  FOR ALL TO authenticated
  USING (
    public.is_member_of_org(public.cards.org_id) OR public.is_member_of_board(public.cards.board_id::uuid)
  )
  WITH CHECK (
    public.is_member_of_org(public.cards.org_id) OR public.is_member_of_board(public.cards.board_id::uuid)
  );

-- Master labels & calendars: RLS so org members can access
ALTER TABLE IF EXISTS public.master_labels ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS master_labels_policy ON public.master_labels;
CREATE POLICY master_labels_policy ON public.master_labels FOR ALL TO authenticated
  USING (public.is_member_of_org(public.master_labels.org_id))
  WITH CHECK (public.is_member_of_org(public.master_labels.org_id));

ALTER TABLE IF EXISTS public.master_calendars ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS master_calendars_policy ON public.master_calendars;
CREATE POLICY master_calendars_policy ON public.master_calendars FOR ALL TO authenticated
  USING (public.is_member_of_org(public.master_calendars.org_id))
  WITH CHECK (public.is_member_of_org(public.master_calendars.org_id));

-- 9) Indexes to help permission checks
CREATE INDEX IF NOT EXISTS idx_lists_org ON public.lists(org_id);
CREATE INDEX IF NOT EXISTS idx_cards_org ON public.cards(org_id);

-- 10) Small convenience view: organization summary
CREATE OR REPLACE VIEW public.organization_summary AS
SELECT o.id, o.name, o.slug, o.domain, o.settings,
  (SELECT count(*) FROM public.organization_members om WHERE om.org_id = o.id) as member_count
FROM public.organizations o;

COMMIT;

-- End of migration
-- After running:
-- - Add members to organizations via INSERT INTO public.organization_members (org_id, user_id, role)
-- - Ensure boards/workspaces created for an org include org_id (client should set org_id on create)
-- - Adjust client fetching to filter by org (or rely on RLS and query by org-scoped ids)

-- Testing tips:
-- 1) Create an organization, add your user as admin and test creating boards/workspaces/lists/cards.
-- 2) Try accessing data in an org where user is not a member (should be denied).
-- 3) Use Supabase SQL editor with service_role to audit tables and membership mappings.
