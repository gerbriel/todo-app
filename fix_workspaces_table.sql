-- Add owner_id column if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='workspaces' AND column_name='owner_id'
  ) THEN
    ALTER TABLE workspaces ADD COLUMN owner_id uuid REFERENCES auth.users(id);
  END IF;
END $$;

-- Enable Row Level Security if not already enabled
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for owner access
DROP POLICY IF EXISTS "Users can manage their own workspaces" ON workspaces;
CREATE POLICY "Users can manage their own workspaces" ON workspaces
  FOR ALL USING (owner_id = auth.uid());

-- =====================
-- LISTS TABLE POLICIES
-- =====================
-- Allow users to select lists on boards in their workspaces
DROP POLICY IF EXISTS "Users can view lists on their boards" ON lists;
CREATE POLICY "Users can view lists on their boards" ON lists
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM boards b
      JOIN workspaces w ON b.workspace_id = w.id
      WHERE b.id = lists.board_id AND w.owner_id = auth.uid()
    )
  );

-- Allow users to insert lists on their boards
DROP POLICY IF EXISTS "Users can insert lists on their boards" ON lists;
CREATE POLICY "Users can insert lists on their boards" ON lists
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM boards b
      JOIN workspaces w ON b.workspace_id = w.id
      WHERE b.id = lists.board_id AND w.owner_id = auth.uid()
    )
  );

-- Allow users to update lists on their boards
DROP POLICY IF EXISTS "Users can update lists on their boards" ON lists;
CREATE POLICY "Users can update lists on their boards" ON lists
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM boards b
      JOIN workspaces w ON b.workspace_id = w.id
      WHERE b.id = lists.board_id AND w.owner_id = auth.uid()
    )
  );

-- Allow users to delete lists on their boards
DROP POLICY IF EXISTS "Users can delete lists on their boards" ON lists;
CREATE POLICY "Users can delete lists on their boards" ON lists
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM boards b
      JOIN workspaces w ON b.workspace_id = w.id
      WHERE b.id = lists.board_id AND w.owner_id = auth.uid()
    )
  );
