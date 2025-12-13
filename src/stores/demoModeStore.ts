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

        // Populate companies - directly set into store state
        const companiesStore = useCompaniesStore.getState()
        const companiesWithDates = DEMO_DATA.companies.map((company) => ({
          ...company,
          createdAt: new Date(),
          updatedAt: new Date(),
        }))
        companiesStore.companies.push(...companiesWithDates)

        // Populate events - directly set into store state
        const calendarStore = useCalendarStore.getState()
        const eventsWithDates = DEMO_DATA.events.map((event) => ({
          ...event,
          createdAt: new Date(),
          updatedAt: new Date(),
        }))
        calendarStore.events.push(...eventsWithDates)

        // Populate tasks - directly set into store state
        const tasksStore = useTasksStore.getState()
        const tasksWithDates = DEMO_DATA.tasks.map((task) => ({
          ...task,
          createdAt: new Date(),
          updatedAt: new Date(),
        }))
        tasksStore.tasks.push(...tasksWithDates)

        // Populate goals - directly set into store state
        const goalsStore = useGoalsStore.getState()
        const goalsWithDates = DEMO_DATA.goals.map((goal) => ({
          ...goal,
          createdAt: new Date(),
          updatedAt: new Date(),
        }))
        goalsStore.goals.push(...goalsWithDates)

        // Populate AI content - directly set into store state
        const aiContentStore = useAIContentStore.getState()
        const contentWithDates = DEMO_DATA.aiContent.map((content) => ({
          ...content,
          createdAt: new Date(),
          updatedAt: new Date(),
        }))
        aiContentStore.generations.push(...contentWithDates)

        // Populate activities - directly set into store state
        const activityStore = useActivityStore.getState()
        activityStore.events.push(...DEMO_DATA.activities)

        set({ isInitialized: true })
      },

      clearDemoData: () => {
        // Clear all demo data from stores
        const companiesStore = useCompaniesStore.getState()
        const calendarStore = useCalendarStore.getState()
        const tasksStore = useTasksStore.getState()
        const goalsStore = useGoalsStore.getState()
        const aiContentStore = useAIContentStore.getState()
        const activityStore = useActivityStore.getState()

        // Remove demo items (those with 'demo-' prefix)
        companiesStore.companies
          .filter((c) => c.id.startsWith('demo-'))
          .forEach((c) => companiesStore.deleteCompany(c.id))

        calendarStore.events
          .filter((e) => e.id.startsWith('demo-'))
          .forEach((e) => calendarStore.deleteEvent(e.id))

        tasksStore.tasks
          .filter((t) => t.id.startsWith('demo-'))
          .forEach((t) => tasksStore.deleteTask(t.id))

        // Filter out demo goals
        goalsStore.goals = goalsStore.goals.filter(
          (g) => !g.id.startsWith('demo-')
        )

        aiContentStore.generations
          .filter((c) => c.id.startsWith('demo-'))
          .forEach((c) => aiContentStore.deleteGeneration(c.id))

        // Filter out demo activities
        activityStore.events = activityStore.events.filter(
          (a) => !a.id.startsWith('demo-')
        )

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
