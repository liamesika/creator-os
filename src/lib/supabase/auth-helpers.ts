import { createClient } from './client'

/**
 * Get the current authenticated user's ID from Supabase
 * @throws Error if user is not authenticated
 */
export async function getCurrentUserId(): Promise<string> {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    throw new Error('User not authenticated')
  }

  return user.id
}

/**
 * Get the current authenticated user's ID synchronously from session
 * Returns null if not authenticated
 */
export function getCurrentUserIdSync(): string | null {
  if (typeof window === 'undefined') return null

  // Get from auth context stored in window
  const authData = (window as any).__SUPABASE_USER_ID__
  return authData || null
}

/**
 * Store user ID in window for sync access
 */
export function setCurrentUserId(userId: string | null) {
  if (typeof window !== 'undefined') {
    (window as any).__SUPABASE_USER_ID__ = userId
  }
}
