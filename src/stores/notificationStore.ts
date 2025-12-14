import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Notification, NotificationType, NotificationPreferences } from '@/types/notification'
import { DEFAULT_NOTIFICATION_PREFERENCES } from '@/types/notification'

interface NotificationState {
  notifications: Notification[]
  preferences: NotificationPreferences
  isLoading: boolean

  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  deleteNotification: (id: string) => void
  clearAll: () => void
  updatePreferences: (prefs: Partial<NotificationPreferences>) => void

  // Computed
  getUnreadCount: () => number
  getUnreadNotifications: () => Notification[]
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      preferences: DEFAULT_NOTIFICATION_PREFERENCES,
      isLoading: false,

      addNotification: (notification) => {
        const { preferences } = get()

        // Check if notification type is enabled in preferences
        if (!preferences[notification.type]) return

        const newNotification: Notification = {
          ...notification,
          id: crypto.randomUUID(),
          isRead: false,
          createdAt: new Date().toISOString(),
        }

        set((state) => ({
          notifications: [newNotification, ...state.notifications].slice(0, 50), // Keep max 50
        }))
      },

      markAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          ),
        }))
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        }))
      },

      deleteNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }))
      },

      clearAll: () => {
        set({ notifications: [] })
      },

      updatePreferences: (prefs) => {
        set((state) => ({
          preferences: { ...state.preferences, ...prefs },
        }))
      },

      getUnreadCount: () => {
        return get().notifications.filter((n) => !n.isRead).length
      },

      getUnreadNotifications: () => {
        return get().notifications.filter((n) => !n.isRead)
      },
    }),
    {
      name: 'creators-os-notifications',
      partialize: (state) => ({
        notifications: state.notifications,
        preferences: state.preferences,
      }),
    }
  )
)

// Helper to create common notifications
export function createApprovalNotification(
  userId: string,
  type: 'approval_pending' | 'approval_approved' | 'approval_changes',
  title: string,
  approvalId: string,
  companyName?: string
) {
  const messages: Record<typeof type, string> = {
    approval_pending: `פריט חדש ממתין לאישור${companyName ? ` מ${companyName}` : ''}`,
    approval_approved: `פריט אושר${companyName ? ` על ידי ${companyName}` : ''}`,
    approval_changes: `נדרשים שינויים${companyName ? ` מ${companyName}` : ''}`,
  }

  return {
    userId,
    type,
    title,
    message: messages[type],
    link: '/approvals',
    entityId: approvalId,
    entityType: 'approval',
  }
}

export function createTaskNotification(
  userId: string,
  taskTitle: string,
  taskId: string
) {
  return {
    userId,
    type: 'task_due' as NotificationType,
    title: taskTitle,
    message: 'המשימה הזו היא להיום',
    link: '/tasks',
    entityId: taskId,
    entityType: 'task',
  }
}

export function createContractExpiringNotification(
  userId: string,
  companyName: string,
  companyId: string,
  daysUntilExpiry: number
) {
  return {
    userId,
    type: 'contract_expiring' as NotificationType,
    title: `חוזה עם ${companyName}`,
    message: `החוזה יפוג בעוד ${daysUntilExpiry} ימים`,
    link: `/companies/${companyId}`,
    entityId: companyId,
    entityType: 'company',
  }
}
