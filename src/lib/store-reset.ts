import { useCompaniesStore } from '@/stores/companiesStore'
import { useCalendarStore } from '@/stores/calendarStore'
import { useTasksStore } from '@/stores/tasksStore'
import { useGoalsStore } from '@/stores/goalsStore'
import { useAIContentStore } from '@/stores/aiContentStore'
import { useActivityStore } from '@/stores/activityStore'
import { useDemoModeStore } from '@/stores/demoModeStore'
import { useAgencyDemoStore } from '@/stores/agencyDemoStore'

/**
 * Clears all stores to their initial empty state.
 * Called on logout to prevent data leakage between users or demo sessions.
 */
export function clearAllStores() {
  // Clear demo mode flags first
  useDemoModeStore.setState({
    isDemo: false,
    isInitialized: false,
  })

  useAgencyDemoStore.setState({
    isAgencyDemo: false,
    isInitialized: false,
    entrySource: null,
  })

  // Clear data stores
  useCompaniesStore.setState({
    companies: [],
    selectedCompany: null,
    isCreateModalOpen: false,
    isProfileDrawerOpen: false,
    editingCompany: null,
    isLoading: false,
    isInitialized: false,
  })

  useCalendarStore.setState({
    events: [],
    selectedDate: new Date(),
    currentView: 'month',
    selectedEvent: null,
    isCreateModalOpen: false,
    isEventDrawerOpen: false,
    companyFilter: null,
    isLoading: false,
    isInitialized: false,
  })

  useTasksStore.setState({
    tasks: [],
    selectedTask: null,
    isCreateModalOpen: false,
    isTaskDrawerOpen: false,
    editingTask: null,
    filters: {},
    isLoading: false,
    isInitialized: false,
  })

  useGoalsStore.setState({
    goals: [],
    selectedDate: new Date().toISOString().split('T')[0],
    isCreateModalOpen: false,
    isReflectionModalOpen: false,
    editingGoal: null,
    isLoading: false,
    isInitialized: false,
  })

  useAIContentStore.setState({
    generations: [],
    selectedGeneration: null,
    isGenerating: false,
    isLoading: false,
    isInitialized: false,
  })

  useActivityStore.setState({
    events: [],
    isLoading: false,
  })

  // Clear localStorage for stores that might persist demo data keys
  if (typeof window !== 'undefined') {
    localStorage.removeItem('demo-mode-storage')
    localStorage.removeItem('agency-demo-storage')
  }
}
