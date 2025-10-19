-- combined_multitenancy_and_rls.sql
-- Combined migration: adds created_by ownership trigger for lists,
-- organizations/org_members/board_members, org_id columns, backfills,
-- helper functions, RLS policies, invites and RPCs.
--
-- Idempotent: uses IF NOT EXISTS, DROP POLICY IF EXISTS, DROP TRIGGER IF EXISTS,
-- and CREATE OR REPLACE FUNCTION where appropriate. Safe to paste into
-- Supabase SQL editor and run. Review before running and backup if needed.

/* -------------------------------------------------------------------------- */
-- Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

BEGIN;

/* -------------------------------------------------------------------------- */
-- Organizations
CREATE TABLE IF NOT EXISTS public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE,
  domain text,
  settings jsonb DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_organizations_slug ON public.organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_created_by ON public.organizations(created_by);

-- If the organizations table already existed (older schema), ensure expected
-- columns are present. CREATE TABLE IF NOT EXISTS won't add missing columns,
-- so use ALTER TABLE ... ADD COLUMN IF NOT EXISTS for forward-compatibility.
ALTER TABLE IF EXISTS public.organizations
  ADD COLUMN IF NOT EXISTS domain text;

ALTER TABLE IF EXISTS public.organizations
  ADD COLUMN IF NOT EXISTS settings jsonb DEFAULT '{}'::jsonb;

ALTER TABLE IF EXISTS public.organizations
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);

ALTER TABLE IF EXISTS public.organizations
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

ALTER TABLE IF EXISTS public.organizations
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

