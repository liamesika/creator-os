'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { useDemoModeStore, useDemoModeHydration } from '@/stores/demoModeStore'
import { useStoreInitialization } from '@/hooks/useStoreInitialization'
import Sidebar from '@/components/app/Sidebar'
import AppHeader from '@/components/app/AppHeader'
import MobileNav from '@/components/app/MobileNav'
import SplashScreen from '@/components/app/SplashScreen'
import { Loader2 } from 'lucide-react'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth()
  const { isDemo } = useDemoModeStore()
  const isDemoHydrated = useDemoModeHydration()
  const router = useRouter()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const [showSplash, setShowSplash] = useState(true)
  const [appReady, setAppReady] = useState(false)

  // Initialize all stores with user data
  useStoreInitialization()

  useEffect(() => {
    // Wait for demo store to hydrate before checking auth
    if (!isDemoHydrated) return

    // Allow access if user is logged in OR if demo mode is active
    if (!isLoading && !user && !isDemo) {
      router.push('/login')
    }
  }, [user, isLoading, isDemo, isDemoHydrated, router])

  useEffect(() => {
    // Check if user just logged in or demo mode activated
    const justLoggedIn = sessionStorage.getItem('creators-os-just-logged-in')
    if (justLoggedIn === 'true' && (user || isDemo)) {
      setShowSplash(true)
      sessionStorage.removeItem('creators-os-just-logged-in')
    } else if (user || isDemo) {
      // Check if this is a new session
      const hasSeenSplash = sessionStorage.getItem('creators-os-splash-seen')
      if (!hasSeenSplash) {
        setShowSplash(true)
      } else {
        setShowSplash(false)
        setAppReady(true)
      }
    }
  }, [user, isDemo])

  const handleSplashComplete = () => {
    setShowSplash(false)
    sessionStorage.setItem('creators-os-splash-seen', 'true')
    setTimeout(() => setAppReady(true), 100)
  }

  // Wait for both auth and demo store to be ready
  if (isLoading || !isDemoHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={32} className="text-accent-600 animate-spin" />
          <p className="text-sm text-neutral-500">טוען...</p>
        </div>
      </div>
    )
  }

  // Allow access if user is logged in OR demo mode is active
  if (!user && !isDemo) {
    return null
  }

  return (
    <>
      <AnimatePresence mode="wait">
        {showSplash && (
          <SplashScreen onComplete={handleSplashComplete} />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showSplash ? 0 : 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="app-container"
      >
      {/* Sidebar (Desktop) */}
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Header */}
      <AppHeader sidebarCollapsed={sidebarCollapsed} />

      {/* Main content */}
      <main
        className="main-content pb-20 lg:pb-6 transition-all duration-300"
        style={{
          marginRight: 0,
        }}
      >
        <div
          className="hidden lg:block transition-all duration-300"
          style={{
            marginRight: sidebarCollapsed ? '72px' : '256px',
          }}
        >
          {children}
        </div>
        <div className="lg:hidden">
          {children}
        </div>
      </main>

      {/* Mobile Navigation */}
      <MobileNav />
      </motion.div>
    </>
  )
}
