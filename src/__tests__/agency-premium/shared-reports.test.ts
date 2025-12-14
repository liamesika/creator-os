/**
 * Tests for Shared Reports Types and Functions
 */

import {
  generateShareToken,
  type SharedReport,
  type SharedReportPayload,
} from '@/types/shared-reports'

describe('Shared Reports', () => {
  describe('generateShareToken', () => {
    it('should generate a token of correct length', () => {
      const token = generateShareToken()
      // Token should be at least 20 characters
      expect(token.length).toBeGreaterThanOrEqual(20)
    })

    it('should generate unique tokens', () => {
      const tokens = new Set<string>()

      // Generate 100 tokens and check for uniqueness
      for (let i = 0; i < 100; i++) {
        const token = generateShareToken()
        expect(tokens.has(token)).toBe(false)
        tokens.add(token)
      }
    })

    it('should only contain alphanumeric characters', () => {
      const token = generateShareToken()
      expect(token).toMatch(/^[a-zA-Z0-9]+$/)
    })
  })

  describe('SharedReport type', () => {
    it('should have correct shape', () => {
      const report: SharedReport = {
        id: 'report-id',
        creatorUserId: 'user-id',
        token: 'unique-token-123',
        reportType: 'monthly_review',
        payload: {
          title: 'Monthly Review',
          ownerName: 'John Doe',
          generatedAt: new Date().toISOString(),
        },
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        viewCount: 0,
        createdAt: new Date().toISOString(),
      }

      expect(report.token).toBeDefined()
      expect(report.reportType).toBe('monthly_review')
      expect(report.payload.title).toBe('Monthly Review')
    })
  })

  describe('SharedReportPayload type', () => {
    it('should support stats', () => {
      const payload: SharedReportPayload = {
        title: 'Review',
        ownerName: 'John',
        generatedAt: new Date().toISOString(),
        stats: {
          tasksCompleted: 25,
          eventsCount: 10,
          taskCompletionRate: 85,
        },
      }

      expect(payload.stats?.tasksCompleted).toBe(25)
      expect(payload.stats?.eventsCount).toBe(10)
      expect(payload.stats?.taskCompletionRate).toBe(85)
    })

    it('should support highlights', () => {
      const payload: SharedReportPayload = {
        title: 'Review',
        ownerName: 'John',
        generatedAt: new Date().toISOString(),
        highlights: [
          { icon: '🏆', value: '25', label: 'Tasks Done' },
          { icon: '📅', value: '10', label: 'Events' },
        ],
      }

      expect(payload.highlights).toHaveLength(2)
      expect(payload.highlights?.[0].icon).toBe('🏆')
    })

    it('should support insights', () => {
      const payload: SharedReportPayload = {
        title: 'Review',
        ownerName: 'John',
        generatedAt: new Date().toISOString(),
        insights: [
          {
            icon: '⭐',
            title: 'Great Performance',
            description: 'You completed 85% of tasks',
          },
        ],
      }

      expect(payload.insights).toHaveLength(1)
      expect(payload.insights?.[0].title).toBe('Great Performance')
    })

    it('should support optional subtitle', () => {
      const payload: SharedReportPayload = {
        title: 'January 2024 Review',
        subtitle: 'Monthly Summary',
        ownerName: 'John',
        generatedAt: new Date().toISOString(),
      }

      expect(payload.subtitle).toBe('Monthly Summary')
    })
  })
})
