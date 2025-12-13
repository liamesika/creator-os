'use client'

import { create } from 'zustand'
import {
  CalendarEvent,
  CalendarView,
  EventCategory,
  CATEGORY_PRESETS,
  createDefaultReminders,
  createLinkedTasks,
  addMinutesToTime,
} from '@/types/calendar'
import { db } from '@/lib/supabase/database'
import { getCurrentUserIdSync } from '@/lib/supabase/auth-helpers'
import { toast } from 'sonner'
import { logActivity } from '@/lib/activity-logger'
import { syncEventToGoogle, unsyncEventFromGoogle } from '@/lib/integrations/sync'

interface CalendarStore {
  events: CalendarEvent[]
  selectedDate: Date
  currentView: CalendarView
  selectedEvent: CalendarEvent | null
  isCreateModalOpen: boolean
  isEventDrawerOpen: boolean
  companyFilter: string | null
  isLoading: boolean
  isInitialized: boolean

  setSelectedDate: (date: Date) => void
  setCurrentView: (view: CalendarView) => void
  setSelectedEvent: (event: CalendarEvent | null) => void
  openCreateModal: () => void
  closeCreateModal: () => void
  openEventDrawer: (event: CalendarEvent) => void
  closeEventDrawer: () => void
  setCompanyFilter: (companyId: string | null) => void

  initialize: (userId: string) => Promise<void>

  addEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => Promise<CalendarEvent | null>
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => Promise<void>
  deleteEvent: (id: string) => Promise<void>

  createEventFromCategory: (
    category: EventCategory,
    date: Date,
    startTime: string,
    title?: string,
    companyId?: string,
    companyName?: string
  ) => Promise<CalendarEvent | null>

  setEventCompany: (eventId: string, companyId: string | null, companyName?: string) => Promise<void>
  getEventsByCompany: (companyId: string) => CalendarEvent[]
  getUpcomingEventsByCompany: (companyId: string, limit?: number) => CalendarEvent[]
  getUpcomingCompanyEvents: (limit?: number) => CalendarEvent[]
  getCompanyEventsThisWeek: () => CalendarEvent[]

  toggleTaskCompletion: (eventId: string, taskId: string) => void

  getEventsForDate: (date: Date) => CalendarEvent[]
  getEventsForWeek: (startOfWeek: Date) => CalendarEvent[]
  getEventsForMonth: (year: number, month: number) => CalendarEvent[]
  getFilteredEvents: () => CalendarEvent[]
}

const isSameDay = (date1: Date, date2: Date): boolean => {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  )
}

