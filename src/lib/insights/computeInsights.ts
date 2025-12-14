/**
 * Deterministic Insights Computation
 * Non-AI, data-driven insights from tasks/events/goals
 */

import type { Task } from '@/types/task'
import type { CalendarEvent } from '@/types/calendar'
import type { InsightDisplay, InsightSeverity, InsightKey } from '@/types/insights'
import { INSIGHT_KEYS } from '@/types/insights'

// Partial task type for API flexibility
interface PartialTask {
  id: string
  title: string
  status: string
  priority: string
  dueDate?: Date
  companyId?: string | null
  archived?: boolean
  createdAt?: Date
}

// Partial event type for API flexibility
interface PartialEvent {
  id: string
  title: string
  date: Date | string
  category?: string
  companyId?: string | null
}

export interface InsightInputs {
  tasks: PartialTask[]
  events: PartialEvent[]
  companies?: { id: string; name: string }[]
  scope: 'creator' | 'agency'
  creatorName?: string
}

export interface ComputedInsight {
  key: InsightKey
  severity: InsightSeverity
  title: string
  message: string
  icon: string
  priority: number // Lower = more important
}

/**
 * Compute deterministic insights from data
 * Returns max 3 insights, sorted by priority
 */
export function computeInsights(inputs: InsightInputs): InsightDisplay[] {
  const insights: ComputedInsight[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // 1. Check for overdue tasks
  const overdueTasks = inputs.tasks.filter(t => {
    if (t.status === 'DONE' || t.archived || !t.dueDate) return false
    const dueDate = new Date(t.dueDate)
    dueDate.setHours(0, 0, 0, 0)
    return dueDate < today
  })

  const longOverdue = overdueTasks.filter(t => {
    const dueDate = new Date(t.dueDate!)
    const daysDiff = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
    return daysDiff >= 3
  })

  if (longOverdue.length > 0) {
    insights.push({
      key: INSIGHT_KEYS.OVERDUE_TASKS,
      severity: 'risk',
      title: 'משימות באיחור',
      message: `${longOverdue.length} משימות באיחור של 3+ ימים.`,
      icon: '⏰',
      priority: 1,
    })
  } else if (overdueTasks.length > 0) {
    insights.push({
      key: INSIGHT_KEYS.OVERDUE_TASKS,
      severity: 'warning',
      title: 'משימות באיחור',
      message: `${overdueTasks.length} משימות באיחור.`,
      icon: '⏰',
      priority: 3,
    })
  }

  // 2. Check for heavy days streak ahead
  const next7Days = getNextDaysLoads(inputs.events, inputs.tasks, 7)
  const heavyDaysStreak = countHeavyDaysStreak(next7Days)

  if (heavyDaysStreak >= 3) {
    insights.push({
      key: INSIGHT_KEYS.HEAVY_DAYS_STREAK,
      severity: 'warning',
      title: 'שבוע עמוס לפניך',
      message: `${heavyDaysStreak} ימים עמוסים ברצף בשבוע הקרוב.`,
      icon: '🔥',
      priority: 2,
    })
  }

  // 3. Company concentration analysis
  if (inputs.companies && inputs.companies.length > 0) {
    const companyLoad = computeCompanyConcentration(inputs.events, inputs.tasks, inputs.companies)
    const topCompany = companyLoad[0]

    if (topCompany && topCompany.percentage >= 40) {
      insights.push({
        key: INSIGHT_KEYS.COMPANY_CONCENTRATION,
        severity: topCompany.percentage >= 60 ? 'warning' : 'info',
        title: 'ריכוז לקוחות',
        message: `${topCompany.name} תופסת ${topCompany.percentage}% מהזמן שלך החודש.`,
        icon: '📊',
        priority: topCompany.percentage >= 60 ? 2 : 5,
      })
    }
  }

  // 4. Check completion rate
  const thisMonthTasks = inputs.tasks.filter(t => {
    if (!t.createdAt) return false
    const created = new Date(t.createdAt)
    return created.getMonth() === today.getMonth() && created.getFullYear() === today.getFullYear()
  })

  const completedTasks = thisMonthTasks.filter(t => t.status === 'DONE')
  const completionRate = thisMonthTasks.length > 0
    ? Math.round((completedTasks.length / thisMonthTasks.length) * 100)
    : 100

  if (completionRate < 50 && thisMonthTasks.length >= 5) {
    insights.push({
      key: INSIGHT_KEYS.COMPLETION_RATE_LOW,
      severity: 'warning',
      title: 'שיעור השלמה נמוך',
      message: `רק ${completionRate}% מהמשימות הושלמו החודש.`,
      icon: '📉',
      priority: 3,
    })
  }

  // 5. Check for empty week ahead
  const weekEvents = inputs.events.filter(e => {
    const eventDate = new Date(e.date)
    const diffDays = Math.floor((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return diffDays >= 0 && diffDays < 7
  })

  if (weekEvents.length === 0) {
    insights.push({
      key: INSIGHT_KEYS.NO_EVENTS_WEEK,
      severity: 'info',
      title: 'שבוע פנוי',
      message: 'אין אירועים מתוכננים לשבוע הקרוב.',
      icon: '📅',
      priority: 6,
    })
  }

  // Sort by priority and take top 3
  insights.sort((a, b) => a.priority - b.priority)

  return insights.slice(0, 3).map(insight => ({
    id: insight.key,
    severity: insight.severity,
    title: insight.title,
    message: insight.message,
    icon: insight.icon,
  }))
}

/**
 * Compute agency-specific insights for creators
 */
export function computeAgencyInsights(
  creators: Array<{
    id: string
    name: string
    tasks: PartialTask[]
    events: PartialEvent[]
    healthScore?: number
    healthStatus?: 'calm' | 'busy' | 'overloaded'
  }>
): InsightDisplay[] {
  const insights: ComputedInsight[] = []

  // Find creators at risk (overloaded status)
  const atRiskCreators = creators.filter(c => c.healthStatus === 'overloaded')

  if (atRiskCreators.length > 0) {
    const names = atRiskCreators.slice(0, 2).map(c => c.name).join(', ')
    const more = atRiskCreators.length > 2 ? ` ועוד ${atRiskCreators.length - 2}` : ''

    insights.push({
      key: INSIGHT_KEYS.CREATOR_AT_RISK,
      severity: 'risk',
      title: 'יוצרים בעומס יתר',
      message: `${names}${more} במצב עומס יתר.`,
      icon: '🚨',
      priority: 1,
    })
  }

  // Check overall agency performance
  const allTasks = creators.flatMap(c => c.tasks)
  const completedTasks = allTasks.filter(t => t.status === 'DONE')
  const overallCompletionRate = allTasks.length > 0
    ? Math.round((completedTasks.length / allTasks.length) * 100)
    : 100

  if (overallCompletionRate >= 80) {
    insights.push({
      key: INSIGHT_KEYS.AGENCY_PERFORMANCE_UP,
      severity: 'info',
      title: 'ביצועים מצוינים',
      message: `שיעור השלמה של ${overallCompletionRate}% בסוכנות.`,
      icon: '⭐',
      priority: 4,
    })
  } else if (overallCompletionRate < 50) {
    insights.push({
      key: INSIGHT_KEYS.COMPLETION_RATE_LOW,
      severity: 'warning',
      title: 'שיעור השלמה נמוך',
      message: `רק ${overallCompletionRate}% מהמשימות הושלמו בסוכנות.`,
      icon: '📉',
      priority: 2,
    })
  }

  // Sort and return top 3
  insights.sort((a, b) => a.priority - b.priority)

  return insights.slice(0, 3).map(insight => ({
    id: insight.key,
    severity: insight.severity,
    title: insight.title,
    message: insight.message,
    icon: insight.icon,
  }))
}

// Helper: Get next N days load
function getNextDaysLoads(events: PartialEvent[], tasks: PartialTask[], days: number): number[] {
  const loads: number[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 0; i < days; i++) {
    const targetDate = new Date(today)
    targetDate.setDate(today.getDate() + i)
    const dateStr = targetDate.toISOString().split('T')[0]

    let load = 0

    // Count events
    load += events.filter(e => {
      const eventDate = new Date(e.date).toISOString().split('T')[0]
      return eventDate === dateStr
    }).length

    // Count tasks due
    load += tasks.filter(t => {
      if (!t.dueDate || t.status === 'DONE' || t.archived) return false
      const dueDate = new Date(t.dueDate).toISOString().split('T')[0]
      return dueDate === dateStr
    }).length

    loads.push(load)
  }

  return loads
}

// Helper: Count consecutive heavy days (load >= 5)
function countHeavyDaysStreak(loads: number[]): number {
  let streak = 0
  for (const load of loads) {
    if (load >= 5) {
      streak++
    } else {
      break
    }
  }
  return streak
}

// Helper: Compute company time concentration
function computeCompanyConcentration(
  events: PartialEvent[],
  tasks: PartialTask[],
  companies: { id: string; name: string }[]
): Array<{ id: string; name: string; count: number; percentage: number }> {
  const companyCount: Map<string, number> = new Map()

  // Count events per company
  events.forEach(e => {
    if (e.companyId) {
      companyCount.set(e.companyId, (companyCount.get(e.companyId) || 0) + 1)
    }
  })

  // Count tasks per company
  tasks.forEach(t => {
    if (t.companyId) {
      companyCount.set(t.companyId, (companyCount.get(t.companyId) || 0) + 1)
    }
  })

  const total = Array.from(companyCount.values()).reduce((a, b) => a + b, 0)

  return companies
    .map(c => ({
      id: c.id,
      name: c.name,
      count: companyCount.get(c.id) || 0,
      percentage: total > 0 ? Math.round(((companyCount.get(c.id) || 0) / total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)
}
