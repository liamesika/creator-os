'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { setCurrentUserId } from '@/lib/supabase/auth-helpers'
import type { User as SupabaseUser } from '@supabase/supabase-js'
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
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserProfile(session.user)
      } else {
        setIsLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await loadUserProfile(session.user)
      } else {
        setUser(null)
        setIsLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      // Clear demo mode and all stores when a real user logs in
      // This prevents demo data from leaking into real user sessions
      clearAllStores()

      // Get or create user profile
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = not found
        console.error('Error loading profile:', error)
      }

      if (!profile) {
        // Create profile if it doesn't exist
        const { data: newProfile, error: insertError } = await supabase
          .from('user_profiles')
          .insert({
            id: supabaseUser.id,
            email: supabaseUser.email,
            name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'משתמש',
            plan: 'free',
          })
          .select()
          .single()

        if (insertError) {
          console.error('Error creating profile:', insertError)
        }

        const userData = {
          id: supabaseUser.id,
          name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'משתמש',
          email: supabaseUser.email || '',
          plan: 'free' as const,
        }
        setUser(userData)
        setCurrentUserId(userData.id)
      } else {
        const userData = {
          id: profile.id,
          name: profile.name || 'משתמש',
          email: profile.email || '',
          plan: profile.plan || 'free' as const,
          accountType: profile.account_type || 'creator' as const,
        }
        setUser(userData)
        setCurrentUserId(userData.id)
      }
    } catch (error) {
      console.error('Error in loadUserProfile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        await loadUserProfile(data.user)
      }
    } catch (error: any) {
      console.error('Login error:', error)
      throw new Error(error.message || 'שגיאה בהתחברות')
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (name: string, email: string, password: string) => {
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
        await loadUserProfile(data.user)
      }
    } catch (error: any) {
      console.error('Signup error:', error)
      throw new Error(error.message || 'שגיאה ברישום')
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setCurrentUserId(null)
    // Clear all stores to prevent data leakage between users/demo mode
    clearAllStores()
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
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
