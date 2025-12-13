import { create } from 'zustand'

/**
 * Demo Script Mode Store
 *
 * INTERNAL ONLY - For guided product demos
 * Not user-facing, not persisted
 *
 * Enables a 5-minute guided tour of key features with
 * numbered highlights and Hebrew captions
 */

export type DemoScriptStep =
  | 'dashboard'
  | 'calendar'
  | 'activity'
  | 'goals'
  | 'ai-content'
  | null

interface DemoScriptState {
  isEnabled: boolean
  currentStep: DemoScriptStep
  completedSteps: Set<string>

  enableDemoScript: () => void
  disableDemoScript: () => void
  toggleDemoScript: () => void

  goToStep: (step: DemoScriptStep) => void
  nextStep: () => void
  markCompleted: (step: string) => void
  reset: () => void
}

const STEP_ORDER: DemoScriptStep[] = [
  'dashboard',
  'calendar',
  'activity',
  'goals',
  'ai-content',
]

export const useDemoScriptStore = create<DemoScriptState>()((set, get) => ({
  isEnabled: false,
  currentStep: null,
  completedSteps: new Set(),

  enableDemoScript: () => {
    set({
      isEnabled: true,
      currentStep: 'dashboard',
      completedSteps: new Set()
    })
    console.log('📖 Demo Script: ENABLED - Starting tour')
  },

  disableDemoScript: () => {
    set({
      isEnabled: false,
      currentStep: null,
      completedSteps: new Set()
    })
    console.log('📖 Demo Script: DISABLED')
  },

  toggleDemoScript: () => {
    const { isEnabled } = get()
    if (isEnabled) {
      get().disableDemoScript()
    } else {
      get().enableDemoScript()
    }
  },

  goToStep: (step: DemoScriptStep) => {
    set({ currentStep: step })
    console.log(`📖 Demo Script: Step → ${step}`)
  },

  nextStep: () => {
    const { currentStep } = get()
    const currentIndex = STEP_ORDER.indexOf(currentStep)

    if (currentIndex === -1 || currentIndex >= STEP_ORDER.length - 1) {
      // Tour complete
      get().disableDemoScript()
      console.log('📖 Demo Script: Tour completed!')
    } else {
      const nextStep = STEP_ORDER[currentIndex + 1]
      set({ currentStep: nextStep })
      console.log(`📖 Demo Script: Next → ${nextStep}`)
    }
  },

  markCompleted: (step: string) => {
    set((state) => {
      const completedSteps = new Set(state.completedSteps)
      completedSteps.add(step)
      return { completedSteps }
    })
  },

  reset: () => {
    set({
      currentStep: 'dashboard',
      completedSteps: new Set()
    })
    console.log('📖 Demo Script: Reset to beginning')
  },
}))

// Dev-only: Enable via console
if (typeof window !== 'undefined') {
  ;(window as any).__enableDemoScript = () => {
    useDemoScriptStore.getState().enableDemoScript()
  }
  ;(window as any).__disableDemoScript = () => {
    useDemoScriptStore.getState().disableDemoScript()
  }
  ;(window as any).__toggleDemoScript = () => {
    useDemoScriptStore.getState().toggleDemoScript()
  }
  ;(window as any).__resetDemoScript = () => {
    useDemoScriptStore.getState().reset()
  }
}
