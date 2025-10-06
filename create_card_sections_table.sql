-- Create Card Sections table for Enhanced Card Editor
-- Run this script in your Supabase SQL editor

-- Create the update function first (if it doesn't exist)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create Card Sections table for draggable sections within cards
CREATE TABLE IF NOT EXISTS card_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id uuid REFERENCES cards(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text, -- JSON content for complex sections like addresses
  section_type text NOT NULL CHECK (section_type IN ('text', 'checklist', 'address', 'timeline', 'attachments', 'notes', 'custom_fields')),
  position integer DEFAULT 0,
  collapsed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add indexes for performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_card_sections_card_id ON card_sections(card_id);
CREATE INDEX IF NOT EXISTS idx_card_sections_position ON card_sections(card_id, position);

-- Enable RLS
ALTER TABLE card_sections ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view card sections for cards in their boards" ON card_sections;
DROP POLICY IF EXISTS "Users can manage card sections for cards in their boards" ON card_sections;

-- RLS Policies for card_sections
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

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_card_sections_updated_at ON card_sections;

-- Add trigger for auto-updating timestamps
CREATE TRIGGER update_card_sections_updated_at BEFORE UPDATE ON card_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();