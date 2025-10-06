import { isSupabaseConfigured } from '@/app/supabaseClient';

/**
 * Check if the current session is in guest mode
 * This combines environment configuration check with user state
 */
export const isGuestMode = (): boolean => {
  // If Supabase is not configured, we're always in guest mode
  if (!isSupabaseConfigured()) {
    return true;
  }
  
  // Check if the current user is a guest user
  // This would need to be combined with AuthContext in components
  try {
    const userEmail = localStorage.getItem('sb-auth-user')?.includes('guest@demo.app');
    return !!userEmail;
  } catch {
    return false;
  }
};

/**
 * Get the current user's authentication state
 */
export const getAuthState = () => {
  try {
    const session = localStorage.getItem('sb-auth-session');
    return session ? JSON.parse(session) : null;
  } catch {
    return null;
  }
};