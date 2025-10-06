-- Migration: Add Card Sections support for Enhanced Card Editor
-- Date: 2025-10-04

-- Card Sections table for draggable sections within cards
CREATE TABLE card_sections (
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

-- Add indexes for performance
CREATE INDEX idx_card_sections_card_id ON card_sections(card_id);
CREATE INDEX idx_card_sections_position ON card_sections(card_id, position);

-- Enable RLS
ALTER TABLE card_sections ENABLE ROW LEVEL SECURITY;

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

-- Add trigger for auto-updating timestamps
CREATE TRIGGER update_card_sections_updated_at BEFORE UPDATE ON card_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();