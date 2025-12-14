/**
 * In-App Notification Types
 */

export type NotificationType =
  | 'approval_pending'       // Client submitted approval or requested changes
  | 'approval_approved'      // Client approved content
  | 'approval_changes'       // Client requested changes
  | 'deliverable_complete'   // Deliverable completed
  | 'contract_expiring'      // Contract expiring soon
  | 'task_due'               // Task due today or overdue
  | 'goal_reminder'          // Daily goal reminder
  | 'agency_invite'          // Agency invitation
  | 'system'                 // General system notification

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  link?: string              // Optional link to navigate to
  entityId?: string          // Related entity (approval, task, etc.)
  entityType?: string        // Type of entity
  isRead: boolean
  createdAt: string
}

export interface NotificationPreferences {
  approval_pending: boolean
  approval_approved: boolean
  approval_changes: boolean
  deliverable_complete: boolean
  contract_expiring: boolean
  task_due: boolean
  goal_reminder: boolean
  agency_invite: boolean
  system: boolean
}

// Notification config for UI
export const NOTIFICATION_CONFIG: Record<NotificationType, {
  icon: string
  color: string
  bgColor: string
}> = {
  approval_pending: {
    icon: '🔔',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
  },
  approval_approved: {
    icon: '✅',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
  },
  approval_changes: {
    icon: '📝',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
  deliverable_complete: {
    icon: '📦',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  contract_expiring: {
    icon: '⚠️',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  task_due: {
    icon: '📋',
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
  },
  goal_reminder: {
    icon: '🎯',
    color: 'text-accent-600',
    bgColor: 'bg-accent-50',
  },
  agency_invite: {
    icon: '🤝',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
  },
  system: {
    icon: '💡',
    color: 'text-neutral-600',
    bgColor: 'bg-neutral-50',
  },
}

// Default preferences
export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  approval_pending: true,
  approval_approved: true,
  approval_changes: true,
  deliverable_complete: true,
  contract_expiring: true,
  task_due: true,
  goal_reminder: true,
  agency_invite: true,
  system: true,
}
