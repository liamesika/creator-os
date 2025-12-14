/**
 * Monthly Review Computation
 *
 * Deterministic algorithm to compute monthly insights and statistics.
 * No AI - just pure data-driven computations.
 */

import type { Task } from '@/types/task'
import type { CalendarEvent } from '@/types/calendar'
import type { DailyGoal, GoalItem } from '@/types/goal'

// Partial types for API flexibility
interface PartialTask {
  id: string
  title: string
  status: string
  priority: string
  dueDate?: Date
  archived?: boolean
  createdAt?: Date
  updatedAt?: Date
}

interface PartialEvent {
  id: string
  title: string
  date: Date | string
  category?: string
  startTime?: string | null
  endTime?: string | null
}

interface PartialGoalItem {
  id: string
  title?: string
  text?: string
  status?: string
  completed?: boolean
}

interface PartialGoal {
  id: string
  date: string
  items: PartialGoalItem[]
}

export interface MonthlyReviewInputs {
  tasks: PartialTask[]
  events: PartialEvent[]
  goals: PartialGoal[]
  month: number // 0-11
  year: number
}

export interface MonthlyStats {
  tasksCompleted: number
  tasksCreated: number
  taskCompletionRate: number
  eventsAttended: number
  goalsAchieved: number
  goalsTotal: number
  goalCompletionRate: number
  busiestDay: { date: string; load: number } | null
  calmestDay: { date: string; load: number } | null
  averageDailyLoad: number
  totalEventsHours: number
}

export interface MonthlyInsight {
  type: 'positive' | 'negative' | 'neutral'
  icon: string
  title: string
  description: string
}

export interface MonthlyReviewResult {
  stats: MonthlyStats
  insights: MonthlyInsight[]
  topCategories: { category: string; count: number }[]
  weeklyBreakdown: { week: number; tasksCompleted: number; eventsCount: number }[]
  priorityDistribution: { priority: 'HIGH' | 'MEDIUM' | 'LOW'; count: number }[]
  monthLabel: string
}

const MONTHS_HEBREW = [
  'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
]

/**
 * Compute monthly review from raw data
 */
