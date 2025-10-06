// Simple test to verify archive functionality
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://qupwfxgmnnbpbdohldhw.supabase.co'
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1cHdmeGdtbm5icGJkb2hsZGh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc2MzY4MzIsImV4cCI6MjA0MzIxMjgzMn0.5uXTXbUjHo_FtJ6z5tWZTLCTyRpF-qTYz1ZTVeW5gXM'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testArchive() {
  try {
    // Check if boards exist
    console.log('Checking boards...')
    const { data: boards, error: boardsError } = await supabase
      .from('boards')
      .select('*')
      .limit(5)
    
    if (boardsError) {
      console.error('Boards error:', boardsError)
      return
    }
    
    console.log('Boards found:', boards?.length)
    boards?.forEach(board => {
      console.log(`- ${board.name} (ID: ${board.id}, Workspace: ${board.workspace_id})`)
    })
    
    // Check if Archive board exists
    const { data: archiveBoard, error: archiveError } = await supabase
      .from('boards')
      .select('*')
      .eq('name', 'Archive')
      .single()
    
    if (archiveError && archiveError.code !== 'PGRST116') {
      console.error('Archive board check error:', archiveError)
    } else if (archiveBoard) {
      console.log('Archive board already exists:', archiveBoard.id)
    } else {
      console.log('No Archive board found - will be created when needed')
    }
    
  } catch (error) {
    console.error('Test failed:', error)
  }
}

testArchive()