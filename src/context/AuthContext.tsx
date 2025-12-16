'use client'

import { createContext, useContext, useState, useEffect, useRef, ReactNode, useCallback } from 'react'
import { createClient, clearSupabaseClient } from '@/lib/supabase/client'
import { setCurrentUserId } from '@/lib/supabase/auth-helpers'
import type { User as SupabaseUser, AuthChangeEvent, Session } from '@supabase/supabase-js'
import { clearAllStores } from '@/lib/store-reset'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  plan?: 'free' | 'premium'
  accountType?: 'creator' | 'agency'
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isInitialized: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
  const initRef = useRef(false)
  const supabaseRef = useRef(createClient())

  const loadUserProfile = useCallback(async (supabaseUser: SupabaseUser): Promise<User | null> => {
    const supabase = supabaseRef.current

    try {
      // Get or create user profile
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error)
      }

      let userData: User

      if (!profile) {
        // Create profile if it doesn't exist
        const displayName = supabaseUser.user_metadata?.name ||
                           supabaseUser.email?.split('@')[0] ||
                           'User'

        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert({
            id: supabaseUser.id,
            email: supabaseUser.email,
            name: displayName,
            plan: 'free',
          })
          .select()
          .single()

        if (insertError) {
          console.error('Error creating profile:', insertError)
        }

        userData = {
          id: supabaseUser.id,
          name: displayName,
          email: supabaseUser.email || '',
          plan: 'free' as const,
        }
      } else {
        // Use profile name, fallback to email prefix, never use generic "user"
        const displayName = profile.name ||
                           supabaseUser.user_metadata?.name ||
                           supabaseUser.email?.split('@')[0] ||
                           'User'

        userData = {
          id: profile.id,
          name: displayName,
          email: profile.email || supabaseUser.email || '',
          plan: profile.plan || 'free' as const,
          accountType: profile.account_type || 'creator' as const,
        }
      }

      return userData
    } catch (error) {
      console.error('Error in loadUserProfile:', error)
      return null
    }
  }, [])

  useEffect(() => {
    // Prevent double initialization in React StrictMode
    if (initRef.current) return
    initRef.current = true

    const supabase = supabaseRef.current
    let mounted = true

    const initializeAuth = async () => {
      try {
        // Get current session from storage
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Error getting session:', error)
          if (mounted) {
            setIsLoading(false)
            setIsInitialized(true)
          }
          return
        }

        if (session?.user) {
          // Clear any demo data when restoring a real user session
          clearAllStores()

          const userData = await loadUserProfile(session.user)
          if (mounted && userData) {
            setUser(userData)
            setCurrentUserId(userData.id)
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        if (mounted) {
          setIsLoading(false)
          setIsInitialized(true)
        }
      }
    }

    // Initialize auth state
    initializeAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      if (!mounted) return

      if (event === 'SIGNED_OUT') {
        setUser(null)
        setCurrentUserId(null)
        setIsLoading(false)
        return
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          // Clear demo data on sign in
          if (event === 'SIGNED_IN') {
            clearAllStores()
          }

          setIsLoading(true)
          const userData = await loadUserProfile(session.user)
          if (mounted && userData) {
            setUser(userData)
            setCurrentUserId(userData.id)
          }
          setIsLoading(false)
        }
      }

      if (event === 'USER_UPDATED' && session?.user) {
        const userData = await loadUserProfile(session.user)
        if (mounted && userData) {
          setUser(userData)
        }
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [loadUserProfile])

  const login = async (email: string, password: string) => {
    const supabase = supabaseRef.current
    setIsLoading(true)

    try {
      // Clear any existing session data first
      clearAllStores()

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        const userData = await loadUserProfile(data.user)
        if (userData) {
          setUser(userData)
          setCurrentUserId(userData.id)
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Login error'
      console.error('Login error:', error)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (name: string, email: string, password: string) => {
    const supabase = supabaseRef.current
    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      })

      if (error) throw error

      if (data.user) {
        const userData = await loadUserProfile(data.user)
        if (userData) {
          setUser(userData)
          setCurrentUserId(userData.id)
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Signup error'
      console.error('Signup error:', error)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    const supabase = supabaseRef.current

    try {
      // Sign out from Supabase (this clears the session)
      const { error } = await supabase.auth.signOut({ scope: 'local' })

      if (error) {
        console.error('Logout error:', error)
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Always clear local state regardless of signOut result
      setUser(null)
      setCurrentUserId(null)

      // Clear all stores to prevent data leakage
      clearAllStores()

      // Clear the Supabase client singleton to ensure fresh state
      clearSupabaseClient()

      // Clear auth storage key explicitly
      if (typeof window !== 'undefined') {
        localStorage.removeItem('creators-os-auth')
        // Also clear any Supabase default storage keys
        const keysToRemove: string[] = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && (key.startsWith('sb-') || key.includes('supabase'))) {
            keysToRemove.push(key)
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key))

        // Clear session storage as well
        sessionStorage.removeItem('creators-os-splash-seen')
        sessionStorage.removeItem('creators-os-just-logged-in')
      }
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, isInitialized, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
