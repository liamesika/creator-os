/**
 * Tests for Insight Types
 */

import {
  INSIGHT_KEYS,
  INSIGHT_SEVERITY_CONFIG,
  type InsightSeverity,
  type InsightDisplay,
} from '@/types/insights'

describe('Insight Types', () => {
  describe('INSIGHT_KEYS', () => {
    it('should have all required insight keys', () => {
      expect(INSIGHT_KEYS.OVERDUE_TASKS).toBeDefined()
      expect(INSIGHT_KEYS.HEAVY_DAYS_STREAK).toBeDefined()
      expect(INSIGHT_KEYS.COMPANY_CONCENTRATION).toBeDefined()
      expect(INSIGHT_KEYS.COMPLETION_RATE_LOW).toBeDefined()
      expect(INSIGHT_KEYS.NO_EVENTS_WEEK).toBeDefined()
      expect(INSIGHT_KEYS.CREATOR_AT_RISK).toBeDefined()
      expect(INSIGHT_KEYS.AGENCY_PERFORMANCE_UP).toBeDefined()
    })

    it('should have unique values for each key', () => {
      const values = Object.values(INSIGHT_KEYS)
      const uniqueValues = new Set(values)
      expect(uniqueValues.size).toBe(values.length)
    })
  })

  describe('INSIGHT_SEVERITY_CONFIG', () => {
    const severities: InsightSeverity[] = ['info', 'warning', 'risk']

    severities.forEach(severity => {
      it(`should have config for ${severity} severity`, () => {
        const config = INSIGHT_SEVERITY_CONFIG[severity]
        expect(config).toBeDefined()
        expect(config.color).toBeDefined()
        expect(config.bgColor).toBeDefined()
        expect(config.borderColor).toBeDefined()
      })
    })

    it('info severity should have appropriate colors', () => {
      const config = INSIGHT_SEVERITY_CONFIG.info
      expect(config.color).toContain('blue')
    })

    it('warning severity should have appropriate colors', () => {
      const config = INSIGHT_SEVERITY_CONFIG.warning
      expect(config.color).toContain('amber')
    })

    it('risk severity should have appropriate colors', () => {
      const config = INSIGHT_SEVERITY_CONFIG.risk
      expect(config.color).toContain('red')
    })
  })

  describe('InsightDisplay type', () => {
    it('should have correct shape', () => {
      const insight: InsightDisplay = {
        id: INSIGHT_KEYS.OVERDUE_TASKS,
        severity: 'warning',
        title: 'Overdue Tasks',
        message: 'You have 3 overdue tasks',
        icon: '⏰',
      }

      expect(insight.id).toBe(INSIGHT_KEYS.OVERDUE_TASKS)
      expect(insight.severity).toBe('warning')
      expect(insight.title).toBe('Overdue Tasks')
    })

    it('should support optional creatorName for agency insights', () => {
      const insight: InsightDisplay = {
        id: INSIGHT_KEYS.CREATOR_AT_RISK,
        severity: 'risk',
        title: 'Creator at Risk',
        message: 'John is overloaded',
        icon: '🚨',
        creatorName: 'John',
      }

      expect(insight.creatorName).toBe('John')
    })
  })
})
