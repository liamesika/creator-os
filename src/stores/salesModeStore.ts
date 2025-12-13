import { create } from 'zustand'

/**
 * Sales Mode Store
 *
 * INTERNAL ONLY - Not user-facing, not persisted
 * Used for sales demos and presentations
 *
 * When enabled:
 * - Hides Free tier limitations
 * - Emphasizes Agency features
 * - Shows "Custom pricing" instead of exact numbers
 */

interface SalesModeState {
  isEnabled: boolean
  enableSalesMode: () => void
  disableSalesMode: () => void
  toggleSalesMode: () => void
}

export const useSalesModeStore = create<SalesModeState>()((set) => ({
  isEnabled: false,

  enableSalesMode: () => {
    set({ isEnabled: true })
    console.log('🎯 Sales Mode: ENABLED')
  },

  disableSalesMode: () => {
    set({ isEnabled: false })
    console.log('🎯 Sales Mode: DISABLED')
  },

  toggleSalesMode: () => {
    set((state) => {
      const newState = !state.isEnabled
      console.log(`🎯 Sales Mode: ${newState ? 'ENABLED' : 'DISABLED'}`)
      return { isEnabled: newState }
    })
  },
}))

// Dev-only: Enable via console
if (typeof window !== 'undefined') {
  ;(window as any).__enableSalesMode = () => {
    useSalesModeStore.getState().enableSalesMode()
  }
  ;(window as any).__disableSalesMode = () => {
    useSalesModeStore.getState().disableSalesMode()
  }
  ;(window as any).__toggleSalesMode = () => {
    useSalesModeStore.getState().toggleSalesMode()
  }
}
