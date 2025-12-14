/**
 * Insight Layer Types
 * Deterministic, non-AI insights
 */

export type InsightScope = 'creator' | 'agency'
export type InsightSeverity = 'info' | 'warning' | 'risk'

export interface Insight {
  id: string
  userId: string
  scope: InsightScope
  relatedCreatorUserId?: string
  severity: InsightSeverity
  title: string
  message: string
  insightKey: string
  createdForDate: Date
  createdAt: Date
}

export interface InsightDisplay {
  id: string
  severity: InsightSeverity
  title: string
  message: string
  icon: string
  creatorName?: string
}

export const INSIGHT_SEVERITY_CONFIG: Record<InsightSeverity, {
  label: string
  icon: string
  color: string
  bgColor: string
  borderColor: string
}> = {
  info: {
    label: 'מידע',
    icon: '💡',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  warning: {
    label: 'אזהרה',
    icon: '⚠️',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  risk: {
    label: 'סיכון',
    icon: '🚨',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
}

// Insight key constants for uniqueness
export const INSIGHT_KEYS = {
  OVERDUE_TASKS: 'overdue_tasks',
  HEAVY_DAYS_STREAK: 'heavy_days_streak',
  COMPANY_CONCENTRATION: 'company_concentration',
  OVERLOAD_INCREASE: 'overload_increase',
  COMPLETION_RATE_LOW: 'completion_rate_low',
  EARNINGS_MILESTONE: 'earnings_milestone',
  NO_EVENTS_WEEK: 'no_events_week',
  GOAL_STREAK: 'goal_streak',
  CREATOR_AT_RISK: 'creator_at_risk',
  AGENCY_PERFORMANCE_UP: 'agency_performance_up',
} as const

export type InsightKey = typeof INSIGHT_KEYS[keyof typeof INSIGHT_KEYS]