/* -------------------------------------------------------------------------- */
-- Organization members (user -> org) and Board members (user -> board)
CREATE TABLE IF NOT EXISTS public.organization_members (
  org_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member', -- 'owner'|'admin'|'member'
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (org_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_org_members_user ON public.organization_members(user_id);

CREATE TABLE IF NOT EXISTS public.board_members (
  board_id uuid REFERENCES public.boards(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member', -- 'owner'|'admin'|'member'|'observer'
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (board_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_board_members_user ON public.board_members(user_id);

/* -------------------------------------------------------------------------- */
-- Add org_id to workspace/boards/lists/cards and created_by to lists
ALTER TABLE IF EXISTS public.workspaces
  ADD COLUMN IF NOT EXISTS org_id uuid REFERENCES public.organizations(id);

ALTER TABLE IF EXISTS public.boards
  ADD COLUMN IF NOT EXISTS org_id uuid REFERENCES public.organizations(id);

ALTER TABLE IF EXISTS public.lists
  ADD COLUMN IF NOT EXISTS org_id uuid REFERENCES public.organizations(id);

ALTER TABLE IF EXISTS public.cards
  ADD COLUMN IF NOT EXISTS org_id uuid REFERENCES public.organizations(id);

ALTER TABLE IF EXISTS public.lists
  ADD COLUMN IF NOT EXISTS created_by uuid;

CREATE INDEX IF NOT EXISTS lists_created_by_idx ON public.lists (created_by);
CREATE INDEX IF NOT EXISTS idx_lists_org ON public.lists(org_id);
CREATE INDEX IF NOT EXISTS idx_cards_org ON public.cards(org_id);

/* -------------------------------------------------------------------------- */
-- Backfills: try to populate org_id from workspace -> boards -> lists/cards
-- Guards: rely on proper UUID types in workspace_id/board_id; if your schema
-- stores them as text, verify casts are safe and adjust accordingly.
-- Backfill boards.org_id from workspaces
UPDATE public.boards b
SET org_id = w.org_id
FROM public.workspaces w
WHERE b.org_id IS NULL
  AND b.workspace_id IS NOT NULL
  AND (b.workspace_id ~* '^[0-9a-fA-F-]{36}$')
  AND b.workspace_id::uuid = w.id
  AND w.org_id IS NOT NULL;

-- Backfill lists.org_id from boards.org_id
UPDATE public.lists l
SET org_id = b.org_id
FROM public.boards b
WHERE l.org_id IS NULL
  AND l.board_id IS NOT NULL
  AND (l.board_id ~* '^[0-9a-fA-F-]{36}$')
  AND l.board_id::uuid = b.id
  AND b.org_id IS NOT NULL;

-- Backfill cards.org_id from boards.org_id
UPDATE public.cards c
SET org_id = b.org_id
FROM public.boards b
WHERE c.org_id IS NULL
  AND c.board_id IS NOT NULL
  AND (c.board_id ~* '^[0-9a-fA-F-]{36}$')
  AND c.board_id::uuid = b.id
  AND b.org_id IS NOT NULL;

/* -------------------------------------------------------------------------- */
-- Trigger: set created_by on lists from JWT (if missing)
CREATE OR REPLACE FUNCTION public.set_created_by()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  jwt_claims text;
  sub_text text;
  user_sub uuid;
BEGIN
  -- If client provided created_by, preserve it
  IF NEW.created_by IS NOT NULL THEN
    RETURN NEW;
  END IF;

  jwt_claims := current_setting('request.jwt.claims', true);
  IF jwt_claims IS NULL THEN
    RETURN NEW;
  END IF;

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

DROP TRIGGER IF EXISTS set_created_by_trigger ON public.lists;
CREATE TRIGGER set_created_by_trigger
  BEFORE INSERT ON public.lists
  FOR EACH ROW
  EXECUTE FUNCTION public.set_created_by();

/* -------------------------------------------------------------------------- */
-- Triggers to populate org_id on lists/cards from board/list where possible
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

/* -------------------------------------------------------------------------- */
-- Master labels & calendars per organization
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

/* -------------------------------------------------------------------------- */
-- Invite table for organization invites
CREATE TABLE IF NOT EXISTS public.org_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'member',
  token text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_org_invites_org ON public.org_invites(org_id);

-- Ensure profiles table has a current_org column for persisting user selection
ALTER TABLE IF EXISTS public.profiles
  ADD COLUMN IF NOT EXISTS current_org uuid REFERENCES public.organizations(id);

/* -------------------------------------------------------------------------- */
-- Helper functions: membership checks
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

/* -------------------------------------------------------------------------- */
-- Enable RLS on relevant tables
ALTER TABLE IF EXISTS public.boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.master_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.master_calendars ENABLE ROW LEVEL SECURITY;

/* -------------------------------------------------------------------------- */
-- Boards policies: members can read; org admins/board admins can manage
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

/* -------------------------------------------------------------------------- */
-- Lists policies: allow owner OR org/board membership to access/manage
DROP POLICY IF EXISTS lists_select_policy ON public.lists;
CREATE POLICY lists_select_policy ON public.lists
  FOR SELECT TO authenticated
  USING (
    (public.lists.created_by = auth.uid())
    OR public.is_member_of_org(public.lists.org_id)
    OR (public.lists.board_id IS NOT NULL AND public.is_member_of_board(public.lists.board_id::uuid))
  );

DROP POLICY IF EXISTS lists_manage_policy ON public.lists;
CREATE POLICY lists_manage_policy ON public.lists
  FOR ALL TO authenticated
  USING (
    (public.lists.created_by = auth.uid())
    OR public.is_member_of_org(public.lists.org_id)
    OR (public.lists.board_id IS NOT NULL AND public.is_member_of_board(public.lists.board_id::uuid))
  )
  WITH CHECK (
    (public.lists.created_by = auth.uid())
    OR public.is_member_of_org(public.lists.org_id)
    OR (public.lists.board_id IS NOT NULL AND public.is_member_of_board(public.lists.board_id::uuid))
  );

/* -------------------------------------------------------------------------- */
-- Cards policies: allow owner OR org/board membership to access/manage
DROP POLICY IF EXISTS cards_select_policy ON public.cards;
CREATE POLICY cards_select_policy ON public.cards
  FOR SELECT TO authenticated
  USING (
    (public.cards.created_by = auth.uid())
    OR public.is_member_of_org(public.cards.org_id)
    OR (public.cards.board_id IS NOT NULL AND public.is_member_of_board(public.cards.board_id::uuid))
  );

DROP POLICY IF EXISTS cards_manage_policy ON public.cards;
CREATE POLICY cards_manage_policy ON public.cards
  FOR ALL TO authenticated
  USING (
    (public.cards.created_by = auth.uid())
    OR public.is_member_of_org(public.cards.org_id)
    OR (public.cards.board_id IS NOT NULL AND public.is_member_of_board(public.cards.board_id::uuid))
  )
  WITH CHECK (
    (public.cards.created_by = auth.uid())
    OR public.is_member_of_org(public.cards.org_id)
    OR (public.cards.board_id IS NOT NULL AND public.is_member_of_board(public.cards.board_id::uuid))
  );

/* -------------------------------------------------------------------------- */
-- Master labels & calendars policies
DROP POLICY IF EXISTS master_labels_policy ON public.master_labels;
CREATE POLICY master_labels_policy ON public.master_labels FOR ALL TO authenticated
  USING (public.is_member_of_org(public.master_labels.org_id))
  WITH CHECK (public.is_member_of_org(public.master_labels.org_id));

DROP POLICY IF EXISTS master_calendars_policy ON public.master_calendars;
CREATE POLICY master_calendars_policy ON public.master_calendars FOR ALL TO authenticated
  USING (public.is_member_of_org(public.master_calendars.org_id))
  WITH CHECK (public.is_member_of_org(public.master_calendars.org_id));

/* -------------------------------------------------------------------------- */
-- Convenience view
CREATE OR REPLACE VIEW public.organization_summary AS
SELECT o.id, o.name, o.slug, o.domain, o.settings,
  (SELECT count(*) FROM public.organization_members om WHERE om.org_id = o.id) as member_count
FROM public.organizations o;

/* -------------------------------------------------------------------------- */
-- RPCs: organization creation, member management, board creation, invite redeem
CREATE OR REPLACE FUNCTION public.create_organization(p_name text, p_slug text DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql AS $$
DECLARE
  v_org uuid;
BEGIN
  INSERT INTO public.organizations (name, slug, created_by)
  VALUES (p_name, p_slug, auth.uid())
  RETURNING id INTO v_org;

  INSERT INTO public.organization_members (org_id, user_id, role)
  VALUES (v_org, auth.uid(), 'owner')
  ON CONFLICT (org_id, user_id) DO UPDATE SET role = EXCLUDED.role;

  RETURN v_org;
END;
$$;

CREATE OR REPLACE FUNCTION public.add_organization_member(p_org uuid, p_user uuid, p_role text)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  IF NOT public.is_org_admin(p_org) THEN
    RAISE EXCEPTION 'not_authorized';
  END IF;

  INSERT INTO public.organization_members (org_id, user_id, role)
  VALUES (p_org, p_user, p_role)
  ON CONFLICT (org_id, user_id) DO UPDATE SET role = EXCLUDED.role;
END;
$$;

CREATE OR REPLACE FUNCTION public.remove_organization_member(p_org uuid, p_user uuid)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  IF NOT public.is_org_admin(p_org) THEN
    RAISE EXCEPTION 'not_authorized';
  END IF;

  DELETE FROM public.organization_members WHERE org_id = p_org AND user_id = p_user;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_board_with_admin(p_name text, p_org uuid)
RETURNS uuid LANGUAGE plpgsql AS $$
DECLARE
  v_board uuid;
BEGIN
  INSERT INTO public.boards (name, org_id, created_by)
  VALUES (p_name, p_org, auth.uid())
  RETURNING id INTO v_board;

  INSERT INTO public.board_members (board_id, user_id, role)
  VALUES (v_board, auth.uid(), 'admin')
  ON CONFLICT (board_id, user_id) DO UPDATE SET role = EXCLUDED.role;

  RETURN v_board;
END;
$$;

CREATE OR REPLACE FUNCTION public.redeem_org_invite(p_token text, p_user uuid)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE
  v_org uuid;
  v_role text;
BEGIN
  SELECT org_id, role INTO v_org, v_role
  FROM public.org_invites
  WHERE token = p_token
    AND (expires_at IS NULL OR expires_at > now())
  LIMIT 1;

  IF v_org IS NULL THEN
    RAISE EXCEPTION 'invalid_or_expired';
  END IF;

  INSERT INTO public.organization_members (org_id, user_id, role)
  VALUES (v_org, p_user, v_role)
  ON CONFLICT (org_id, user_id) DO UPDATE SET role = EXCLUDED.role;

  DELETE FROM public.org_invites WHERE token = p_token;
END;
$$;

COMMIT;

/* -------------------------------------------------------------------------- */
-- End of combined migration
