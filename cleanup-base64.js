import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mzcfwjinrdajqwuhzjno.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16Y2Z3amlusmRhamN3dWh6am5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY1NzI4MzAsImV4cCI6MjA0MjE0ODgzMH0.fVfS8lW3dZUqaXV0IgqZzp7bhGH7LGPQ8j5bxtCn-Y8'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function cleanupBase64Corruption() {
  console.log('🔧 Starting Base64 corruption cleanup...')
  
  try {
    // Get all cards with Base64 sections data
    const { data: cards, error: fetchError } = await supabase
      .from('cards')
      .select('id, title, description')
      .like('description', '%SECTIONS_B64:%')
    
    if (fetchError) {
      console.error('❌ Error fetching cards:', fetchError)
      return
    }
    
    if (!cards || cards.length === 0) {
      console.log('✅ No cards with Base64 corruption found')
      return
    }
    
    console.log(`🔍 Found ${cards.length} cards with Base64 corruption`)
    
    let cleanedCount = 0
    
    for (const card of cards) {
      // Remove Base64 sections data
      const cleanDescription = card.description.replace(/\n*<!--\s*SECTIONS_B64:.*?-->\s*/g, '').trim()
      
      // Update the card
      const { error: updateError } = await supabase
        .from('cards')
        .update({ description: cleanDescription })
        .eq('id', card.id)
      
      if (updateError) {
        console.error(`❌ Error updating card ${card.id}:`, updateError)
      } else {
        console.log(`✅ Cleaned card: "${card.title}" (${card.id})`)
        cleanedCount++
      }
    }
    
    console.log(`🎉 Cleanup complete! Cleaned ${cleanedCount} out of ${cards.length} cards`)
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error)
  }
}

cleanupBase64Corruption()