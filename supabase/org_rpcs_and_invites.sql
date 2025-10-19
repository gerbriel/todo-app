-- org_rpcs_and_invites.sql
-- Purpose: RPCs and helper tables for organization creation, membership management,
-- invites and atomic board creation + admin assignment.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

BEGIN;

-- Table for pending invites
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

-- RPC: create_organization (creator becomes owner)
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

-- RPC: add_organization_member (only org admins/owners may call)
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

-- RPC: remove_organization_member (only org admins)
CREATE OR REPLACE FUNCTION public.remove_organization_member(p_org uuid, p_user uuid)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  IF NOT public.is_org_admin(p_org) THEN
    RAISE EXCEPTION 'not_authorized';
  END IF;

  DELETE FROM public.organization_members WHERE org_id = p_org AND user_id = p_user;
END;
$$;

-- RPC: create_board_with_admin (creates board and adds creator as admin)
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

-- RPC: redeem invite token (redeem on signup)
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
