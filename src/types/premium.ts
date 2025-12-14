/**
 * Premium Features Types
 * Health Score, Smart Week, Focus Mode, Daily Digest
 */

// ============================================
// NOTIFICATION SETTINGS
// ============================================
export interface NotificationSettings {
  id: string
  userId: string
  dailyEmailEnabled: boolean
  dailyEmailTime: string // HH:MM:SS format
  timezone: string
  includeMotivation: boolean
  weeklySummaryEnabled: boolean
  createdAt: Date
  updatedAt: Date
}

// ============================================
// HEALTH SCORE
// ============================================
export type HealthStatus = 'calm' | 'busy' | 'overloaded'

export interface HealthSnapshot {
  id: string
  userId: string
  snapshotDate: Date
  score: number
  status: HealthStatus
  details: {
    openTasks: number
    overdueTasks: number
    eventsToday: number
    eventsWeek: number
    backlogPressure: number
    streakPressure: number
    insights: string[]
  }
  createdAt: Date
}

export interface CreatorHealthData {
  creatorId: string
  creatorName: string
  creatorEmail: string
  score: number
  status: HealthStatus
  insights: string[]
}

// ============================================
// SMART WEEK
// ============================================
export interface DayLoad {
  date: string // YYYY-MM-DD
  eventsCount: number
  tasksCount: number
  totalLoad: number
  isHeavy: boolean
  events: SmartWeekEvent[]
  tasks: SmartWeekTask[]
  topCompanies: string[]
}

export interface SmartWeekEvent {
  id: string
  title: string
  startTime: string
  endTime?: string
  companyId?: string
  companyName?: string
  category?: string
}

export interface SmartWeekTask {
  id: string
  title: string
  dueDate?: string
  companyId?: string
  companyName?: string
  priority?: 'low' | 'medium' | 'high'
  status: 'TODO' | 'DOING' | 'DONE'
}

export interface SmartWeekData {
  weekStart: string
  weekEnd: string
  days: DayLoad[]
  overallLoad: number
  riskDays: number
}

// ============================================
// FOCUS MODE
// ============================================
export interface FocusSession {
  id: string
  userId: string
  sessionDate: Date
  startedAt: Date
  endedAt?: Date
  completedTasks: FocusTask[]
  movedTasks: FocusMovedTask[]
  reflection?: string
  status: 'active' | 'completed' | 'abandoned'
  createdAt: Date
}

export interface FocusTask {
  id: string
  title: string
  completedAt: Date
}

export interface FocusMovedTask {
  id: string
  title: string
  originalDate?: string
  newDate: string
}

export interface FocusDayData {
  events: SmartWeekEvent[]
  tasks: SmartWeekTask[]
  goals: FocusGoal[]
  nextAction?: SmartWeekTask | SmartWeekEvent
}

export interface FocusGoal {
  id: string
  title: string
  status: 'NOT_STARTED' | 'PARTIAL' | 'DONE'
}

// ============================================
// DAILY DIGEST
// ============================================
export interface DigestLog {
  id: string
  userId: string
  digestDate: Date
  digestType: 'daily' | 'weekly' | 'agency'
  sentAt?: Date
  emailId?: string
  createdAt: Date
}

export interface DailyDigestContent {
  userId: string
  userName: string
  userEmail: string
  date: string
  topTasks: {
    id: string
    title: string
    dueDate?: string
    priority?: string
  }[]
  todayEvents: {
    id: string
    title: string
    time: string
  }[]
  healthScore: number
  healthStatus: HealthStatus
  healthInsight: string
  motivationalMessage: string
}

export interface AgencyDigestContent {
  agencyId: string
  agencyName: string
  agencyEmail: string
  date: string
  totalCreators: number
  overloadedCreators: CreatorHealthData[]
  busyCreators: CreatorHealthData[]
  weeklyTrend: 'improving' | 'stable' | 'declining'
}

// ============================================
// AGENCY CONTROL
// ============================================
export interface AgencyCreatorWeekData {
  creatorId: string
  creatorName: string
  creatorEmail: string
  healthScore: number
  healthStatus: HealthStatus
  weekData: DayLoad[]
}

export interface AgencyControlData {
  weekStart: string
  weekEnd: string
  creators: AgencyCreatorWeekData[]
  overallStats: {
    totalCreators: number
    calmCount: number
    busyCount: number
    overloadedCount: number
    avgScore: number
  }
}