export function computeMonthlyReview(inputs: MonthlyReviewInputs): MonthlyReviewResult {
  const { tasks, events, goals, month, year } = inputs

  const startDate = new Date(year, month, 1)
  const endDate = new Date(year, month + 1, 0) // Last day of month

  // Filter data for the month
  const monthTasks = tasks.filter(t => {
    if (!t.createdAt) return false
    const date = new Date(t.createdAt)
    return date >= startDate && date <= endDate
  })

  const completedTasks = monthTasks.filter(t => t.status === 'DONE')

  const monthEvents = events.filter(e => {
    const date = new Date(e.date)
    return date >= startDate && date <= endDate
  })

  const monthGoals = goals.filter(g => {
    if (!g.date) return false
    const date = new Date(g.date)
    return date >= startDate && date <= endDate
  })

  // Count achieved goals based on items with DONE status
  const achievedGoals = monthGoals.filter(g => {
    const doneItems = g.items.filter(item => item.status === 'DONE')
    return doneItems.length === g.items.length && g.items.length > 0
  })

  // Calculate daily loads for busiest/calmest day
  const dailyLoads: Map<string, number> = new Map()
  const daysInMonth = endDate.getDate()

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    const dateStr = date.toISOString().split('T')[0]
    dailyLoads.set(dateStr, 0)
  }

  monthEvents.forEach(e => {
    const dateStr = new Date(e.date).toISOString().split('T')[0]
    dailyLoads.set(dateStr, (dailyLoads.get(dateStr) || 0) + 1)
  })

  monthTasks.filter(t => t.dueDate).forEach(t => {
    const dateStr = new Date(t.dueDate!).toISOString().split('T')[0]
    if (dailyLoads.has(dateStr)) {
      dailyLoads.set(dateStr, (dailyLoads.get(dateStr) || 0) + 1)
    }
  })

  let busiestDay: { date: string; load: number } | null = null
  let calmestDay: { date: string; load: number } | null = null
  let totalLoad = 0

  dailyLoads.forEach((load, date) => {
    totalLoad += load
    if (!busiestDay || load > busiestDay.load) {
      busiestDay = { date, load }
    }
    if (!calmestDay || load < calmestDay.load) {
      calmestDay = { date, load }
    }
  })

  // Calculate total event hours
  let totalEventsHours = 0
  monthEvents.forEach(e => {
    if (e.startTime && e.endTime) {
      const [startH, startM] = e.startTime.split(':').map(Number)
      const [endH, endM] = e.endTime.split(':').map(Number)
      const hours = (endH * 60 + endM - startH * 60 - startM) / 60
      if (hours > 0) totalEventsHours += hours
    }
  })

  // Calculate stats
  const stats: MonthlyStats = {
    tasksCompleted: completedTasks.length,
    tasksCreated: monthTasks.length,
    taskCompletionRate: monthTasks.length > 0
      ? Math.round((completedTasks.length / monthTasks.length) * 100)
      : 0,
    eventsAttended: monthEvents.length,
    goalsAchieved: achievedGoals.length,
    goalsTotal: monthGoals.length,
    goalCompletionRate: monthGoals.length > 0
      ? Math.round((achievedGoals.length / monthGoals.length) * 100)
      : 0,
    busiestDay,
    calmestDay,
    averageDailyLoad: daysInMonth > 0 ? Math.round((totalLoad / daysInMonth) * 10) / 10 : 0,
    totalEventsHours: Math.round(totalEventsHours * 10) / 10,
  }

  // Generate insights
  const insights = generateInsights(stats, monthTasks, monthEvents, completedTasks)

  // Top event categories
  const categoryCount: Map<string, number> = new Map()
  monthEvents.forEach(e => {
    const cat = e.category || 'אחר'
    categoryCount.set(cat, (categoryCount.get(cat) || 0) + 1)
  })

  const topCategories = Array.from(categoryCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([category, count]) => ({ category, count }))

  // Weekly breakdown
  const weeklyBreakdown: { week: number; tasksCompleted: number; eventsCount: number }[] = []
  for (let week = 1; week <= 5; week++) {
    const weekStart = (week - 1) * 7 + 1
    const weekEnd = Math.min(week * 7, daysInMonth)

    const weekTasks = completedTasks.filter(t => {
      if (!t.updatedAt) return false
      const date = new Date(t.updatedAt)
      const day = date.getDate()
      return date.getMonth() === month && date.getFullYear() === year && day >= weekStart && day <= weekEnd
    })

    const weekEvents = monthEvents.filter(e => {
      const day = new Date(e.date).getDate()
      return day >= weekStart && day <= weekEnd
    })

    weeklyBreakdown.push({
      week,
      tasksCompleted: weekTasks.length,
      eventsCount: weekEvents.length,
    })
  }

  // Priority distribution
  const priorityCounts: Record<string, number> = { HIGH: 0, MEDIUM: 0, LOW: 0 }
  monthTasks.forEach(t => {
    const priority = t.priority?.toUpperCase()
    if (priority && priority in priorityCounts) {
      priorityCounts[priority]++
    }
  })

  const priorityDistribution = [
    { priority: 'HIGH' as const, count: priorityCounts.HIGH },
    { priority: 'MEDIUM' as const, count: priorityCounts.MEDIUM },
    { priority: 'LOW' as const, count: priorityCounts.LOW },
  ]

  return {
    stats,
    insights,
    topCategories,
    weeklyBreakdown,
    priorityDistribution,
    monthLabel: `${MONTHS_HEBREW[month]} ${year}`,
  }
}

/**
 * Generate deterministic insights based on data patterns
 */
