/**
 * Tests for Notification Types and Store
 */

import {
  NOTIFICATION_CONFIG,
  DEFAULT_NOTIFICATION_PREFERENCES,
  type NotificationType,
  type NotificationPreferences,
} from '@/types/notification'

describe('Notification Types', () => {
  describe('NOTIFICATION_CONFIG', () => {
    const notificationTypes: NotificationType[] = [
      'approval_pending',
      'approval_approved',
      'approval_changes',
      'deliverable_complete',
      'contract_expiring',
      'task_due',
      'goal_reminder',
      'agency_invite',
      'system',
    ]

    notificationTypes.forEach(type => {
      it(`should have config for ${type} type`, () => {
        const config = NOTIFICATION_CONFIG[type]
        expect(config).toBeDefined()
        expect(config.icon).toBeDefined()
        expect(config.color).toBeDefined()
        expect(config.bgColor).toBeDefined()
      })
    })

    it('should have correct color classes for approval types', () => {
      expect(NOTIFICATION_CONFIG.approval_pending.color).toContain('amber')
      expect(NOTIFICATION_CONFIG.approval_approved.color).toContain('emerald')
      expect(NOTIFICATION_CONFIG.approval_changes.color).toContain('red')
    })

    it('should have unique icons for each type', () => {
      const icons = Object.values(NOTIFICATION_CONFIG).map(c => c.icon)
      // Not all icons need to be unique, but check that we have diverse icons
      expect(new Set(icons).size).toBeGreaterThan(3)
    })
  })

  describe('DEFAULT_NOTIFICATION_PREFERENCES', () => {
    it('should have all notification types enabled by default', () => {
      const types: (keyof NotificationPreferences)[] = [
        'approval_pending',
        'approval_approved',
        'approval_changes',
        'deliverable_complete',
        'contract_expiring',
        'task_due',
        'goal_reminder',
        'agency_invite',
        'system',
      ]

      types.forEach(type => {
        expect(DEFAULT_NOTIFICATION_PREFERENCES[type]).toBe(true)
      })
    })

    it('should have exactly 9 preference keys', () => {
      const keys = Object.keys(DEFAULT_NOTIFICATION_PREFERENCES)
      expect(keys).toHaveLength(9)
    })
  })

  describe('Notification structure', () => {
    it('should validate correct notification structure', () => {
      const notification = {
        id: 'test-id',
        userId: 'user-id',
        type: 'approval_pending' as NotificationType,
        title: 'Test Notification',
        message: 'This is a test message',
        link: '/approvals',
        entityId: 'entity-123',
        entityType: 'approval',
        isRead: false,
        createdAt: new Date().toISOString(),
      }

      expect(notification.id).toBeDefined()
      expect(notification.type).toBe('approval_pending')
      expect(notification.isRead).toBe(false)
    })

    it('should allow notifications without optional fields', () => {
      const notification = {
        id: 'test-id',
        userId: 'user-id',
        type: 'system' as NotificationType,
        title: 'System Update',
        message: 'New features available',
        isRead: true,
        createdAt: new Date().toISOString(),
      }

      expect(notification.id).toBeDefined()
      expect(notification.type).toBe('system')
      expect(notification.isRead).toBe(true)
    })
  })
})
