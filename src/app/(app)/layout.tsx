'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { useDemoModeStore } from '@/stores/demoModeStore'
import { useAgencyDemoStore } from '@/stores/agencyDemoStore'
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
  // useAuth now returns demo user when in demo mode
  // user will always be defined when demo mode is active
  const { user, isLoading, isInitialized } = useAuth()
  const { isDemo } = useDemoModeStore()
  const { isAgencyDemo } = useAgencyDemoStore()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const [showSplash, setShowSplash] = useState(true)
  const [appReady, setAppReady] = useState(false)
  const demoDataPopulatedRef = useRef(false)

  // Initialize all stores with user data (only for real users, not demo)
  useStoreInitialization()

  // Auth gating - redirect to login if not authenticated
  // In demo mode, useAuth returns demo user so user will be defined
  useEffect(() => {
    if (!isInitialized) return

    // user is now always defined in demo mode (useAuth handles this)
    if (!user) {
      router.replace('/login')
    }
  }, [user, isInitialized, router])

  // Demo mode data population - run once, synchronously
  useEffect(() => {
    if (!isInitialized) return

    // Populate demo data immediately when demo mode is active (only once per session)
    if (isDemo && !demoDataPopulatedRef.current) {
      demoDataPopulatedRef.current = true
      const { populateDemoData } = useDemoModeStore.getState()
      populateDemoData()
    }

    // For agency demo, validate entry and restrict to agency routes
    if (isAgencyDemo && !pathname?.startsWith('/agency')) {
      const { validateEntry, deactivateAgencyDemo } = useAgencyDemoStore.getState()
      if (!validateEntry()) {
        deactivateAgencyDemo()
        router.push('/pricing/agencies')
      }
    }
  }, [isInitialized, isDemo, isAgencyDemo, pathname, router])

  // Splash screen logic
  useEffect(() => {
    const justLoggedIn = sessionStorage.getItem('creators-os-just-logged-in')
    if (justLoggedIn === 'true' && user) {
      setShowSplash(true)
      sessionStorage.removeItem('creators-os-just-logged-in')
    } else if (user) {
      const hasSeenSplash = sessionStorage.getItem('creators-os-splash-seen')
      if (!hasSeenSplash) {
        setShowSplash(true)
      } else {
        setShowSplash(false)
        setAppReady(true)
      }
    }
  }, [user])

  const handleSplashComplete = () => {
    setShowSplash(false)
    sessionStorage.setItem('creators-os-splash-seen', 'true')
    setTimeout(() => setAppReady(true), 100)
  }

  // Wait for auth initialization only - demo mode is synchronous via zustand
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

  // No user means not authenticated and not in demo mode
  if (!user) {
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
