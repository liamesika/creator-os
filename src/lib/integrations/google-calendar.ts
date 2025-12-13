/**
 * Google Calendar Integration
 *
 * Handles OAuth flow and one-way sync (Creators OS → Google Calendar)
 */

import { CalendarEvent } from '@/types/calendar'
import { toast } from 'sonner'

// Google OAuth Configuration
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''
const GOOGLE_REDIRECT_URI = typeof window !== 'undefined'
  ? `${window.location.origin}/api/auth/google/callback`
  : ''
const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
].join(' ')

// Google Calendar API types
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

/**
 * Initiates Google OAuth flow
 */
export function initiateGoogleOAuth() {
  if (!GOOGLE_CLIENT_ID) {
    console.log('🔐 Google OAuth: No client ID configured, using demo mode')
    return null
  }

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  authUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID)
  authUrl.searchParams.set('redirect_uri', GOOGLE_REDIRECT_URI)
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('scope', GOOGLE_SCOPES)
  authUrl.searchParams.set('access_type', 'offline')
  authUrl.searchParams.set('prompt', 'consent')

  return authUrl.toString()
}

/**
 * Converts Creators OS event to Google Calendar event format
 */
export function convertToGoogleEvent(event: CalendarEvent): GoogleCalendarEvent {
  // Combine date with time strings to create full DateTime
  const eventDate = new Date(event.date)
  const [startHour, startMin] = event.startTime.split(':').map(Number)
  const [endHour, endMin] = event.endTime.split(':').map(Number)

  const startDate = new Date(eventDate)
  startDate.setHours(startHour, startMin, 0, 0)

  const endDate = new Date(eventDate)
  endDate.setHours(endHour, endMin, 0, 0)

  return {
    summary: event.title,
    description: event.notes || undefined,
    start: {
      dateTime: startDate.toISOString(),
      timeZone: 'Asia/Jerusalem', // Default timezone for Hebrew users
    },
    end: {
      dateTime: endDate.toISOString(),
      timeZone: 'Asia/Jerusalem',
    },
    colorId: getGoogleColorId(event.category),
  }
}

/**
 * Maps event categories to Google Calendar color IDs
 */
function getGoogleColorId(category: string): string {
  const colorMap: Record<string, string> = {
    'CONTENT_CREATION': '9', // Blue
    'MEETING': '11', // Red
    'DEADLINE': '6', // Orange
    'PLANNING': '5', // Yellow
    'ADMIN': '8', // Gray
  }
  return colorMap[category] || '1' // Default blue
}

/**
 * Pushes an event to Google Calendar
 */
export async function pushEventToGoogle(
  event: CalendarEvent,
  accessToken: string,
  calendarId: string = 'primary'
): Promise<{ success: boolean; eventId?: string; error?: string }> {
  try {
    const googleEvent = convertToGoogleEvent(event)

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(googleEvent),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      console.error('Google Calendar API error:', error)
      return { success: false, error: error.message || 'Failed to create event' }
    }

    const createdEvent = await response.json()
    console.log('✅ Event synced to Google Calendar:', createdEvent.id)
    return { success: true, eventId: createdEvent.id }
  } catch (error) {
    console.error('Error pushing event to Google:', error)
    return { success: false, error: 'Network error' }
  }
}

/**
 * Updates an existing Google Calendar event
 */
export async function updateGoogleEvent(
  eventId: string,
  event: CalendarEvent,
  accessToken: string,
  calendarId: string = 'primary'
): Promise<{ success: boolean; error?: string }> {
  try {
    const googleEvent = convertToGoogleEvent(event)

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${eventId}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(googleEvent),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      console.error('Google Calendar API error:', error)
      return { success: false, error: error.message || 'Failed to update event' }
    }

    console.log('✅ Event updated in Google Calendar')
    return { success: true }
  } catch (error) {
    console.error('Error updating Google event:', error)
    return { success: false, error: 'Network error' }
  }
}

/**
 * Deletes an event from Google Calendar
 */
export async function deleteGoogleEvent(
  eventId: string,
  accessToken: string,
  calendarId: string = 'primary'
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${eventId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    )

    if (!response.ok) {
      const error = await response.json()
      console.error('Google Calendar API error:', error)
      return { success: false, error: error.message || 'Failed to delete event' }
    }

    console.log('✅ Event deleted from Google Calendar')
    return { success: true }
  } catch (error) {
    console.error('Error deleting Google event:', error)
    return { success: false, error: 'Network error' }
  }
}

/**
 * Refreshes Google access token using refresh token
 */
export async function refreshGoogleToken(
  refreshToken: string
): Promise<{ accessToken?: string; error?: string }> {
  try {
    const response = await fetch('/api/auth/google/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    })

    if (!response.ok) {
      return { error: 'Failed to refresh token' }
    }

    const data = await response.json()
    return { accessToken: data.accessToken }
  } catch (error) {
    console.error('Error refreshing token:', error)
    return { error: 'Network error' }
  }
}