export const useCalendarStore = create<CalendarStore>((set, get) => ({
  events: [],
  selectedDate: new Date(),
  currentView: 'month',
  selectedEvent: null,
  isCreateModalOpen: false,
  isEventDrawerOpen: false,
  companyFilter: null,
  isLoading: false,
  isInitialized: false,

  setSelectedDate: (date) => set({ selectedDate: date }),
  setCurrentView: (view) => set({ currentView: view }),
  setSelectedEvent: (event) => set({ selectedEvent: event }),
  openCreateModal: () => set({ isCreateModalOpen: true }),
  closeCreateModal: () => set({ isCreateModalOpen: false }),
  openEventDrawer: (event) => set({ selectedEvent: event, isEventDrawerOpen: true }),
  closeEventDrawer: () => set({ selectedEvent: null, isEventDrawerOpen: false }),
  setCompanyFilter: (companyId) => set({ companyFilter: companyId }),

  initialize: async (userId: string) => {
    if (get().isInitialized) return

    set({ isLoading: true })
    try {
      const events = await db.getCalendarEvents(userId)
      set({ events, isInitialized: true })
    } catch (error) {
      console.error('Failed to load calendar events:', error)
      toast.error('שגיאה בטעינת אירועי היומן')
    } finally {
      set({ isLoading: false })
    }
  },

  addEvent: async (eventData) => {
    const userId = getCurrentUserIdSync()
    if (!userId) {
      toast.error('יש להתחבר כדי ליצור אירוע')
      return null
    }

    try {
      const newEvent = await db.createCalendarEvent(userId, eventData)
      set((state) => ({ events: [...state.events, newEvent] }))
      logActivity('event_created', newEvent.id, newEvent.title)
      toast.success('האירוע נוסף ליומן')

      // Auto-sync to Google Calendar if connected
      try {
        const { useIntegrationsStore } = await import('@/stores/integrationsStore')
        const integrations = useIntegrationsStore.getState()
        if (integrations.googleConnected) {
          const googleIntegration = integrations.integrations.find(
            (i) => i.type === 'google_calendar' && i.connected
          )
          if (googleIntegration?.accessToken) {
            const syncResult = await syncEventToGoogle(
              newEvent,
              googleIntegration.accessToken,
              googleIntegration.calendarId
            )
            if (!syncResult.success) {
              console.warn('Failed to sync to Google Calendar:', syncResult.error)
            }
          }
        }
      } catch (syncError) {
        console.warn('Google Calendar sync error:', syncError)
      }

      return newEvent
    } catch (error) {
      console.error('Failed to create event:', error)
      toast.error('שגיאה ביצירת האירוע')
      return null
    }
  },

  updateEvent: async (id, updates) => {
    const prevState = get().events
    const event = get().events.find((e) => e.id === id)
    const updatedEvent = { ...event!, ...updates, updatedAt: new Date() }

    set((state) => ({
      events: state.events.map((event) =>
        event.id === id
          ? updatedEvent
          : event
      ),
      selectedEvent:
        state.selectedEvent?.id === id
          ? updatedEvent
          : state.selectedEvent,
    }))

    try {
      await db.updateCalendarEvent(id, updates)
      logActivity('event_updated', id, event?.title)
      toast.success('האירוע עודכן')

      // Auto-sync to Google Calendar if connected
      try {
        const { useIntegrationsStore } = await import('@/stores/integrationsStore')
        const integrations = useIntegrationsStore.getState()
        if (integrations.googleConnected) {
          const googleIntegration = integrations.integrations.find(
            (i) => i.type === 'google_calendar' && i.connected
          )
          if (googleIntegration?.accessToken) {
            const syncResult = await syncEventToGoogle(
              updatedEvent,
              googleIntegration.accessToken,
              googleIntegration.calendarId
            )
            if (!syncResult.success) {
              console.warn('Failed to sync update to Google Calendar:', syncResult.error)
            }
          }
        }
      } catch (syncError) {
        console.warn('Google Calendar sync error:', syncError)
      }
    } catch (error) {
      console.error('Failed to update event:', error)
      toast.error('שגיאה בעדכון האירוע')
      set({ events: prevState })
    }
  },

  deleteEvent: async (id) => {
    const prevState = get().events
    const prevSelected = get().selectedEvent
    const prevDrawerOpen = get().isEventDrawerOpen
    const event = get().events.find((e) => e.id === id)

    set((state) => ({
      events: state.events.filter((event) => event.id !== id),
      selectedEvent:
        state.selectedEvent?.id === id ? null : state.selectedEvent,
      isEventDrawerOpen:
        state.selectedEvent?.id === id ? false : state.isEventDrawerOpen,
    }))

    try {
      await db.deleteCalendarEvent(id)
      logActivity('event_deleted', id, event?.title)
      toast.success('האירוע נמחק')

      // Auto-sync deletion to Google Calendar if connected
      try {
        const { useIntegrationsStore } = await import('@/stores/integrationsStore')
        const integrations = useIntegrationsStore.getState()
        if (integrations.googleConnected) {
          const googleIntegration = integrations.integrations.find(
            (i) => i.type === 'google_calendar' && i.connected
          )
          if (googleIntegration?.accessToken) {
            const syncResult = await unsyncEventFromGoogle(
              id,
              googleIntegration.accessToken,
              googleIntegration.calendarId
            )
            if (!syncResult.success) {
              console.warn('Failed to delete from Google Calendar:', syncResult.error)
            }
          }
        }
      } catch (syncError) {
        console.warn('Google Calendar sync error:', syncError)
      }
    } catch (error) {
      console.error('Failed to delete event:', error)
      toast.error('שגיאה במחיקת האירוע')
      set({
        events: prevState,
        selectedEvent: prevSelected,
        isEventDrawerOpen: prevDrawerOpen
      })
    }
  },

  createEventFromCategory: async (category, date, startTime, title, companyId, companyName) => {
    const preset = CATEGORY_PRESETS[category]
    const endTime = addMinutesToTime(startTime, preset.defaultDuration)

    const eventData: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'> = {
      category,
      title: title || preset.label,
      date,
      startTime,
      endTime,
      isAllDay: false,
      reminders: createDefaultReminders(preset),
      linkedTasks: createLinkedTasks(preset),
      companyId: companyId || null,
      companyNameSnapshot: companyName,
    }

    return await get().addEvent(eventData)
  },

  setEventCompany: async (eventId, companyId, companyName) => {
    const prevState = get().events
    set((state) => ({
      events: state.events.map((event) =>
        event.id === eventId
          ? {
              ...event,
              companyId,
              companyNameSnapshot: companyName || event.companyNameSnapshot,
              updatedAt: new Date(),
            }
          : event
      ),
      selectedEvent:
        state.selectedEvent?.id === eventId
          ? {
              ...state.selectedEvent,
              companyId,
              companyNameSnapshot: companyName || state.selectedEvent.companyNameSnapshot,
              updatedAt: new Date(),
            }
          : state.selectedEvent,
    }))

    try {
      await db.updateCalendarEvent(eventId, {
        companyId,
        companyNameSnapshot: companyName,
      })
      toast.success('החברה שוייכה לאירוע')
    } catch (error) {
      console.error('Failed to set event company:', error)
      toast.error('שגיאה בשיוך החברה')
      set({ events: prevState })
    }
  },

  getEventsByCompany: (companyId) => {
    return get().events.filter((event) => event.companyId === companyId)
  },

  getUpcomingEventsByCompany: (companyId, limit = 5) => {
    const now = new Date()
    return get()
      .events.filter((event) => {
        const eventDate = new Date(event.date)
        return event.companyId === companyId && eventDate >= now
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, limit)
  },

  getUpcomingCompanyEvents: (limit = 10) => {
    const now = new Date()
    return get()
      .events.filter((event) => {
        const eventDate = new Date(event.date)
        return event.companyId && eventDate >= now
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, limit)
  },

  getCompanyEventsThisWeek: () => {
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)

    return get().events.filter((event) => {
      const eventDate = new Date(event.date)
      return event.companyId && eventDate >= startOfWeek && eventDate <= endOfWeek
    })
  },

  toggleTaskCompletion: (eventId, taskId) => {
    set((state) => ({
      events: state.events.map((event) =>
        event.id === eventId
          ? {
              ...event,
              linkedTasks: event.linkedTasks.map((task) =>
                task.id === taskId
                  ? { ...task, completed: !task.completed }
                  : task
              ),
              updatedAt: new Date(),
            }
          : event
      ),
      selectedEvent:
        state.selectedEvent?.id === eventId
          ? {
              ...state.selectedEvent,
              linkedTasks: state.selectedEvent.linkedTasks.map((task) =>
                task.id === taskId
                  ? { ...task, completed: !task.completed }
                  : task
              ),
              updatedAt: new Date(),
            }
          : state.selectedEvent,
    }))
  },

  getEventsForDate: (date) => {
    const filter = get().companyFilter
    return get().events.filter((event) => {
      const matchesDate = isSameDay(event.date, date)
      const matchesCompany = !filter || event.companyId === filter
      return matchesDate && matchesCompany
    })
  },

  getEventsForWeek: (startOfWeek) => {
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(endOfWeek.getDate() + 6)
    const filter = get().companyFilter

    return get().events.filter((event) => {
      const eventDate = new Date(event.date)
      const matchesDate = eventDate >= startOfWeek && eventDate <= endOfWeek
      const matchesCompany = !filter || event.companyId === filter
      return matchesDate && matchesCompany
    })
  },

  getEventsForMonth: (year, month) => {
    const filter = get().companyFilter
    return get().events.filter((event) => {
      const eventDate = new Date(event.date)
      const matchesDate = eventDate.getFullYear() === year && eventDate.getMonth() === month
      const matchesCompany = !filter || event.companyId === filter
      return matchesDate && matchesCompany
    })
  },

  getFilteredEvents: () => {
    const filter = get().companyFilter
    if (!filter) return get().events
    return get().events.filter((event) => event.companyId === filter)
  },
}))
