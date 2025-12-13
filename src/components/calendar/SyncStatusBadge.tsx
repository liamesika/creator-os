/**
 * Sync Status Badge
 *
 * Shows sync status for calendar events (Google Calendar, Apple Calendar)
 */

import { Check, Cloud } from 'lucide-react'
import { getEventSyncStatus } from '@/lib/integrations/sync'
import { useIntegrationsStore } from '@/stores/integrationsStore'

interface SyncStatusBadgeProps {
  eventId: string
  className?: string
}

export default function SyncStatusBadge({ eventId, className = '' }: SyncStatusBadgeProps) {
  const { googleConnected, appleConnected } = useIntegrationsStore()
  const syncStatus = getEventSyncStatus(eventId)

  // Only show badge if at least one integration is connected
  if (!googleConnected && !appleConnected) {
    return null
  }

  if (syncStatus.synced && googleConnected) {
    return (
      <div
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs ${className}`}
        title="מסונכרן ל-Google Calendar"
      >
        <Check size={12} />
        <span className="font-medium">מסונכרן</span>
      </div>
    )
  }

  if (appleConnected) {
    return (
      <div
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs ${className}`}
        title="זמין בהזנת Apple Calendar"
      >
        <Cloud size={12} />
        <span className="font-medium">הזנה</span>
      </div>
    )
  }

  return null
}
