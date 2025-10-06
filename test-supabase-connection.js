import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Get Supabase credentials from your environment
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://btiyyxmiwngikpuygpsq.supabase.co'
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseKey) {
  console.error('❌ Missing VITE_SUPABASE_ANON_KEY environment variable')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    console.log('🔍 Testing Supabase connection...')
    console.log('📍 URL:', supabaseUrl)
    
    // Test basic connection
    const { data, error } = await supabase
      .from('cards')
      .select('count(*)')
      .limit(1)
    
    if (error) {
      console.error('❌ Connection error:', error)
      return
    }
    
    console.log('✅ Connection successful!')
    
    // Test if card_sections table exists
    const { data: sectionsTest, error: sectionsError } = await supabase
      .from('card_sections')
      .select('count(*)')
      .limit(1)
    
    if (sectionsError) {
      console.log('📋 card_sections table does not exist yet:', sectionsError.message)
      console.log('🔧 You need to create this table in your Supabase dashboard')
    } else {
      console.log('✅ card_sections table exists!')
    }
    
  } catch (err) {
    console.error('❌ Test failed:', err)
  }
}

testConnection()