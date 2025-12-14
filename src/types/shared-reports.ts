/**
 * Shared Reports Types
 * Export and share monthly reviews
 */

export type SharedReportScope = 'monthly_review' | 'creator_report' | 'agency_report'

export interface SharedReport {
  token: string
  ownerUserId: string
  scope: SharedReportScope
  payload: SharedReportPayload
  expiresAt?: Date
  createdAt: Date
}

export interface SharedReportPayload {
  title: string
  subtitle?: string
  generatedAt: string
  ownerName: string
  month?: string
  year?: number
  stats: SharedReportStats
  insights: SharedReportInsight[]
  highlights?: SharedReportHighlight[]
}

export interface SharedReportStats {
  tasksCompleted?: number
  tasksCreated?: number
  taskCompletionRate?: number
  eventsCount?: number
  goalsAchieved?: number
  goalsTotal?: number
  totalEarnings?: number
  creatorsCount?: number
}

export interface SharedReportInsight {
  icon: string
  title: string
  description: string
}

export interface SharedReportHighlight {
  label: string
  value: string | number
  icon?: string
}

export interface CreateSharePayload {
  month: number
  year: number
  expiresInDays?: number // null for no expiry
}

export interface ExportPayload {
  month: number
  year: number
  format: 'json' | 'pdf' // pdf would require additional processing
}

export function generateShareToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  for (let i = 0; i < 24; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
}
