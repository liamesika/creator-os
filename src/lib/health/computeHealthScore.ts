/**
 * Creator Health Score Computation
 *
 * Deterministic algorithm to compute a score 0-100 based on:
 * - Open tasks count (non-archived, not done)
 * - Overdue tasks count
 * - Events count today + next 7 days
 * - Backlog pressure (tasks due within 3 days)
 * - Streak pressure (consecutive heavy days)
 *
 * Status thresholds:
 * 0-35: Calm (green)
 * 36-70: Busy (yellow)
 * 71-100: Overloaded (red)
 */

export interface HealthInputs {
  openTasksCount: number
  overdueTasksCount: number
  eventsTodayCount: number
  eventsWeekCount: number
  backlogPressure: number // tasks due within 3 days
  streakPressure: number // 0-5, consecutive heavy days ahead
  dailyLoads?: number[] // array of 7 days load values for streak calculation
}

export interface HealthDetails {
  openTasks: number
  overdueTasks: number
  eventsToday: number
  eventsWeek: number
  backlogPressure: number
  streakPressure: number
  insights: string[]
}

export interface HealthResult {
  score: number
  status: 'calm' | 'busy' | 'overloaded'
  details: HealthDetails
  statusLabel: string
  statusColor: string
  statusBgColor: string
}

// Weight configuration (must be consistent)
const WEIGHTS = {
  openTasks: 0.8,          // Each open task adds 0.8 points
  overdueTasks: 5,         // Each overdue task adds 5 points
  eventsToday: 3,          // Each event today adds 3 points
  eventsWeek: 0.5,         // Each event this week adds 0.5 points
  backlogPressure: 3,      // Each task due in 3 days adds 3 points
  streakPressure: 8,       // Each consecutive heavy day adds 8 points
} as const

// Thresholds for status
const STATUS_THRESHOLDS = {
  calm: 35,
  busy: 70,
} as const

// Heavy day threshold (events + due tasks)
const HEAVY_DAY_THRESHOLD = 5

/**
 * Compute health score from raw inputs
 */
export function computeHealthScore(inputs: HealthInputs): HealthResult {
  const {
    openTasksCount,
    overdueTasksCount,
    eventsTodayCount,
    eventsWeekCount,
    backlogPressure,
    streakPressure,
  } = inputs

  // Calculate raw score
  let rawScore = 0
  rawScore += openTasksCount * WEIGHTS.openTasks
  rawScore += overdueTasksCount * WEIGHTS.overdueTasks
  rawScore += eventsTodayCount * WEIGHTS.eventsToday
  rawScore += eventsWeekCount * WEIGHTS.eventsWeek
  rawScore += backlogPressure * WEIGHTS.backlogPressure
  rawScore += streakPressure * WEIGHTS.streakPressure

  // Clamp to 0-100
  const score = Math.min(100, Math.max(0, Math.round(rawScore)))

  // Determine status
  let status: 'calm' | 'busy' | 'overloaded'
  let statusLabel: string
  let statusColor: string
  let statusBgColor: string

  if (score <= STATUS_THRESHOLDS.calm) {
    status = 'calm'
    statusLabel = 'רגוע'
    statusColor = 'text-emerald-600'
    statusBgColor = 'bg-emerald-50'
  } else if (score <= STATUS_THRESHOLDS.busy) {
    status = 'busy'
    statusLabel = 'עמוס'
    statusColor = 'text-amber-600'
    statusBgColor = 'bg-amber-50'
  } else {
    status = 'overloaded'
    statusLabel = 'עומס יתר'
    statusColor = 'text-red-600'
    statusBgColor = 'bg-red-50'
  }

  // Generate insights
  const insights = generateInsights({
    openTasksCount,
    overdueTasksCount,
    eventsTodayCount,
    eventsWeekCount,
    backlogPressure,
    streakPressure,
  })

  return {
    score,
    status,
    statusLabel,
    statusColor,
    statusBgColor,
    details: {
      openTasks: openTasksCount,
      overdueTasks: overdueTasksCount,
      eventsToday: eventsTodayCount,
      eventsWeek: eventsWeekCount,
      backlogPressure,
      streakPressure,
      insights,
    },
  }
}

/**
 * Generate human-readable insights (Hebrew)
 */
function generateInsights(inputs: HealthInputs): string[] {
  const insights: string[] = []

  if (inputs.overdueTasksCount > 0) {
    insights.push(`${inputs.overdueTasksCount} משימות באיחור`)
  }

  if (inputs.backlogPressure > 3) {
    insights.push(`${inputs.backlogPressure} משימות ב-3 ימים הקרובים`)
  }

  if (inputs.eventsTodayCount > 4) {
    insights.push(`יום עמוס: ${inputs.eventsTodayCount} אירועים היום`)
  }

  if (inputs.streakPressure >= 3) {
    insights.push(`${inputs.streakPressure} ימים עמוסים ברצף`)
  }

  if (inputs.openTasksCount > 15) {
    insights.push(`${inputs.openTasksCount} משימות פתוחות`)
  }

  // Positive insight if things are calm
  if (insights.length === 0) {
    if (inputs.openTasksCount < 5 && inputs.overdueTasksCount === 0) {
      insights.push('הכל תחת שליטה!')
    } else if (inputs.eventsTodayCount === 0) {
      insights.push('יום פתוח לעבודה עמוקה')
    }
  }

  return insights.slice(0, 2) // Max 2 insights
}

/**
 * Calculate daily load for a specific day
 */
export function calculateDailyLoad(
  eventsCount: number,
  dueTasksCount: number,
  eventWeights?: { [category: string]: number }
): number {
  // Simple load calculation: events + due tasks
  return eventsCount + dueTasksCount
}

/**
 * Determine if a day is "heavy"
 */
export function isHeavyDay(load: number): boolean {
  return load >= HEAVY_DAY_THRESHOLD
}

/**
 * Calculate streak pressure from daily loads
 * Returns 0-5 based on consecutive heavy days ahead
 */
export function calculateStreakPressure(dailyLoads: number[]): number {
  let consecutiveHeavy = 0
  for (const load of dailyLoads) {
    if (isHeavyDay(load)) {
      consecutiveHeavy++
    } else {
      break // Streak broken
    }
  }
  return Math.min(5, consecutiveHeavy)
}

/**
 * Get color gradient for score visualization
 */
export function getScoreGradient(score: number): string {
  if (score <= STATUS_THRESHOLDS.calm) {
    return 'from-emerald-400 to-emerald-500'
  } else if (score <= STATUS_THRESHOLDS.busy) {
    return 'from-amber-400 to-amber-500'
  } else {
    return 'from-red-400 to-red-500'
  }
}

/**
 * Get ring stroke color based on status
 */
export function getScoreRingColor(status: 'calm' | 'busy' | 'overloaded'): string {
  switch (status) {
    case 'calm':
      return 'stroke-emerald-500'
    case 'busy':
      return 'stroke-amber-500'
    case 'overloaded':
      return 'stroke-red-500'
  }
}
