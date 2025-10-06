import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

// Read environment variables from .env file
const envContent = fs.readFileSync('.env', 'utf8')
const envVars = {}
envContent.split('\n').forEach(line => {
  if (line.includes('=')) {
    const [key, value] = line.split('=')
    envVars[key.trim()] = value.trim()
  }
})

const supabaseUrl = envVars.VITE_SUPABASE_URL
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY

console.log('🔍 Using Supabase URL:', supabaseUrl)
console.log('🔑 Using API key:', supabaseKey ? supabaseKey.substring(0, 20) + '...' : 'NOT FOUND')

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function createTableDirectly() {
  console.log('🔧 Creating card_sections table directly...')
  
  try {
    // Test connection first
    console.log('📋 Testing connection...')
    const { data: testData, error: testError } = await supabase
      .from('cards')
      .select('id')
      .limit(1)
    
    if (testError) {
      console.error('❌ Connection failed:', testError)
      return false
    }
    
    console.log('✅ Connection successful!')
    
    // Check if table already exists by trying to query it
    console.log('🔍 Checking if table exists...')
    const { data: existsData, error: existsError } = await supabase
      .from('card_sections')
      .select('id')
      .limit(1)
    
    if (!existsError) {
      console.log('✅ card_sections table already exists!')
      return true
    }
    
    console.log('📋 Table does not exist. You need to create it in Supabase dashboard.')
    console.log('🔗 Direct link: https://supabase.com/dashboard/project/btiyyxmiwngikpuygpsq/sql')
    console.log('')
    console.log('📋 COPY THIS SQL:')
    console.log('=' + '='.repeat(80))
    console.log(`CREATE TABLE card_sections (
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

CREATE INDEX idx_card_sections_card_id ON card_sections(card_id);
CREATE INDEX idx_card_sections_position ON card_sections(card_id, position);

ALTER TABLE card_sections ENABLE ROW LEVEL SECURITY;

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
  );`)
    console.log('=' + '='.repeat(80))
    return false
    
  } catch (err) {
    console.error('❌ Error:', err)
    return false
  }
}

// Run the function
createTableDirectly().then(success => {
  if (success) {
    console.log('🎉 Database setup complete! You can now re-enable the sections query.')
  } else {
    console.log('')
    console.log('⚠️ After creating the table, run this command to re-enable sections:')
    console.log('node enable-sections.js')
  }
})