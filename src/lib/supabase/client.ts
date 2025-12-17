import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

// Custom storage key for this project
export const AUTH_STORAGE_KEY = 'creators-os-auth'

// Singleton client instance to ensure consistent auth state
let supabaseClient: SupabaseClient | null = null

/**
 * Extract project ref from Supabase URL for legacy storage key migration
 */
function getProjectRef(): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url) return null
  // URL format: https://<project-ref>.supabase.co
  const match = url.match(/https:\/\/([^.]+)\.supabase\.co/)
  return match ? match[1] : null
}

/**
 * Get the legacy Supabase storage key for this project
 */
export function getLegacyStorageKey(): string | null {
  const projectRef = getProjectRef()
  return projectRef ? `sb-${projectRef}-auth-token` : null
}

/**
 * Migrate session from legacy storage key to new custom key (one-time)
 * This prevents existing users from being logged out after the storage key change
 */
function migrateLegacyStorage(): void {
  if (typeof window === 'undefined') return

  const legacyKey = getLegacyStorageKey()
  if (!legacyKey) return

  // Check if we already have data in the new key
  const existingData = localStorage.getItem(AUTH_STORAGE_KEY)
  if (existingData) return // Already migrated or new user

  // Check for legacy data
  const legacyData = localStorage.getItem(legacyKey)
  if (legacyData) {
    // Migrate to new key
    localStorage.setItem(AUTH_STORAGE_KEY, legacyData)
    // Remove legacy key after migration
    localStorage.removeItem(legacyKey)
    console.log('[Auth] Migrated session from legacy storage key')
  }
}

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

  // Migrate legacy storage before creating client
  migrateLegacyStorage()

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
      storageKey: AUTH_STORAGE_KEY,
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

/**
 * Clear only this project's auth storage keys (not other sb-* keys)
 */
export function clearProjectAuthStorage(): void {
  if (typeof window === 'undefined') return

  // Clear our custom storage key
  localStorage.removeItem(AUTH_STORAGE_KEY)

  // Clear legacy key for this project only
  const legacyKey = getLegacyStorageKey()
  if (legacyKey) {
    localStorage.removeItem(legacyKey)
  }
}
