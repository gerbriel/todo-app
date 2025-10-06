import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create client with proper configuration
export const supabase = createClient(
  supabaseUrl || 'https://btiyyxmiwngikpuygpsq.supabase.co',
  supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0aXl5eG1pd25naWtwdXlncHNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNzA0MDUsImV4cCI6MjA3NDc0NjQwNX0.4tt9SZ0VRsCObhvTKJzqb1IEkfGwi8IL_yI8PHjMvdo',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);

// Check if Supabase is properly configured
export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && supabaseAnonKey);
};

// Singleton client getter
export const getSupabase = () => supabase;