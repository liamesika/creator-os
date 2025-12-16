import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

// Singleton client instance to ensure consistent auth state
let supabaseClient: SupabaseClient | null = null

export function createClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error('Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set')
  }

  // Return existing client if available (singleton pattern)
  if (supabaseClient) {
    return supabaseClient
  }

  // Create new client with explicit persistence configuration
  supabaseClient = createBrowserClient(url, key, {
    auth: {
      // Enable session persistence to localStorage
      persistSession: true,
      // Enable automatic token refresh
      autoRefreshToken: true,
      // Detect session from URL (for OAuth callbacks)
      detectSessionInUrl: true,
      // Use localStorage for session storage (survives hard refresh)
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      // Storage key for the session
      storageKey: 'creators-os-auth',
      // Flow type for PKCE
      flowType: 'pkce',
    },
  })

  return supabaseClient
}

/**
 * Clear the singleton client (call on logout to ensure fresh state)
 */
export function clearSupabaseClient() {
  supabaseClient = null
}