function generateInsights(
  stats: MonthlyStats,
  tasks: PartialTask[],
  events: PartialEvent[],
  completedTasks: PartialTask[]
): MonthlyInsight[] {
  const insights: MonthlyInsight[] = []

  // Task completion rate insight
  if (stats.taskCompletionRate >= 80) {
    insights.push({
      type: 'positive',
      icon: '🎯',
      title: 'השלמת משימות מצוינת',
      description: `השלמת ${stats.taskCompletionRate}% מהמשימות החודש - עבודה מעולה!`,
    })
  } else if (stats.taskCompletionRate >= 50) {
    insights.push({
      type: 'neutral',
      icon: '📊',
      title: 'התקדמות סבירה במשימות',
      description: `השלמת ${stats.taskCompletionRate}% מהמשימות. יש מקום לשיפור.`,
    })
  } else if (stats.tasksCreated > 0) {
    insights.push({
      type: 'negative',
      icon: '⚠️',
      title: 'שיעור השלמה נמוך',
      description: `רק ${stats.taskCompletionRate}% מהמשימות הושלמו. שקול לפרק משימות גדולות.`,
    })
  }

  // Goal achievement insight
  if (stats.goalsTotal > 0) {
    if (stats.goalCompletionRate >= 75) {
      insights.push({
        type: 'positive',
        icon: '🏆',
        title: 'יעדים הושגו!',
        description: `הגעת ל-${stats.goalsAchieved} מתוך ${stats.goalsTotal} יעדים - מרשים!`,
      })
    } else if (stats.goalCompletionRate >= 50) {
      insights.push({
        type: 'neutral',
        icon: '🎯',
        title: 'התקדמות ביעדים',
        description: `הגעת ל-${stats.goalsAchieved} מתוך ${stats.goalsTotal} יעדים.`,
      })
    }
  }

  // Busiest day insight
  if (stats.busiestDay && stats.busiestDay.load >= 5) {
    const date = new Date(stats.busiestDay.date)
    const dayName = date.toLocaleDateString('he-IL', { weekday: 'long' })
    insights.push({
      type: 'neutral',
      icon: '🔥',
      title: 'יום העמוס ביותר',
      description: `${date.getDate()} (${dayName}) היה היום העמוס עם ${stats.busiestDay.load} פריטים.`,
    })
  }

  // Event hours insight
  if (stats.totalEventsHours > 20) {
    insights.push({
      type: 'neutral',
      icon: '⏰',
      title: 'שעות אירועים',
      description: `בילית ${stats.totalEventsHours} שעות באירועים החודש.`,
    })
  }

  // Average load insight
  if (stats.averageDailyLoad > 5) {
    insights.push({
      type: 'negative',
      icon: '😓',
      title: 'עומס יומי גבוה',
      description: `ממוצע של ${stats.averageDailyLoad} פריטים ביום. שקול להאציל או לדחות.`,
    })
  } else if (stats.averageDailyLoad <= 3 && stats.tasksCreated > 0) {
    insights.push({
      type: 'positive',
      icon: '😌',
      title: 'עומס מאוזן',
      description: `ממוצע של ${stats.averageDailyLoad} פריטים ביום - קצב בריא!`,
    })
  }

  // High priority overload
  const highPriorityTasks = tasks.filter(t => t.priority === 'HIGH')
  if (highPriorityTasks.length > tasks.length * 0.4 && tasks.length > 5) {
    insights.push({
      type: 'negative',
      icon: '🚨',
      title: 'יותר מדי משימות דחופות',
      description: `${Math.round((highPriorityTasks.length / tasks.length) * 100)}% מהמשימות בעדיפות גבוהה. עדכן סדרי עדיפויות.`,
    })
  }

  // Productivity trend (completed in first half vs second half)
  const midMonth = 15
  const firstHalfCompleted = completedTasks.filter(t => {
    if (!t.updatedAt) return false
    return new Date(t.updatedAt).getDate() <= midMonth
  }).length

  const secondHalfCompleted = completedTasks.length - firstHalfCompleted

  if (secondHalfCompleted > firstHalfCompleted * 1.5 && completedTasks.length > 5) {
    insights.push({
      type: 'positive',
      icon: '📈',
      title: 'מגמת שיפור',
      description: 'השלמת יותר משימות במחצית השנייה של החודש.',
    })
  } else if (firstHalfCompleted > secondHalfCompleted * 1.5 && completedTasks.length > 5) {
    insights.push({
      type: 'neutral',
      icon: '📉',
      title: 'ירידה בקצב',
      description: 'השלמת פחות משימות במחצית השנייה. נסה לשמור על מומנטום.',
    })
  }

  return insights.slice(0, 5) // Max 5 insights
}

/**
 * Get comparison with previous month
 */
export function computeMonthComparison(
  currentStats: MonthlyStats,
  previousStats: MonthlyStats
): { label: string; change: number; isPositive: boolean }[] {
  const comparisons = []

  // Task completion
  const taskDiff = currentStats.tasksCompleted - previousStats.tasksCompleted
  comparisons.push({
    label: 'משימות שהושלמו',
    change: taskDiff,
    isPositive: taskDiff >= 0,
  })

  // Events attended
  const eventDiff = currentStats.eventsAttended - previousStats.eventsAttended
  comparisons.push({
    label: 'אירועים',
    change: eventDiff,
    isPositive: true, // Events are neutral
  })

  // Completion rate
  const rateDiff = currentStats.taskCompletionRate - previousStats.taskCompletionRate
  comparisons.push({
    label: 'שיעור השלמה',
    change: rateDiff,
    isPositive: rateDiff >= 0,
  })

  return comparisons
}

/**
 * Format date for display in Hebrew
 */
export function formatDateHebrew(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('he-IL', {
    day: 'numeric',
    month: 'long',
  })
}
