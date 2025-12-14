/**
 * Premium Features Types Tests
 * Validates type definitions and interfaces
 */

import type {
  HealthStatus,
  HealthSnapshot,
  NotificationSettings,
  DayLoad,
  SmartWeekData,
  FocusSession,
  DailyDigestContent,
  AgencyDigestContent,
  AgencyCreatorWeekData,
  AgencyControlData,
} from '@/types/premium'

describe('Premium Types', () => {
  describe('HealthStatus', () => {
    it('should accept valid health statuses', () => {
      const statuses: HealthStatus[] = ['calm', 'busy', 'overloaded']
      expect(statuses).toHaveLength(3)
      expect(statuses).toContain('calm')
      expect(statuses).toContain('busy')
      expect(statuses).toContain('overloaded')
    })
  })

  describe('HealthSnapshot', () => {
    it('should have correct structure', () => {
      const snapshot: HealthSnapshot = {
        id: 'snapshot-1',
        userId: 'user-1',
        snapshotDate: new Date(),
        score: 45,
        status: 'busy',
        details: {
          openTasks: 10,
          overdueTasks: 2,
          eventsToday: 3,
          eventsWeek: 15,
          backlogPressure: 0.3,
          streakPressure: 0.2,
          insights: ['יום עמוס'],
        },
        createdAt: new Date(),
      }

      expect(snapshot.id).toBeDefined()
      expect(snapshot.score).toBeLessThanOrEqual(100)
      expect(snapshot.score).toBeGreaterThanOrEqual(0)
      expect(snapshot.status).toMatch(/^(calm|busy|overloaded)$/)
    })
  })

  describe('NotificationSettings', () => {
    it('should have correct structure', () => {
      const settings: NotificationSettings = {
        id: 'settings-1',
        userId: 'user-1',
        dailyEmailEnabled: true,
        dailyEmailTime: '08:30:00',
        timezone: 'Asia/Jerusalem',
        includeMotivation: true,
        weeklySummaryEnabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      expect(settings.dailyEmailTime).toMatch(/^\d{2}:\d{2}:\d{2}$/)
      expect(typeof settings.dailyEmailEnabled).toBe('boolean')
    })
  })

  describe('DayLoad', () => {
    it('should have correct structure', () => {
      const dayLoad: DayLoad = {
        date: '2024-03-15',
        eventsCount: 3,
        tasksCount: 5,
        totalLoad: 8,
        isHeavy: true,
        events: [],
        tasks: [],
        topCompanies: ['Company A', 'Company B'],
      }

      expect(dayLoad.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(dayLoad.totalLoad).toBe(dayLoad.eventsCount + dayLoad.tasksCount)
      expect(dayLoad.isHeavy).toBe(true)
    })
  })

  describe('SmartWeekData', () => {
    it('should have correct structure', () => {
      const weekData: SmartWeekData = {
        weekStart: '2024-03-10',
        weekEnd: '2024-03-16',
        days: [],
        overallLoad: 35,
        riskDays: 2,
      }

      expect(weekData.weekStart).toBeDefined()
      expect(weekData.weekEnd).toBeDefined()
      expect(Array.isArray(weekData.days)).toBe(true)
    })

    it('should calculate overall stats correctly', () => {
      const days: DayLoad[] = [
        { date: '2024-03-10', eventsCount: 2, tasksCount: 3, totalLoad: 5, isHeavy: false, events: [], tasks: [], topCompanies: [] },
        { date: '2024-03-11', eventsCount: 4, tasksCount: 4, totalLoad: 8, isHeavy: true, events: [], tasks: [], topCompanies: [] },
        { date: '2024-03-12', eventsCount: 3, tasksCount: 2, totalLoad: 5, isHeavy: false, events: [], tasks: [], topCompanies: [] },
      ]

      const overallLoad = days.reduce((sum, d) => sum + d.totalLoad, 0)
      const riskDays = days.filter(d => d.isHeavy).length

      expect(overallLoad).toBe(18)
      expect(riskDays).toBe(1)
    })
  })

  describe('FocusSession', () => {
    it('should have correct structure', () => {
      const session: FocusSession = {
        id: 'session-1',
        userId: 'user-1',
        sessionDate: new Date(),
        startedAt: new Date(),
        completedTasks: [
          { id: 'task-1', title: 'Task 1', completedAt: new Date() },
        ],
        movedTasks: [
          { id: 'task-2', title: 'Task 2', newDate: '2024-03-16' },
        ],
        status: 'completed',
        createdAt: new Date(),
      }

      expect(session.status).toMatch(/^(active|completed|abandoned)$/)
      expect(session.completedTasks).toHaveLength(1)
      expect(session.movedTasks).toHaveLength(1)
    })
  })

  describe('DailyDigestContent', () => {
    it('should have correct structure', () => {
      const content: DailyDigestContent = {
        userId: 'user-1',
        userName: 'Test User',
        userEmail: 'test@example.com',
        date: '2024-03-15',
        topTasks: [],
        todayEvents: [],
        healthScore: 42,
        healthStatus: 'busy',
        healthInsight: 'Keep going!',
        motivationalMessage: 'You can do it!',
      }

      expect(content.healthScore).toBeLessThanOrEqual(100)
      expect(content.healthScore).toBeGreaterThanOrEqual(0)
      expect(content.healthStatus).toMatch(/^(calm|busy|overloaded)$/)
    })
  })

  describe('AgencyDigestContent', () => {
    it('should have correct structure', () => {
      const content: AgencyDigestContent = {
        agencyId: 'agency-1',
        agencyName: 'Test Agency',
        agencyEmail: 'agency@example.com',
        date: '2024-03-15',
        totalCreators: 10,
        overloadedCreators: [],
        busyCreators: [],
        weeklyTrend: 'improving',
      }

      expect(content.weeklyTrend).toMatch(/^(improving|stable|declining)$/)
      expect(content.totalCreators).toBeGreaterThanOrEqual(0)
    })
  })

  describe('AgencyControlData', () => {
    it('should have correct structure', () => {
      const controlData: AgencyControlData = {
        weekStart: '2024-03-10',
        weekEnd: '2024-03-16',
        creators: [],
        overallStats: {
          totalCreators: 5,
          calmCount: 2,
          busyCount: 2,
          overloadedCount: 1,
          avgScore: 45,
        },
      }

      const totalFromCounts =
        controlData.overallStats.calmCount +
        controlData.overallStats.busyCount +
        controlData.overallStats.overloadedCount

      expect(totalFromCounts).toBe(controlData.overallStats.totalCreators)
    })
  })

  describe('AgencyCreatorWeekData', () => {
    it('should have correct structure', () => {
      const creatorData: AgencyCreatorWeekData = {
        creatorId: 'creator-1',
        creatorName: 'Test Creator',
        creatorEmail: 'creator@example.com',
        healthScore: 35,
        healthStatus: 'calm',
        weekData: [],
      }

      expect(creatorData.healthScore).toBeLessThanOrEqual(100)
      expect(creatorData.healthScore).toBeGreaterThanOrEqual(0)
      expect(Array.isArray(creatorData.weekData)).toBe(true)
    })
  })
})
