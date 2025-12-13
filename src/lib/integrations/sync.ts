/**
 * Calendar Sync Manager
 *
 * Handles automatic syncing of events to external calendars
 */

import { CalendarEvent } from '@/types/calendar'
import { pushEventToGoogle, updateGoogleEvent, deleteGoogleEvent } from './google-calendar'
import { toast } from 'sonner'

// Track synced events (in production, this would be in Supabase)
const syncedEvents = new Map<string, { googleEventId?: string }>()

/**
 * Syncs an event to Google Calendar (create or update)
 */
export async function syncEventToGoogle(
  event: CalendarEvent,
  accessToken: string,
  calendarId: string = 'primary'
): Promise<{ success: boolean; error?: string }> {
  try {
    const synced = syncedEvents.get(event.id)

    if (synced?.googleEventId) {
      // Update existing event
      const result = await updateGoogleEvent(
        synced.googleEventId,
        event,
        accessToken,
        calendarId
      )

      if (!result.success) {
        return result
      }

      console.log('✅ Event updated in Google Calendar:', event.title)
      return { success: true }
    } else {
      // Create new event
      const result = await pushEventToGoogle(event, accessToken, calendarId)

      if (!result.success) {
        return result
      }

      // Track the synced event
      if (result.eventId) {
        syncedEvents.set(event.id, { googleEventId: result.eventId })
      }

      console.log('✅ Event created in Google Calendar:', event.title)
      return { success: true }
    }
  } catch (error) {
    console.error('Sync error:', error)
    return { success: false, error: 'Sync failed' }
  }
}

/**
 * Removes an event from Google Calendar
 */
export async function unsyncEventFromGoogle(
  eventId: string,
  accessToken: string,
  calendarId: string = 'primary'
): Promise<{ success: boolean; error?: string }> {
  try {
    const synced = syncedEvents.get(eventId)

    if (!synced?.googleEventId) {
      // Event not synced, nothing to do
      return { success: true }
    }

    const result = await deleteGoogleEvent(
      synced.googleEventId,
      accessToken,
      calendarId
    )

    if (!result.success) {
      return result
    }

    // Remove from tracking
    syncedEvents.delete(eventId)

    console.log('✅ Event deleted from Google Calendar')
    return { success: true }
  } catch (error) {
    console.error('Unsync error:', error)
    return { success: false, error: 'Unsync failed' }
  }
}

/**
 * Syncs multiple events in batch
 */
export async function batchSyncToGoogle(
  events: CalendarEvent[],
  accessToken: string,
  calendarId: string = 'primary'
): Promise<{ succeeded: number; failed: number }> {
  let succeeded = 0
  let failed = 0

  for (const event of events) {
    const result = await syncEventToGoogle(event, accessToken, calendarId)
    if (result.success) {
      succeeded++
    } else {
      failed++
    }
  }

  return { succeeded, failed }
}

/**
 * Gets sync status for an event
 */
export function getEventSyncStatus(eventId: string): {
  synced: boolean
  googleEventId?: string
} {
  const synced = syncedEvents.get(eventId)
  return {
    synced: !!synced?.googleEventId,
    googleEventId: synced?.googleEventId,
  }
}

/**
 * Clears all sync tracking (used when disconnecting)
 */
export function clearSyncTracking() {
  syncedEvents.clear()
  console.log('🔄 Sync tracking cleared')
}
