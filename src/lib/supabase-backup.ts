import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Minimal setup - no window debugging to avoid console errors
console.log('Supabase client initialized')

// Enhanced error handling for common Supabase issues
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') {
    // Clear any cached data when user signs out
    localStorage.removeItem('supabase.auth.token')
  }
})

// Add helper function to safely update cards
export const safeUpdateCard = async (cardId: string, updates: any) => {
  try {
    // Ensure description doesn't contain Base64 data
    if (updates.description && updates.description.includes('data:')) {
      console.warn('🚨 Preventing Base64 data in card description')
      updates.description = updates.description.split('data:')[0].trim()
    }
    
    const { data, error } = await supabase
      .from('cards')
      .update(updates)
      .eq('id', cardId)
      .select()
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Safe update failed:', error)
    throw error
  }
}

// Add helper to get cards safely
export const safeGetCard = async (cardId: string) => {
  try {
    const { data, error } = await supabase
      .from('cards')
      .select(`
        *,
        labels:card_labels (
          label:labels (*)
        ),
        workflows:checklists (
          *,
          tasks:checklist_items (*)
        ),
        card_custom_field_values (*),
        activity (*)
      `)
      .eq('id', cardId)
      .single()
    
    if (error) throw error
    
    // Clean any Base64 data that might have snuck in
    if (data && data.description && data.description.includes('data:')) {
      console.warn('🚨 Found Base64 in card description, cleaning...')
      data.description = data.description.split('data:')[0].trim()
    }
    
    return data
  } catch (error) {
    console.error('Safe get failed:', error)
    throw error
  }
}
    ;(window as any).cleanupCardDescriptions = async function() {
      try {
        console.log('Starting cleanup of card descriptions...')
        
        const supabaseClient = (window as any).supabase
        
        // Get all cards with Base64 sections in their descriptions
        const { data: cards, error } = await supabaseClient
          .from('cards')
          .select('*')
          .like('description', '%<!-- SECTIONS_B64:%')
        
        if (error) {
          console.error('Error fetching cards:', error)
          return
        }
        
        console.log(`Found ${cards?.length || 0} cards with Base64 sections to clean`)
        
        if (cards && cards.length > 0) {
          for (const card of cards) {
            // Clean the description
            let cleanDescription = card.description
              .replace(/<!-- SECTIONS_B64: [\s\S]*? -->/g, '') // Remove the comment block
              .replace(/^\s+|\s+$/g, '') // Trim whitespace
              .replace(/\n\s*\n/g, '\n') // Remove extra blank lines
            
            console.log(`Cleaning card ${card.id}: "${card.title}"`)
            console.log(`Before: ${card.description.substring(0, 100)}...`)
            console.log(`After: ${cleanDescription}`)
            
            // Update the card with clean description
            const { error: updateError } = await supabaseClient
              .from('cards')
              .update({ description: cleanDescription })
              .eq('id', card.id)
            
            if (updateError) {
              console.error(`Error updating card ${card.id}:`, updateError)
            }
          }
          
          console.log('Cleanup completed! Refresh the page to see the changes.')
        } else {
          console.log('No cards found with Base64 sections to clean')
        }
        
      } catch (error) {
        console.error('Cleanup failed:', error)
      }
    }
  }
}, 100)

// Auth helpers
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

// Storage helpers
export const uploadFile = async (bucket: string, path: string, file: File) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file)
  return { data, error }
}

export const deleteFile = async (bucket: string, path: string) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .remove([path])
  return { data, error }
}

export const getFileUrl = (bucket: string, path: string) => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)
  return data.publicUrl
}