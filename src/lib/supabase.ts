import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not configured')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Enhanced error handling for common Supabase issues
supabase.auth.onAuthStateChange((event) => {
  if (event === 'SIGNED_OUT') {
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