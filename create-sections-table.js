import { supabase } from '../src/lib/supabase.js'

const createCardSectionsTable = async () => {
  try {
    console.log('Creating card_sections table...')
    
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Card Sections table for draggable sections within cards
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
      `
    })

    if (error) {
      console.error('Error creating table:', error)
    } else {
      console.log('✅ card_sections table created successfully')
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

createCardSectionsTable()