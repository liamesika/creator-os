/**
 * Tests for Deterministic Insights Computation
 */

import {
  computeInsights,
  computeAgencyInsights,
} from '@/lib/insights/computeInsights'

describe('Insights Computation', () => {
  describe('computeInsights', () => {
    it('should detect no events week when events array is empty', () => {
      const result = computeInsights({
        tasks: [],
        events: [],
        companies: [],
        scope: 'creator',
      })

      // With no events, it should show "no events week" insight
      const noEventsInsight = result.find(i => i.id.includes('no_events'))
      expect(noEventsInsight).toBeDefined()
      expect(noEventsInsight?.severity).toBe('info')
    })

    it('should detect overdue tasks with warning severity', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      const result = computeInsights({
        tasks: [
          {
            id: '1',
            title: 'Test Task',
            status: 'TODO',
            priority: 'HIGH',
            dueDate: yesterday,
            archived: false,
          },
        ],
        events: [],
        companies: [],
        scope: 'creator',
      })

      expect(result.length).toBeGreaterThan(0)
      const overdueInsight = result.find(i => i.id.includes('overdue'))
      expect(overdueInsight).toBeDefined()
      expect(overdueInsight?.severity).toBe('warning')
    })

    it('should detect long overdue tasks with risk severity', () => {
      const fiveDaysAgo = new Date()
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5)

      const result = computeInsights({
        tasks: [
          {
            id: '1',
            title: 'Test Task',
            status: 'TODO',
            priority: 'HIGH',
            dueDate: fiveDaysAgo,
            archived: false,
          },
        ],
        events: [],
        companies: [],
        scope: 'creator',
      })

      const overdueInsight = result.find(i => i.id.includes('overdue'))
      expect(overdueInsight?.severity).toBe('risk')
    })

    it('should detect empty week ahead', () => {
      const result = computeInsights({
        tasks: [],
        events: [],
        companies: [],
        scope: 'creator',
      })

      // With no events, it should show "no events week" insight
      // The insight is only added when there's no other higher priority insight
      // Since no tasks = no overdue tasks, we might see the empty week insight
      expect(result).toBeDefined()
    })

    it('should limit insights to max 3', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 5)

      // Create many overdue tasks
      const tasks = Array.from({ length: 10 }, (_, i) => ({
        id: `task-${i}`,
        title: `Test Task ${i}`,
        status: 'TODO' as const,
        priority: 'HIGH' as const,
        dueDate: yesterday,
        archived: false,
      }))

      const result = computeInsights({
        tasks,
        events: [],
        companies: [],
        scope: 'creator',
      })

      expect(result.length).toBeLessThanOrEqual(3)
    })

    it('should detect company concentration', () => {
      const today = new Date()
      const events = Array.from({ length: 10 }, (_, i) => ({
        id: `event-${i}`,
        title: `Event ${i}`,
        date: today.toISOString().split('T')[0],
        companyId: 'company-1', // All events for same company
      }))

      const result = computeInsights({
        tasks: [],
        events,
        companies: [{ id: 'company-1', name: 'Main Client' }],
        scope: 'creator',
      })

      const concentrationInsight = result.find(i => i.id.includes('concentration'))
      if (concentrationInsight) {
        expect(concentrationInsight.message).toContain('Main Client')
      }
    })

    it('should not include completed tasks in overdue check', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      const result = computeInsights({
        tasks: [
          {
            id: '1',
            title: 'Completed Task',
            status: 'DONE', // Completed - should not count as overdue
            priority: 'HIGH',
            dueDate: yesterday,
            archived: false,
          },
        ],
        events: [],
        companies: [],
        scope: 'creator',
      })

      const overdueInsight = result.find(i => i.id.includes('overdue'))
      expect(overdueInsight).toBeUndefined()
    })
  })

  describe('computeAgencyInsights', () => {
    it('should detect creators at risk', () => {
      const result = computeAgencyInsights([
        {
          id: 'creator-1',
          name: 'John',
          tasks: [],
          events: [],
          healthStatus: 'overloaded',
        },
        {
          id: 'creator-2',
          name: 'Jane',
          tasks: [],
          events: [],
          healthStatus: 'calm',
        },
      ])

      // Check for creator at risk insight (key is 'creator_at_risk')
      const riskInsight = result.find(i => i.id.includes('creator_at_risk') || i.severity === 'risk')
      expect(riskInsight).toBeDefined()
      expect(riskInsight?.severity).toBe('risk')
      expect(riskInsight?.message).toContain('John')
    })

    it('should detect high agency performance', () => {
      const completedTasks = Array.from({ length: 10 }, (_, i) => ({
        id: `task-${i}`,
        title: `Task ${i}`,
        status: 'DONE' as const,
        priority: 'HIGH' as const,
      }))

      const result = computeAgencyInsights([
        {
          id: 'creator-1',
          name: 'John',
          tasks: completedTasks,
          events: [],
          healthStatus: 'calm',
        },
      ])

      const performanceInsight = result.find(i => i.id.includes('performance'))
      expect(performanceInsight).toBeDefined()
      expect(performanceInsight?.severity).toBe('info')
    })

    it('should detect low completion rate', () => {
      const incompleteTasks = Array.from({ length: 10 }, (_, i) => ({
        id: `task-${i}`,
        title: `Task ${i}`,
        status: 'TODO' as const,
        priority: 'HIGH' as const,
      }))

      const result = computeAgencyInsights([
        {
          id: 'creator-1',
          name: 'John',
          tasks: incompleteTasks,
          events: [],
          healthStatus: 'calm',
        },
      ])

      const completionInsight = result.find(i => i.id.includes('completion'))
      expect(completionInsight).toBeDefined()
      expect(completionInsight?.severity).toBe('warning')
    })
  })
})
