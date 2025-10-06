// Run this in your browser console when you're on your app (localhost:5174)
// This will create the card_sections table directly

async function createCardSectionsTable() {
  console.log('🔧 Creating card_sections table...')
  
  try {
    // Access the global supabase client that should be available in window
    if (!window.supabase) {
      console.error('❌ Supabase client not found in window. Make sure you are on the app page.')
      return
    }
    
    const { data, error } = await window.supabase.rpc('exec_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS card_sections (
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
        
        CREATE INDEX IF NOT EXISTS idx_card_sections_card_id ON card_sections(card_id);
        CREATE INDEX IF NOT EXISTS idx_card_sections_position ON card_sections(card_id, position);
        
        ALTER TABLE card_sections ENABLE ROW LEVEL SECURITY;
      `
    })
    
    if (error) {
      console.error('❌ Error creating table:', error)
    } else {
      console.log('✅ Table created successfully!')
      console.log('🔄 Now you can re-enable the sections query in SafeCardEditModal.tsx')
    }
    
  } catch (err) {
    console.error('❌ Failed to create table:', err)
    console.log('💡 Try running this SQL in your Supabase dashboard instead:')
    console.log(`
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
    `)
  }
}

// Run the function
createCardSectionsTable()