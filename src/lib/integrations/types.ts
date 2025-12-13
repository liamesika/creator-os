export type IntegrationType = 'google_calendar' | 'apple_calendar'

export interface CalendarIntegration {
  id: string
  type: IntegrationType
  userId: string
  connected: boolean
  accessToken?: string
  refreshToken?: string
  calendarId?: string
  feedUrl?: string // For Apple Calendar ICS feed
  createdAt: Date
  updatedAt: Date
}

export interface GoogleCalendarEvent {
  summary: string
  description?: string
  start: {
    dateTime: string
    timeZone: string
  }
  end: {
    dateTime: string
    timeZone: string
  }
  colorId?: string
}

export interface SyncStatus {
  eventId: string
  externalId?: string
  synced: boolean
  lastSyncedAt?: Date
  error?: string
}
