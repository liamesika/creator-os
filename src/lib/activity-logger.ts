import { useActivityStore } from '@/stores/activityStore'
import type { ActivityType } from '@/types/activity'

/**
 * Centralized activity logging utility
 * Use this from stores to avoid duplication
 */
export const logActivity = (
  type: ActivityType,
  entityId?: string,
  entityName?: string,
  metadata?: Record<string, any>
) => {
  const { logActivity: log } = useActivityStore.getState()
  log(type, entityId, entityName, metadata)
}
