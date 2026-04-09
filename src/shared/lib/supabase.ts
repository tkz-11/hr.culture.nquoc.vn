import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

// Supabase Auth SDK — dùng shared cookie 'nquoc-auth'
// Frontend KHÔNG query Supabase trực tiếp — chỉ dùng để auth
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: 'nquoc-auth',
    autoRefreshToken: true,
    persistSession: true,
  },
})
