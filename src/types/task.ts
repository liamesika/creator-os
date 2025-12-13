import { LucideIcon } from 'lucide-react'
import { EventCategory } from './calendar'

export type TaskStatus = 'TODO' | 'DOING' | 'DONE'
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH'

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  dueDate?: Date
  scheduledAt?: string // HH:mm format
  companyId?: string | null
  companyNameSnapshot?: string
  eventId?: string | null
  eventTitleSnapshot?: string
  category?: EventCategory | 'general'
  archived: boolean
  createdAt: Date
  updatedAt: Date
}

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  LOW: 'נמוכה',
  MEDIUM: 'בינונית',
  HIGH: 'גבוהה',
}

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: 'לביצוע',
  DOING: 'בתהליך',
  DONE: 'הושלם',
}

export const generateTaskId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
}

export interface TaskFilters {
  status?: TaskStatus[]
  priority?: TaskPriority[]
  companyId?: string | null
  category?: EventCategory | 'general' | null
  dateRange?: 'today' | 'week' | 'month' | 'all'
  search?: string
}
