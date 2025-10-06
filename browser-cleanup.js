// Run this in the browser console on localhost:5173

async function cleanupBase64Corruption() {
  console.log('🔧 Starting Base64 corruption cleanup...')
  
  // Use the global supabase client from the app
  const { supabase } = window.__SUPABASE_CLIENT__ || {}
  
  if (!supabase && window.supabase) {
    // Try window.supabase if available
    supabase = window.supabase
  }
  
  if (!supabase) {
    console.error('❌ Supabase client not found. Make sure you\'re on the app page.')
    return
  }
  
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
      
      console.log(`🧹 Cleaning card "${card.title}":`)
      console.log(`  Before: ${card.description.substring(0, 100)}...`)
      console.log(`  After: ${cleanDescription.substring(0, 100)}...`)
      
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

// Auto-run the cleanup
cleanupBase64Corruption()