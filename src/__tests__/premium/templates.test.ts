/**
 * Templates System Tests
 */

import {
  TEMPLATE_CATEGORIES,
  getCategoryConfig,
  formatDayOffset,
  getItemTypeLabel,
  getItemTypeIcon,
} from '@/types/templates'
import type {
  Template,
  TemplateItem,
  TemplateCategory,
  TemplateItemType,
  CreateTemplatePayload,
} from '@/types/templates'

describe('Templates System', () => {
  describe('Template Categories', () => {
    it('should have all required categories', () => {
      const expectedCategories: TemplateCategory[] = [
        'weekly_shoot',
        'product_launch',
        'monthly_campaign',
        'custom',
      ]

      expectedCategories.forEach(category => {
        expect(TEMPLATE_CATEGORIES[category]).toBeDefined()
      })
    })

    it('should have required properties for each category', () => {
      Object.values(TEMPLATE_CATEGORIES).forEach(config => {
        expect(config.id).toBeDefined()
        expect(config.label).toBeDefined()
        expect(config.description).toBeDefined()
        expect(config.icon).toBeDefined()
        expect(config.color).toBeDefined()
        expect(config.bgColor).toBeDefined()
      })
    })

    it('getCategoryConfig should return correct config', () => {
      const config = getCategoryConfig('weekly_shoot')

      expect(config.id).toBe('weekly_shoot')
      expect(config.label).toBe('צילום שבועי')
      expect(config.icon).toBe('📸')
    })

    it('getCategoryConfig should work for all categories', () => {
      const categories: TemplateCategory[] = [
        'weekly_shoot',
        'product_launch',
        'monthly_campaign',
        'custom',
      ]

      categories.forEach(category => {
        const config = getCategoryConfig(category)
        expect(config.id).toBe(category)
      })
    })
  })

  describe('formatDayOffset', () => {
    it('should format day 0 correctly', () => {
      expect(formatDayOffset(0)).toBe('יום ההתחלה')
    })

    it('should format day 1 correctly', () => {
      expect(formatDayOffset(1)).toBe('יום אחד אחרי')
    })

    it('should format day -1 correctly', () => {
      expect(formatDayOffset(-1)).toBe('יום אחד לפני')
    })

    it('should format positive days correctly', () => {
      expect(formatDayOffset(3)).toBe('3 ימים אחרי')
      expect(formatDayOffset(7)).toBe('7 ימים אחרי')
    })

    it('should format negative days correctly', () => {
      expect(formatDayOffset(-2)).toBe('2 ימים לפני')
      expect(formatDayOffset(-5)).toBe('5 ימים לפני')
    })
  })

  describe('getItemTypeLabel', () => {
    it('should return correct labels for item types', () => {
      expect(getItemTypeLabel('event')).toBe('אירוע')
      expect(getItemTypeLabel('task')).toBe('משימה')
      expect(getItemTypeLabel('goal')).toBe('יעד')
    })
  })

  describe('getItemTypeIcon', () => {
    it('should return correct icons for item types', () => {
      expect(getItemTypeIcon('event')).toBe('📅')
      expect(getItemTypeIcon('task')).toBe('✓')
      expect(getItemTypeIcon('goal')).toBe('🎯')
    })
  })

  describe('Template Type Structure', () => {
    it('should create a valid template object', () => {
      const template: Template = {
        id: '123',
        ownerUserId: 'user-123',
        ownerType: 'creator',
        title: 'Test Template',
        description: 'A test template',
        category: 'custom',
        isPublic: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        items: [],
      }

      expect(template.id).toBe('123')
      expect(template.ownerType).toBe('creator')
      expect(template.category).toBe('custom')
    })

    it('should create a valid template item object', () => {
      const item: TemplateItem = {
        id: 'item-1',
        templateId: 'template-1',
        itemType: 'task',
        title: 'Test Task',
        notes: 'Some notes',
        dayOffset: 0,
        timeOfDay: '09:00:00',
        durationMinutes: 60,
        priority: 'HIGH',
        sortOrder: 0,
        createdAt: new Date(),
      }

      expect(item.itemType).toBe('task')
      expect(item.priority).toBe('HIGH')
      expect(item.dayOffset).toBe(0)
    })
  })

  describe('CreateTemplatePayload', () => {
    it('should create a valid payload structure', () => {
      const payload: CreateTemplatePayload = {
        title: 'New Template',
        description: 'Description',
        category: 'product_launch',
        isPublic: true,
        items: [
          {
            itemType: 'event',
            title: 'Kickoff Meeting',
            dayOffset: 0,
            timeOfDay: '10:00',
            durationMinutes: 60,
            eventCategory: 'meeting',
          },
          {
            itemType: 'task',
            title: 'Prepare materials',
            dayOffset: -1,
            priority: 'HIGH',
          },
        ],
      }

      expect(payload.title).toBe('New Template')
      expect(payload.category).toBe('product_launch')
      expect(payload.items).toHaveLength(2)
      expect(payload.items?.[0].itemType).toBe('event')
      expect(payload.items?.[1].itemType).toBe('task')
    })
  })
})
