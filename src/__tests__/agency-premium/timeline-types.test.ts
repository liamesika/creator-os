/**
 * Tests for Company Timeline Types
 */

import {
  TIMELINE_ITEM_TYPES,
  type TimelineItemType,
  type CompanyTimelineItem,
} from '@/types/timeline'

describe('Timeline Types', () => {
  describe('TIMELINE_ITEM_TYPES', () => {
    it('should have all required timeline types defined', () => {
      const expectedTypes: TimelineItemType[] = [
        'contract',
        'milestone',
        'deliverable',
        'note',
        'payment',
        'content',
      ]

      expectedTypes.forEach(type => {
        expect(TIMELINE_ITEM_TYPES[type]).toBeDefined()
      })
    })

    it('should have label for each timeline type', () => {
      Object.values(TIMELINE_ITEM_TYPES).forEach(config => {
        expect(config.label).toBeDefined()
        expect(typeof config.label).toBe('string')
      })
    })

    it('should have color for each timeline type', () => {
      Object.values(TIMELINE_ITEM_TYPES).forEach(config => {
        expect(config.color).toBeDefined()
        expect(typeof config.color).toBe('string')
      })
    })

    it('should have icon for each timeline type', () => {
      Object.values(TIMELINE_ITEM_TYPES).forEach(config => {
        expect(config.icon).toBeDefined()
      })
    })

    it('contract type should be defined correctly', () => {
      expect(TIMELINE_ITEM_TYPES.contract.label).toBe('חוזה')
      expect(TIMELINE_ITEM_TYPES.contract.color).toContain('indigo')
    })

    it('payment type should be defined correctly', () => {
      expect(TIMELINE_ITEM_TYPES.payment.label).toBe('תשלום')
      expect(TIMELINE_ITEM_TYPES.payment.color).toContain('amber')
    })

    it('milestone type should be defined correctly', () => {
      expect(TIMELINE_ITEM_TYPES.milestone.label).toBe('אבן דרך')
      expect(TIMELINE_ITEM_TYPES.milestone.color).toContain('violet')
    })
  })

  describe('CompanyTimelineItem type', () => {
    it('should have correct shape', () => {
      const item: CompanyTimelineItem = {
        id: 'test-id',
        creatorUserId: 'user-id',
        companyId: 'company-id',
        type: 'contract',
        title: 'Test Contract',
        occurredOn: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
      }

      expect(item.id).toBeDefined()
      expect(item.type).toBe('contract')
      expect(item.title).toBe('Test Contract')
    })

    it('should support optional fields', () => {
      const item: CompanyTimelineItem = {
        id: 'test-id',
        creatorUserId: 'user-id',
        companyId: 'company-id',
        type: 'payment',
        title: 'Payment received',
        occurredOn: '2024-01-15',
        createdAt: '2024-01-15T10:00:00Z',
        details: 'Monthly retainer',
        amount: 5000,
        eventId: 'event-123',
        taskId: 'task-456',
      }

      expect(item.details).toBe('Monthly retainer')
      expect(item.amount).toBe(5000)
      expect(item.eventId).toBe('event-123')
      expect(item.taskId).toBe('task-456')
    })
  })
})
