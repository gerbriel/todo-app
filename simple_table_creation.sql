-- Simple table creation (run this first)
CREATE TABLE card_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id uuid REFERENCES cards(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text,
  section_type text NOT NULL,
  position integer DEFAULT 0,
  collapsed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);