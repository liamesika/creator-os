'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { useDemoModeStore, useDemoModeHydration } from '@/stores/demoModeStore'
import { useAgencyDemoStore, useAgencyDemoHydration } from '@/stores/agencyDemoStore'
import { useStoreInitialization } from '@/hooks/useStoreInitialization'
import Sidebar from '@/components/app/Sidebar'
import AppHeader from '@/components/app/AppHeader'
import MobileNav from '@/components/app/MobileNav'
import SplashScreen from '@/components/app/SplashScreen'
import AgencyDemoBanner from '@/components/app/AgencyDemoBanner'
import { Loader2 } from 'lucide-react'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading, isInitialized } = useAuth()
  const { isDemo } = useDemoModeStore()
  const { isAgencyDemo } = useAgencyDemoStore()
  const isDemoHydrated = useDemoModeHydration()
  const isAgencyDemoHydrated = useAgencyDemoHydration()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const [showSplash, setShowSplash] = useState(true)
  const [appReady, setAppReady] = useState(false)

  // Initialize all stores with user data
  useStoreInitialization()

  // Combined demo mode check
  const isAnyDemoMode = isDemo || isAgencyDemo
  const allStoresHydrated = isDemoHydrated && isAgencyDemoHydrated

  useEffect(() => {
    // Gate ONLY on auth initialization - not on store hydration
    // This prevents deadlock where stores wait for auth and auth waits for stores
    if (!isInitialized) return

    // Allow access if user is logged in OR if any demo mode is active
    if (!user && !isAnyDemoMode) {
      router.replace('/login')
    }
  }, [user, isInitialized, isAnyDemoMode, router])

  // Demo mode effects - separate from auth gating to prevent deadlock
  useEffect(() => {
    // Only process demo mode after both auth and demo stores are ready
    if (!isInitialized || !allStoresHydrated) return

    // Only re-populate demo data on page refresh if:
    // 1. Demo mode is active (isDemo flag is set)
    // 2. AND there's no real user logged in (to prevent contamination)
    if (isDemo && !user) {
      const { populateDemoData } = useDemoModeStore.getState()
      populateDemoData()
    }

    // For agency demo, validate entry and restrict to agency routes
    if (isAgencyDemo) {
      const { validateEntry, deactivateAgencyDemo } = useAgencyDemoStore.getState()
      // If entry is invalid and trying to access non-agency routes, deactivate
      if (!validateEntry() && !pathname?.startsWith('/agency')) {
        deactivateAgencyDemo()
        router.push('/pricing/agencies')
      }
    }
  }, [user, isInitialized, allStoresHydrated, isDemo, isAgencyDemo, pathname, router])

  useEffect(() => {
    // Check if user just logged in or demo mode activated
    const justLoggedIn = sessionStorage.getItem('creators-os-just-logged-in')
    if (justLoggedIn === 'true' && (user || isAnyDemoMode)) {
      setShowSplash(true)
      sessionStorage.removeItem('creators-os-just-logged-in')
    } else if (user || isAnyDemoMode) {
      // Check if this is a new session
      const hasSeenSplash = sessionStorage.getItem('creators-os-splash-seen')
      if (!hasSeenSplash) {
        setShowSplash(true)
      } else {
        setShowSplash(false)
        setAppReady(true)
      }
    }
  }, [user, isAnyDemoMode])

  const handleSplashComplete = () => {
    setShowSplash(false)
    sessionStorage.setItem('creators-os-splash-seen', 'true')
    setTimeout(() => setAppReady(true), 100)
  }

  // Wait for auth to be fully initialized - do NOT wait for store hydration
  // Store hydration happens in parallel, not blocking initial render
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={32} className="text-accent-600 animate-spin" />
          <p className="text-sm text-neutral-500">טוען...</p>
        </div>
      </div>
    )
  }

  // Allow access if user is logged in OR any demo mode is active
  if (!user && !isAnyDemoMode) {
    return null
  }

  return (
    <>
      {/* Agency Demo Banner */}
      {isAgencyDemo && <AgencyDemoBanner />}

      <AnimatePresence mode="wait">
        {showSplash && (
          <SplashScreen onComplete={handleSplashComplete} />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showSplash ? 0 : 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className={`app-container ${isAgencyDemo ? 'pt-12' : ''}`}
      >
      {/* Sidebar (Desktop) */}
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        isAgencyDemo={isAgencyDemo}
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
