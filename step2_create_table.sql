-- Step 2: Create the card_sections table
CREATE TABLE IF NOT EXISTS card_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id uuid REFERENCES cards(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text,
  section_type text NOT NULL CHECK (section_type IN ('text', 'checklist', 'address', 'timeline', 'attachments', 'notes', 'custom_fields')),
  position integer DEFAULT 0,
  collapsed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);