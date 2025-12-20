'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { computeHealthScore, calculateStreakPressure, calculateDailyLoad, type HealthResult } from '@/lib/health/computeHealthScore'
import { useTasksStore } from '@/stores/tasksStore'
import { useCalendarStore } from '@/stores/calendarStore'

interface UseHealthScoreReturn {
  health: HealthResult | null
  isLoading: boolean
  error: string | null
  refresh: () => void
}

export function useHealthScore(): UseHealthScoreReturn {
  // useAuth now returns demo user when in demo mode - no separate check needed
  const { user } = useAuth()
  const [health, setHealth] = useState<HealthResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { tasks } = useTasksStore()
  const { events } = useCalendarStore()

  const computeScore = useCallback(() => {
    // user will be demo user or real user - useAuth handles demo mode
    if (!user) {
      setHealth(null)
      setIsLoading(false)
      return
    }

    try {
      const now = new Date()
      const today = now.toISOString().split('T')[0]

      // Calculate open tasks (not archived, not done)
      const openTasks = tasks.filter(t => !t.archived && t.status !== 'DONE')
      const openTasksCount = openTasks.length

      // Calculate overdue tasks
      const overdueTasks = openTasks.filter(t => {
        if (!t.dueDate) return false
        return new Date(t.dueDate) < now && t.status !== 'DONE'
      })
      const overdueTasksCount = overdueTasks.length

      // Calculate events today
      const eventsToday = events.filter(e => {
        const eventDate = new Date(e.date).toISOString().split('T')[0]
        return eventDate === today
      })
      const eventsTodayCount = eventsToday.length

      // Calculate events this week
      const weekEnd = new Date(now)
      weekEnd.setDate(weekEnd.getDate() + 7)
      const eventsWeek = events.filter(e => {
        const eventDate = new Date(e.date)
        return eventDate >= now && eventDate <= weekEnd
      })
      const eventsWeekCount = eventsWeek.length

      // Calculate backlog pressure (tasks due within 3 days)
      const threeDaysFromNow = new Date(now)
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)
      const backlogTasks = openTasks.filter(t => {
        if (!t.dueDate) return false
        const dueDate = new Date(t.dueDate)
        return dueDate >= now && dueDate <= threeDaysFromNow
      })
      const backlogPressure = backlogTasks.length

      // Calculate daily loads for streak pressure
      const dailyLoads: number[] = []
      for (let i = 0; i < 7; i++) {
        const dayDate = new Date(now)
        dayDate.setDate(dayDate.getDate() + i)
        const dayStr = dayDate.toISOString().split('T')[0]

        const dayEvents = events.filter(e => {
          const eventDate = new Date(e.date).toISOString().split('T')[0]
          return eventDate === dayStr
        }).length

        const dayTasks = openTasks.filter(t => {
          if (!t.dueDate) return false
          const taskDate = new Date(t.dueDate).toISOString().split('T')[0]
          return taskDate === dayStr
        }).length

        dailyLoads.push(calculateDailyLoad(dayEvents, dayTasks))
      }

      const streakPressure = calculateStreakPressure(dailyLoads)

      // Compute final score
      const result = computeHealthScore({
        openTasksCount,
        overdueTasksCount,
        eventsTodayCount,
        eventsWeekCount,
        backlogPressure,
        streakPressure,
        dailyLoads,
      })

      setHealth(result)
      setError(null)
    } catch (err) {
      console.error('Error computing health score:', err)
      setError('שגיאה בחישוב מדד הבריאות')
    } finally {
      setIsLoading(false)
    }
  }, [user, tasks, events])

  useEffect(() => {
    computeScore()
  }, [computeScore])

  const refresh = useCallback(() => {
    setIsLoading(true)
    computeScore()
  }, [computeScore])

  return { health, isLoading, error, refresh }
}

// Hook to get health data for a specific creator (for agency use)
export function useCreatorHealthScore(creatorId: string): UseHealthScoreReturn {
  const [health, setHealth] = useState<HealthResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCreatorHealth = useCallback(async () => {
    if (!creatorId) {
      setHealth(null)
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      // This would fetch from API in real implementation
      // For now, return a mock result
      const mockResult = computeHealthScore({
        openTasksCount: Math.floor(Math.random() * 20),
        overdueTasksCount: Math.floor(Math.random() * 5),
        eventsTodayCount: Math.floor(Math.random() * 8),
        eventsWeekCount: Math.floor(Math.random() * 20),
        backlogPressure: Math.floor(Math.random() * 8),
        streakPressure: Math.floor(Math.random() * 5),
      })
      setHealth(mockResult)
      setError(null)
    } catch (err) {
      console.error('Error fetching creator health:', err)
      setError('שגיאה בטעינת נתוני בריאות')
    } finally {
      setIsLoading(false)
    }
  }, [creatorId])

  useEffect(() => {
    fetchCreatorHealth()
  }, [fetchCreatorHealth])

  return { health, isLoading, error, refresh: fetchCreatorHealth }
}
