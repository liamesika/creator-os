import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useEffect, useState } from 'react'
import { DEMO_DATA } from '@/lib/demo-data'
import { useCompaniesStore } from './companiesStore'
import { useCalendarStore } from './calendarStore'
import { useTasksStore } from './tasksStore'
import { useGoalsStore } from './goalsStore'
import { useAIContentStore } from './aiContentStore'
import { useActivityStore } from './activityStore'
import { toast } from 'sonner'

interface DemoModeState {
  isDemo: boolean
  isInitialized: boolean
  _hasHydrated: boolean

  activateDemoMode: () => void
  deactivateDemoMode: () => void
  resetDemo: () => void
  populateDemoData: () => void
  clearDemoData: () => void
  setHasHydrated: (state: boolean) => void
}

export const useDemoModeStore = create<DemoModeState>()(
  persist(
    (set, get) => ({
      isDemo: false,
      isInitialized: false,
      _hasHydrated: false,

      setHasHydrated: (state: boolean) => {
        set({ _hasHydrated: state })
      },

      activateDemoMode: () => {
        set({ isDemo: true })
        const { populateDemoData } = get()
        populateDemoData()
        toast.success('מצב הדגמה פעיל - נתוני הדגמה נטענו', {
          duration: 4000,
        })
      },

      deactivateDemoMode: () => {
        const { clearDemoData } = get()
        clearDemoData()
        set({ isDemo: false, isInitialized: false })
        toast.success('חזרת למצב רגיל')
      },

      resetDemo: () => {
        const { clearDemoData, populateDemoData } = get()
        clearDemoData()
        populateDemoData()
        toast.success('נתוני ההדגמה אופסו')
      },

      populateDemoData: () => {
        if (get().isInitialized) return

        // Populate companies - use setState for proper reactivity
        const companiesWithDates = DEMO_DATA.companies.map((company) => ({
          ...company,
          createdAt: new Date(),
          updatedAt: new Date(),
        }))
        useCompaniesStore.setState((state) => ({
          companies: [...state.companies, ...companiesWithDates],
        }))

        // Populate events - use setState for proper reactivity
        const eventsWithDates = DEMO_DATA.events.map((event) => ({
          ...event,
          createdAt: new Date(),
          updatedAt: new Date(),
        }))
        useCalendarStore.setState((state) => ({
          events: [...state.events, ...eventsWithDates],
        }))

        // Populate tasks - use setState for proper reactivity
        const tasksWithDates = DEMO_DATA.tasks.map((task) => ({
          ...task,
          createdAt: new Date(),
          updatedAt: new Date(),
        }))
        useTasksStore.setState((state) => ({
          tasks: [...state.tasks, ...tasksWithDates],
        }))

        // Populate goals - use setState for proper reactivity
        const goalsWithDates = DEMO_DATA.goals.map((goal) => ({
          ...goal,
          createdAt: new Date(),
          updatedAt: new Date(),
        }))
        useGoalsStore.setState((state) => ({
          goals: [...state.goals, ...goalsWithDates],
        }))

        // Populate AI content - use setState for proper reactivity
        const contentWithDates = DEMO_DATA.aiContent.map((content) => ({
          ...content,
          createdAt: new Date(),
          updatedAt: new Date(),
        }))
        useAIContentStore.setState((state) => ({
          generations: [...state.generations, ...contentWithDates],
        }))

        // Populate activities - use setState for proper reactivity
        useActivityStore.setState((state) => ({
          events: [...state.events, ...DEMO_DATA.activities],
        }))

        set({ isInitialized: true })
      },

      clearDemoData: () => {
        // Remove demo items (those with 'demo-' prefix) using setState for proper reactivity
        useCompaniesStore.setState((state) => ({
          companies: state.companies.filter((c) => !c.id.startsWith('demo-')),
        }))

        useCalendarStore.setState((state) => ({
          events: state.events.filter((e) => !e.id.startsWith('demo-')),
        }))

        useTasksStore.setState((state) => ({
          tasks: state.tasks.filter((t) => !t.id.startsWith('demo-')),
        }))

        useGoalsStore.setState((state) => ({
          goals: state.goals.filter((g) => !g.id.startsWith('demo-')),
        }))

        useAIContentStore.setState((state) => ({
          generations: state.generations.filter((c) => !c.id.startsWith('demo-')),
        }))

        useActivityStore.setState((state) => ({
          events: state.events.filter((a) => !a.id.startsWith('demo-')),
        }))

        set({ isInitialized: false })
      },
    }),
    {
      name: 'demo-mode-storage',
      partialize: (state) => ({ isDemo: state.isDemo, isInitialized: state.isInitialized }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)

// Hook to check if store has hydrated
export const useDemoModeHydration = () => {
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    // Check if already hydrated
    const unsubFinishHydration = useDemoModeStore.persist.onFinishHydration(() => {
      setHydrated(true)
    })

    // If already hydrated (e.g., from SSR), set immediately
    if (useDemoModeStore.persist.hasHydrated()) {
      setHydrated(true)
    }

    return () => {
      unsubFinishHydration()
    }
  }, [])

  return hydrated
}
