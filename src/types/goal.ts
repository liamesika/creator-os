export type GoalItemStatus = 'DONE' | 'PARTIAL' | 'NOT_DONE'

export interface GoalItem {
  id: string
  title: string
  status: GoalItemStatus
  note?: string
}

export interface DailyGoal {
  id: string
  date: string // YYYY-MM-DD format
  items: GoalItem[]
  reflection?: {
    whatWorked?: string
    whatBlocked?: string
  }
  createdAt: Date
  updatedAt: Date
}

export const MAX_DAILY_GOALS = 3

export const GOAL_STATUS_LABELS: Record<GoalItemStatus, string> = {
  DONE: 'הושלם',
  PARTIAL: 'בוצע חלקית',
  NOT_DONE: 'לא בוצע',
}

export const generateGoalId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
}

export const formatGoalDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const parseGoalDate = (dateStr: string): Date => {
  return new Date(dateStr + 'T00:00:00')
}

export const getTodayDateString = (): string => {
  return formatGoalDate(new Date())
}

export const getWeekDates = (startDate: Date): Date[] => {
  const dates: Date[] = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    dates.push(date)
  }
  return dates
}

export const calculateGoalCompletion = (items: GoalItem[]): number => {
  if (items.length === 0) return 0

  const totalPoints = items.reduce((sum, item) => {
    if (item.status === 'DONE') return sum + 1
    if (item.status === 'PARTIAL') return sum + 0.5
    return sum
  }, 0)

  return (totalPoints / items.length) * 100
}
