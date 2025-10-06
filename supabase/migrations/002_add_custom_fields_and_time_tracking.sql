-- Migration: Add Custom Fields and Time Tracking support
-- Date: 2025-10-04

-- Custom Fields table
CREATE TABLE custom_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
  name text NOT NULL,
  field_type text NOT NULL CHECK (field_type IN ('text', 'number', 'date', 'select', 'multi-select', 'currency', 'url', 'email', 'phone', 'checkbox', 'textarea')),
  options jsonb, -- For select and multi-select fields
  required boolean DEFAULT false,
  default_value text,
  placeholder text,
  help_text text,
  position integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Custom Field Values table (for storing values per card)
CREATE TABLE custom_field_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id uuid REFERENCES cards(id) ON DELETE CASCADE,
  custom_field_id uuid REFERENCES custom_fields(id) ON DELETE CASCADE,
  value text, -- Store as text, parse as needed
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(card_id, custom_field_id) -- One value per field per card
);

-- Time Tracking table
CREATE TABLE time_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id uuid REFERENCES cards(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  description text,
  hours decimal(10,2) NOT NULL DEFAULT 0,
  billable boolean DEFAULT true,
  hourly_rate decimal(10,2),
  start_time timestamptz,
  end_time timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX idx_custom_fields_workspace_id ON custom_fields(workspace_id);
CREATE INDEX idx_custom_fields_position ON custom_fields(workspace_id, position);
CREATE INDEX idx_custom_field_values_card_id ON custom_field_values(card_id);
CREATE INDEX idx_custom_field_values_field_id ON custom_field_values(custom_field_id);
CREATE INDEX idx_time_entries_card_id ON time_entries(card_id);
CREATE INDEX idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX idx_time_entries_date ON time_entries(created_at);

-- Add RLS policies for custom fields
ALTER TABLE custom_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_field_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- Custom Fields policies (workspace level)
CREATE POLICY "Users can view custom fields in their workspaces" ON custom_fields
  FOR SELECT USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage custom fields in their workspaces" ON custom_fields
  FOR ALL USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
    )
  );

-- Custom Field Values policies (card level)
CREATE POLICY "Users can view custom field values for cards in their boards" ON custom_field_values
  FOR SELECT USING (
    card_id IN (
      SELECT c.id FROM cards c
      JOIN lists l ON c.list_id = l.id
      JOIN boards b ON l.board_id = b.id
      JOIN workspaces w ON b.workspace_id = w.id
      WHERE w.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage custom field values for cards in their boards" ON custom_field_values
  FOR ALL USING (
    card_id IN (
      SELECT c.id FROM cards c
      JOIN lists l ON c.list_id = l.id
      JOIN boards b ON l.board_id = b.id
      JOIN workspaces w ON b.workspace_id = w.id
      WHERE w.owner_id = auth.uid()
    )
  );

-- Time Entries policies
CREATE POLICY "Users can view time entries for cards in their boards" ON time_entries
  FOR SELECT USING (
    card_id IN (
      SELECT c.id FROM cards c
      JOIN lists l ON c.list_id = l.id
      JOIN boards b ON l.board_id = b.id
      JOIN workspaces w ON b.workspace_id = w.id
      WHERE w.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own time entries" ON time_entries
  FOR ALL USING (user_id = auth.uid());

-- Update function for auto-updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for auto-updating timestamps
CREATE TRIGGER update_custom_fields_updated_at BEFORE UPDATE ON custom_fields
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_custom_field_values_updated_at BEFORE UPDATE ON custom_field_values
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_time_entries_updated_at BEFORE UPDATE ON time_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();