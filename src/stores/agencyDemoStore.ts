import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useEffect, useState } from 'react'

interface AgencyDemoState {
  isAgencyDemo: boolean
  isInitialized: boolean
  _hasHydrated: boolean
  entrySource: 'pricing' | null // Track entry source for security

  activateAgencyDemo: () => void
  deactivateAgencyDemo: () => void
  setHasHydrated: (state: boolean) => void
  validateEntry: () => boolean
}

export const useAgencyDemoStore = create<AgencyDemoState>()(
  persist(
    (set, get) => ({
      isAgencyDemo: false,
      isInitialized: false,
      _hasHydrated: false,
      entrySource: null,

      setHasHydrated: (state: boolean) => {
        set({ _hasHydrated: state })
      },

      activateAgencyDemo: () => {
        // Mark entry source as pricing page
        sessionStorage.setItem('agency-demo-entry', 'pricing')
        set({ isAgencyDemo: true, isInitialized: true, entrySource: 'pricing' })
      },

      deactivateAgencyDemo: () => {
        sessionStorage.removeItem('agency-demo-entry')
        set({ isAgencyDemo: false, isInitialized: false, entrySource: null })
      },

      validateEntry: () => {
        // Validate that entry came from pricing page
        const entrySource = sessionStorage.getItem('agency-demo-entry')
        return entrySource === 'pricing'
      },
    }),
    {
      name: 'agency-demo-storage',
      partialize: (state) => ({
        isAgencyDemo: state.isAgencyDemo,
        isInitialized: state.isInitialized
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)

// Hook to check if store has hydrated
export const useAgencyDemoHydration = () => {
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const unsubFinishHydration = useAgencyDemoStore.persist.onFinishHydration(() => {
      setHydrated(true)
    })

    if (useAgencyDemoStore.persist.hasHydrated()) {
      setHydrated(true)
    }

    return () => {
      unsubFinishHydration()
    }
  }, [])

  return hydrated
}
