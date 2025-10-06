-- CUSTOM FIELDS & TIME TRACKING SETUP
-- Copy and paste this into your Supabase SQL Editor

-- 1. Create custom_fields table
CREATE TABLE IF NOT EXISTS custom_fields (
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

-- 2. Create custom_field_values table
CREATE TABLE IF NOT EXISTS custom_field_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id uuid REFERENCES cards(id) ON DELETE CASCADE,
  custom_field_id uuid REFERENCES custom_fields(id) ON DELETE CASCADE,
  value text, -- Store as text, parse as needed
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(card_id, custom_field_id) -- One value per field per card
);

-- 3. Create time_entries table
CREATE TABLE IF NOT EXISTS time_entries (
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

-- 4. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_custom_fields_workspace_id ON custom_fields(workspace_id);
CREATE INDEX IF NOT EXISTS idx_custom_field_values_card_id ON custom_field_values(card_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_card_id ON time_entries(card_id);

-- 5. Enable RLS
ALTER TABLE custom_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_field_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- 6. Add RLS policies for custom_fields
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

-- 7. Add RLS policies for custom_field_values
CREATE POLICY "Users can view custom field values for their cards" ON custom_field_values
  FOR SELECT USING (
    card_id IN (
      SELECT c.id FROM cards c
      JOIN lists l ON c.list_id = l.id
      JOIN boards b ON l.board_id = b.id
      JOIN workspaces w ON b.workspace_id = w.id
      WHERE w.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage custom field values for their cards" ON custom_field_values
  FOR ALL USING (
    card_id IN (
      SELECT c.id FROM cards c
      JOIN lists l ON c.list_id = l.id
      JOIN boards b ON l.board_id = b.id
      JOIN workspaces w ON b.workspace_id = w.id
      WHERE w.owner_id = auth.uid()
    )
  );

-- 8. Add RLS policies for time_entries
CREATE POLICY "Users can view time entries for their cards" ON time_entries
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

-- 9. Add update triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_custom_fields_updated_at 
  BEFORE UPDATE ON custom_fields
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_custom_field_values_updated_at 
  BEFORE UPDATE ON custom_field_values
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_time_entries_updated_at 
  BEFORE UPDATE ON time_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Success message
SELECT 'Custom Fields and Time Tracking tables created successfully!' as result;