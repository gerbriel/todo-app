-- Step 4: Enable RLS and create policies
ALTER TABLE card_sections ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view card sections for cards in their boards" ON card_sections;
DROP POLICY IF EXISTS "Users can manage card sections for cards in their boards" ON card_sections;

-- Create new policies
CREATE POLICY "Users can view card sections for cards in their boards" ON card_sections
  FOR SELECT USING (
    card_id IN (
      SELECT c.id FROM cards c
      JOIN lists l ON c.list_id = l.id
      JOIN boards b ON l.board_id = b.id
      JOIN workspaces w ON b.workspace_id = w.id
      WHERE w.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage card sections for cards in their boards" ON card_sections
  FOR ALL USING (
    card_id IN (
      SELECT c.id FROM cards c
      JOIN lists l ON c.list_id = l.id
      JOIN boards b ON l.board_id = b.id
      JOIN workspaces w ON b.workspace_id = w.id
      WHERE w.owner_id = auth.uid()
    )
  );