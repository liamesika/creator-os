import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { IntegrationType, CalendarIntegration } from '@/lib/integrations/types'

interface IntegrationsState {
  integrations: CalendarIntegration[]
  isLoading: boolean

  // Google Calendar
  googleConnected: boolean
  googleCalendarId: string | null
  connectGoogle: (accessToken: string, refreshToken?: string) => Promise<void>
  disconnectGoogle: () => Promise<void>

  // Apple Calendar
  appleConnected: boolean
  appleFeedUrl: string | null
  generateAppleFeed: () => Promise<string>
  disconnectApple: () => Promise<void>

  // General
  getIntegration: (type: IntegrationType) => CalendarIntegration | null
  isConnected: (type: IntegrationType) => boolean
}

export const useIntegrationsStore = create<IntegrationsState>()(
  persist(
    (set, get) => ({
      integrations: [],
      isLoading: false,

      // Google Calendar
      googleConnected: false,
      googleCalendarId: null,

      connectGoogle: async (accessToken: string, refreshToken?: string) => {
        set({ isLoading: true })
        try {
          // In production, this would call your backend API
          // For now, we'll simulate the connection
          const integration: CalendarIntegration = {
            id: `google-${Date.now()}`,
            type: 'google_calendar',
            userId: 'current-user', // Would come from auth
            connected: true,
            accessToken,
            refreshToken,
            calendarId: 'primary',
            createdAt: new Date(),
            updatedAt: new Date(),
          }

          set((state) => ({
            integrations: [...state.integrations.filter(i => i.type !== 'google_calendar'), integration],
            googleConnected: true,
            googleCalendarId: 'primary',
            isLoading: false,
          }))
        } catch (error) {
          console.error('Failed to connect Google Calendar:', error)
          set({ isLoading: false })
          throw error
        }
      },

      disconnectGoogle: async () => {
        set((state) => ({
          integrations: state.integrations.filter(i => i.type !== 'google_calendar'),
          googleConnected: false,
          googleCalendarId: null,
        }))
      },

      // Apple Calendar
      appleConnected: false,
      appleFeedUrl: null,

      generateAppleFeed: async () => {
        set({ isLoading: true })
        try {
          // Generate unique feed URL
          const feedId = Math.random().toString(36).substring(7)
          const feedUrl = `${window.location.origin}/api/calendar/feed/${feedId}`

          const integration: CalendarIntegration = {
            id: `apple-${Date.now()}`,
            type: 'apple_calendar',
            userId: 'current-user',
            connected: true,
            feedUrl,
            createdAt: new Date(),
            updatedAt: new Date(),
          }

          set((state) => ({
            integrations: [...state.integrations.filter(i => i.type !== 'apple_calendar'), integration],
            appleConnected: true,
            appleFeedUrl: feedUrl,
            isLoading: false,
          }))

          return feedUrl
        } catch (error) {
          console.error('Failed to generate Apple Calendar feed:', error)
          set({ isLoading: false })
          throw error
        }
      },

      disconnectApple: async () => {
        set((state) => ({
          integrations: state.integrations.filter(i => i.type !== 'apple_calendar'),
          appleConnected: false,
          appleFeedUrl: null,
        }))
      },

      // General
      getIntegration: (type: IntegrationType) => {
        return get().integrations.find(i => i.type === type) || null
      },

      isConnected: (type: IntegrationType) => {
        return get().integrations.some(i => i.type === type && i.connected)
      },
    }),
    {
      name: 'integrations-storage',
      partialize: (state) => ({
        integrations: state.integrations,
        googleConnected: state.googleConnected,
        googleCalendarId: state.googleCalendarId,
        appleConnected: state.appleConnected,
        appleFeedUrl: state.appleFeedUrl,
      }),
    }
  )
)
