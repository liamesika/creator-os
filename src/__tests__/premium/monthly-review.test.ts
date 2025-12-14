/**
 * Monthly Review Tests
 */

import {
  computeMonthlyReview,
  computeMonthComparison,
  formatDateHebrew,
} from '@/lib/review/computeMonthlyReview'
import type {
  MonthlyReviewInputs,
  MonthlyStats,
} from '@/lib/review/computeMonthlyReview'
import type { Task } from '@/types/task'
import type { CalendarEvent } from '@/types/calendar'
import type { DailyGoal, GoalItem } from '@/types/goal'

// Helper to create mock tasks
function createMockTask(overrides: Partial<Task> = {}): Task {
  return {
    id: Math.random().toString(),
    userId: 'user-1',
    title: 'Test Task',
    status: 'NOT_STARTED',
    priority: 'MEDIUM',
    archived: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

// Helper to create mock events
function createMockEvent(overrides: Partial<CalendarEvent> = {}): CalendarEvent {
  return {
    id: Math.random().toString(),
    userId: 'user-1',
    title: 'Test Event',
    date: new Date().toISOString().split('T')[0],
    category: 'other',
    createdAt: new Date(),
    ...overrides,
  }
}

// Helper to create mock goals
function createMockGoal(overrides: Partial<DailyGoal> = {}): DailyGoal {
  return {
    id: Math.random().toString(),
    date: new Date().toISOString().split('T')[0],
    items: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

describe('Monthly Review Computation', () => {
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth()

  describe('computeMonthlyReview', () => {
    it('should compute basic stats with empty data', () => {
      const inputs: MonthlyReviewInputs = {
        tasks: [],
        events: [],
        goals: [],
        month: currentMonth,
        year: currentYear,
      }

      const result = computeMonthlyReview(inputs)

      expect(result.stats.tasksCompleted).toBe(0)
      expect(result.stats.tasksCreated).toBe(0)
      expect(result.stats.taskCompletionRate).toBe(0)
      expect(result.stats.eventsAttended).toBe(0)
      expect(result.stats.goalsAchieved).toBe(0)
    })

    it('should calculate task completion rate correctly', () => {
      const monthStart = new Date(currentYear, currentMonth, 5)

      const tasks: Task[] = [
        createMockTask({ status: 'DONE', createdAt: monthStart }),
        createMockTask({ status: 'DONE', createdAt: monthStart }),
        createMockTask({ status: 'NOT_STARTED', createdAt: monthStart }),
        createMockTask({ status: 'IN_PROGRESS', createdAt: monthStart }),
      ]

      const result = computeMonthlyReview({
        tasks,
        events: [],
        goals: [],
        month: currentMonth,
        year: currentYear,
      })

      expect(result.stats.tasksCreated).toBe(4)
      expect(result.stats.tasksCompleted).toBe(2)
      expect(result.stats.taskCompletionRate).toBe(50)
    })

    it('should count events in the month', () => {
      const dateInMonth = new Date(currentYear, currentMonth, 10)
        .toISOString()
        .split('T')[0]

      const events: CalendarEvent[] = [
        createMockEvent({ date: dateInMonth }),
        createMockEvent({ date: dateInMonth }),
        createMockEvent({ date: dateInMonth }),
      ]

      const result = computeMonthlyReview({
        tasks: [],
        events,
        goals: [],
        month: currentMonth,
        year: currentYear,
      })

      expect(result.stats.eventsAttended).toBe(3)
    })

    it('should calculate goal achievement correctly', () => {
      const dateInMonth = new Date(currentYear, currentMonth, 15).toISOString().split('T')[0]

      const goals: DailyGoal[] = [
        createMockGoal({
          date: dateInMonth,
          items: [
            { id: '1', title: 'Goal 1', status: 'DONE' },
            { id: '2', title: 'Goal 2', status: 'DONE' },
          ],
        }),
        createMockGoal({
          date: dateInMonth,
          items: [
            { id: '3', title: 'Goal 3', status: 'DONE' },
          ],
        }),
        createMockGoal({
          date: dateInMonth,
          items: [
            { id: '4', title: 'Goal 4', status: 'NOT_DONE' },
          ],
        }),
      ]

      const result = computeMonthlyReview({
        tasks: [],
        events: [],
        goals,
        month: currentMonth,
        year: currentYear,
      })

      expect(result.stats.goalsAchieved).toBe(2)
      expect(result.stats.goalsTotal).toBe(3)
      expect(result.stats.goalCompletionRate).toBe(67)
    })

    it('should generate correct month label', () => {
      const result = computeMonthlyReview({
        tasks: [],
        events: [],
        goals: [],
        month: 0, // January
        year: 2024,
      })

      expect(result.monthLabel).toBe('ינואר 2024')
    })

    it('should generate insights for high completion rate', () => {
      const monthStart = new Date(currentYear, currentMonth, 5)

      const tasks: Task[] = Array(10)
        .fill(null)
        .map(() => createMockTask({ status: 'DONE', createdAt: monthStart }))

      const result = computeMonthlyReview({
        tasks,
        events: [],
        goals: [],
        month: currentMonth,
        year: currentYear,
      })

      expect(result.insights.length).toBeGreaterThan(0)
      const hasPositiveInsight = result.insights.some(i => i.type === 'positive')
      expect(hasPositiveInsight).toBe(true)
    })

    it('should calculate weekly breakdown', () => {
      const result = computeMonthlyReview({
        tasks: [],
        events: [],
        goals: [],
        month: currentMonth,
        year: currentYear,
      })

      expect(result.weeklyBreakdown.length).toBe(5)
      result.weeklyBreakdown.forEach((week, index) => {
        expect(week.week).toBe(index + 1)
        expect(week.tasksCompleted).toBeGreaterThanOrEqual(0)
        expect(week.eventsCount).toBeGreaterThanOrEqual(0)
      })
    })

    it('should calculate priority distribution', () => {
      const monthStart = new Date(currentYear, currentMonth, 5)

      const tasks: Task[] = [
        createMockTask({ priority: 'HIGH', createdAt: monthStart }),
        createMockTask({ priority: 'HIGH', createdAt: monthStart }),
        createMockTask({ priority: 'MEDIUM', createdAt: monthStart }),
        createMockTask({ priority: 'LOW', createdAt: monthStart }),
      ]

      const result = computeMonthlyReview({
        tasks,
        events: [],
        goals: [],
        month: currentMonth,
        year: currentYear,
      })

      expect(result.priorityDistribution).toHaveLength(3)

      const highPriority = result.priorityDistribution.find(p => p.priority === 'HIGH')
      expect(highPriority?.count).toBe(2)

      const mediumPriority = result.priorityDistribution.find(p => p.priority === 'MEDIUM')
      expect(mediumPriority?.count).toBe(1)
    })

    it('should track busiest and calmest days', () => {
      const dateStr1 = new Date(currentYear, currentMonth, 10)
        .toISOString()
        .split('T')[0]
      const dateStr2 = new Date(currentYear, currentMonth, 15)
        .toISOString()
        .split('T')[0]

      const events: CalendarEvent[] = [
        createMockEvent({ date: dateStr1 }),
        createMockEvent({ date: dateStr1 }),
        createMockEvent({ date: dateStr1 }),
        createMockEvent({ date: dateStr1 }),
        createMockEvent({ date: dateStr1 }),
        createMockEvent({ date: dateStr2 }),
      ]

      const result = computeMonthlyReview({
        tasks: [],
        events,
        goals: [],
        month: currentMonth,
        year: currentYear,
      })

      expect(result.stats.busiestDay).not.toBeNull()
      expect(result.stats.busiestDay?.load).toBeGreaterThanOrEqual(5)
      expect(result.stats.calmestDay).not.toBeNull()
    })
  })

  describe('computeMonthComparison', () => {
    it('should compare two month stats correctly', () => {
      const currentStats: MonthlyStats = {
        tasksCompleted: 20,
        tasksCreated: 25,
        taskCompletionRate: 80,
        eventsAttended: 15,
        goalsAchieved: 3,
        goalsTotal: 4,
        goalCompletionRate: 75,
        busiestDay: null,
        calmestDay: null,
        averageDailyLoad: 3,
        totalEventsHours: 30,
      }

      const previousStats: MonthlyStats = {
        tasksCompleted: 15,
        tasksCreated: 20,
        taskCompletionRate: 75,
        eventsAttended: 10,
        goalsAchieved: 2,
        goalsTotal: 3,
        goalCompletionRate: 67,
        busiestDay: null,
        calmestDay: null,
        averageDailyLoad: 2.5,
        totalEventsHours: 25,
      }

      const comparison = computeMonthComparison(currentStats, previousStats)

      expect(comparison.length).toBe(3)

      const taskComparison = comparison.find(c => c.label === 'משימות שהושלמו')
      expect(taskComparison?.change).toBe(5)
      expect(taskComparison?.isPositive).toBe(true)
    })
  })

  describe('formatDateHebrew', () => {
    it('should format date to Hebrew', () => {
      const dateStr = '2024-01-15'
      const formatted = formatDateHebrew(dateStr)

      // Should contain the day number
      expect(formatted).toContain('15')
    })
  })
})
