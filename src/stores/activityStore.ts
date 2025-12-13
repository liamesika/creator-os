import { create } from 'zustand'
import { db } from '@/lib/supabase/database'
import { getCurrentUserIdSync } from '@/lib/supabase/auth-helpers'
import type { ActivityEvent, ActivityType } from '@/types/activity'

interface ActivityState {
  events: ActivityEvent[]
  isLoading: boolean
  fetchEvents: () => Promise<void>
  logActivity: (
    type: ActivityType,
    entityId?: string,
    entityName?: string,
    metadata?: Record<string, any>
  ) => Promise<void>
}

export const useActivityStore = create<ActivityState>((set, get) => ({
  events: [],
  isLoading: false,

  fetchEvents: async () => {
    const userId = getCurrentUserIdSync()
    if (!userId) return

    set({ isLoading: true })
    try {
      const events = await db.getActivityEvents(userId, 50)
      set({ events })
    } catch (error) {
      console.error('Failed to fetch activity events:', error)
    } finally {
      set({ isLoading: false })
    }
  },

  logActivity: async (
    type: ActivityType,
    entityId?: string,
    entityName?: string,
    metadata?: Record<string, any>
  ) => {
    const userId = getCurrentUserIdSync()
    if (!userId) return

    try {
      const event = await db.createActivityEvent(userId, type, entityId, entityName, metadata)
      set((state) => ({ events: [event, ...state.events] }))
    } catch (error) {
      console.error('Failed to log activity:', error)
    }
  },
}))
