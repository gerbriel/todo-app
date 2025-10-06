-- Ensure the tables exist with the correct structure
-- This should be run in Supabase SQL editor

-- Create workspaces table if it doesn't exist
CREATE TABLE IF NOT EXISTS workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  owner_id uuid REFERENCES auth.users(id)
);

-- Add owner_id column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='workspaces' AND column_name='owner_id') THEN
    ALTER TABLE workspaces ADD COLUMN owner_id uuid REFERENCES auth.users(id);
  END IF;
END $$;

-- Ensure boards table has workspace_id column
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='boards' AND column_name='workspace_id') THEN
    ALTER TABLE boards ADD COLUMN workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_workspaces_owner_id ON workspaces(owner_id);
CREATE INDEX IF NOT EXISTS idx_boards_workspace_id ON boards(workspace_id);

-- Enable RLS (Row Level Security)
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workspaces
DROP POLICY IF EXISTS "Users can manage their own workspaces" ON workspaces;
CREATE POLICY "Users can manage their own workspaces" ON workspaces
  FOR ALL USING (owner_id = auth.uid());

-- RLS Policies for boards
DROP POLICY IF EXISTS "Users can manage boards in their workspaces" ON boards;
CREATE POLICY "Users can manage boards in their workspaces" ON boards
  FOR ALL USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
    )
  );