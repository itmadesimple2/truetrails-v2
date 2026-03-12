import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://hqbvbuhkkytzxkhpxkyw.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxYnZidWhra3l0enhraHB4a3l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxOTk2NDYsImV4cCI6MjA4ODc3NTY0Nn0.L92vm6m7d8oyB8rz2Y6ly-j8IL4iAvrktR9Ch5mqFAA'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    flowType: 'pkce',
    detectSessionInUrl: true,
    persistSession: true,
    autoRefreshToken: true,
  }
})
