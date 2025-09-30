import { supabase } from '../lib/supabase'

export interface AllowedUser {
  id: string
  email: string
  invited_by?: string
  is_admin: boolean
  created_at: string
}

export interface UserProfile {
  id: string
  email: string
  name?: string
  avatar_url?: string
  is_admin: boolean
  is_approved: boolean
  created_at: string
  updated_at: string
}

export const userApi = {
  // Get current user profile
  async getCurrentProfile(): Promise<UserProfile | null> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) throw error
    return data
  },

  // Check if user is approved
  async isUserApproved(): Promise<boolean> {
    const profile = await this.getCurrentProfile()
    return profile?.is_approved || false
  },

  // Get all allowed users (admin only)
  async getAllowedUsers(): Promise<AllowedUser[]> {
    const { data, error } = await supabase
      .from('allowed_users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Add new allowed user (admin only)
  async addAllowedUser(email: string, isAdmin: boolean = false): Promise<AllowedUser> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('allowed_users')
      .insert({
        email: email.toLowerCase(),
        invited_by: user.id,
        is_admin: isAdmin
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Remove allowed user (admin only)
  async removeAllowedUser(id: string): Promise<void> {
    const { error } = await supabase
      .from('allowed_users')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Update user admin status (admin only)
  async updateUserAdminStatus(email: string, isAdmin: boolean): Promise<void> {
    const { error } = await supabase
      .from('allowed_users')
      .update({ is_admin: isAdmin })
      .eq('email', email)

    if (error) throw error

    // Also update profile if user exists
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ is_admin: isAdmin })
      .eq('email', email)

    if (profileError && profileError.code !== 'PGRST116') { // Ignore "no rows" error
      throw profileError
    }
  },

  // Get all user profiles (admin only)
  async getAllProfiles(): Promise<UserProfile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Approve/disapprove user (admin only)
  async updateUserApproval(userId: string, isApproved: boolean): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({ is_approved: isApproved })
      .eq('id', userId)

    if (error) throw error
  }
}