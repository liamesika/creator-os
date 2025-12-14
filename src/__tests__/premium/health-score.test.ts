import {
  computeHealthScore,
  getScoreRingColor,
  calculateStreakPressure,
  isHeavyDay,
} from '@/lib/health/computeHealthScore'
import type { HealthInputs } from '@/lib/health/computeHealthScore'

describe('Health Score Computation', () => {
  describe('computeHealthScore', () => {
    it('should return calm status for low load', () => {
      const inputs: HealthInputs = {
        openTasksCount: 3,
        overdueTasksCount: 0,
        eventsTodayCount: 1,
        eventsWeekCount: 5,
        backlogPressure: 0,
        streakPressure: 0,
      }

      const result = computeHealthScore(inputs)

      expect(result.status).toBe('calm')
      expect(result.score).toBeLessThanOrEqual(35)
      expect(result.statusLabel).toBe('רגוע')
    })

    it('should return busy status for moderate load', () => {
      const inputs: HealthInputs = {
        openTasksCount: 8,
        overdueTasksCount: 2,
        eventsTodayCount: 3,
        eventsWeekCount: 15,
        backlogPressure: 2,
        streakPressure: 0,
      }

      const result = computeHealthScore(inputs)

      expect(result.status).toBe('busy')
      expect(result.score).toBeGreaterThan(35)
      expect(result.score).toBeLessThanOrEqual(70)
      expect(result.statusLabel).toBe('עמוס')
    })

    it('should return overloaded status for high load', () => {
      const inputs: HealthInputs = {
        openTasksCount: 20,
        overdueTasksCount: 5,
        eventsTodayCount: 6,
        eventsWeekCount: 25,
        backlogPressure: 5,
        streakPressure: 3,
      }

      const result = computeHealthScore(inputs)

      expect(result.status).toBe('overloaded')
      expect(result.score).toBeGreaterThan(70)
      expect(result.statusLabel).toBe('עומס יתר')
    })

    it('should clamp score between 0 and 100', () => {
      const lowInputs: HealthInputs = {
        openTasksCount: 0,
        overdueTasksCount: 0,
        eventsTodayCount: 0,
        eventsWeekCount: 0,
        backlogPressure: 0,
        streakPressure: 0,
      }

      const highInputs: HealthInputs = {
        openTasksCount: 100,
        overdueTasksCount: 50,
        eventsTodayCount: 20,
        eventsWeekCount: 100,
        backlogPressure: 20,
        streakPressure: 5,
      }

      const lowResult = computeHealthScore(lowInputs)
      const highResult = computeHealthScore(highInputs)

      expect(lowResult.score).toBeGreaterThanOrEqual(0)
      expect(highResult.score).toBeLessThanOrEqual(100)
    })

    it('should heavily penalize overdue tasks', () => {
      const withoutOverdue: HealthInputs = {
        openTasksCount: 5,
        overdueTasksCount: 0,
        eventsTodayCount: 2,
        eventsWeekCount: 10,
        backlogPressure: 0,
        streakPressure: 0,
      }

      const withOverdue: HealthInputs = {
        ...withoutOverdue,
        overdueTasksCount: 3,
      }

      const resultWithout = computeHealthScore(withoutOverdue)
      const resultWith = computeHealthScore(withOverdue)

      expect(resultWith.score).toBeGreaterThan(resultWithout.score)
      expect(resultWith.score - resultWithout.score).toBeGreaterThanOrEqual(10)
    })

    it('should include details in result', () => {
      const inputs: HealthInputs = {
        openTasksCount: 5,
        overdueTasksCount: 1,
        eventsTodayCount: 2,
        eventsWeekCount: 10,
        backlogPressure: 1,
        streakPressure: 0,
      }

      const result = computeHealthScore(inputs)

      expect(result.details).toBeDefined()
      expect(result.details.openTasks).toBe(5)
      expect(result.details.overdueTasks).toBe(1)
      expect(result.details.eventsToday).toBe(2)
      expect(result.details.eventsWeek).toBe(10)
      expect(result.details.insights).toBeDefined()
      expect(Array.isArray(result.details.insights)).toBe(true)
    })

    it('should add streak pressure to score', () => {
      const withStreak: HealthInputs = {
        openTasksCount: 5,
        overdueTasksCount: 0,
        eventsTodayCount: 2,
        eventsWeekCount: 10,
        backlogPressure: 0,
        streakPressure: 3, // 3 consecutive heavy days
      }

      const withoutStreak: HealthInputs = {
        ...withStreak,
        streakPressure: 0, // No streak
      }

      const resultWith = computeHealthScore(withStreak)
      const resultWithout = computeHealthScore(withoutStreak)

      expect(resultWith.score).toBeGreaterThan(resultWithout.score)
    })
  })

  describe('getScoreRingColor', () => {
    it('should return correct colors for each status', () => {
      expect(getScoreRingColor('calm')).toBe('stroke-emerald-500')
      expect(getScoreRingColor('busy')).toBe('stroke-amber-500')
      expect(getScoreRingColor('overloaded')).toBe('stroke-red-500')
    })
  })

  describe('calculateStreakPressure', () => {
    it('should return 0 for no heavy days', () => {
      const dailyLoads = [2, 3, 1, 2, 3, 2, 1]
      expect(calculateStreakPressure(dailyLoads)).toBe(0)
    })

    it('should count consecutive heavy days from start', () => {
      const dailyLoads = [7, 8, 6, 2, 3, 2, 1]
      expect(calculateStreakPressure(dailyLoads)).toBe(3)
    })

    it('should max out at 5', () => {
      const dailyLoads = [10, 10, 10, 10, 10, 10, 10]
      expect(calculateStreakPressure(dailyLoads)).toBe(5)
    })

    it('should break on first light day', () => {
      const dailyLoads = [8, 2, 8, 8, 8, 8, 8]
      expect(calculateStreakPressure(dailyLoads)).toBe(1)
    })
  })

  describe('isHeavyDay', () => {
    it('should return true for load >= 5', () => {
      expect(isHeavyDay(5)).toBe(true)
      expect(isHeavyDay(10)).toBe(true)
    })

    it('should return false for load < 5', () => {
      expect(isHeavyDay(4)).toBe(false)
      expect(isHeavyDay(0)).toBe(false)
    })
  })
})
