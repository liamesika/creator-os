export interface WeeklyReview {
  id: string
  userId: string
  weekStartDate: string // YYYY-MM-DD (Monday)
  stats: {
    tasksCompleted: number
    tasksTotal: number
    goalsCompletionRatio: number
    eventsCount: number
    topCompanies: Array<{
      id: string
      name: string
      activityCount: number
    }>
  }
  reflection: {
    whatWorked?: string
    improveNext?: string
  }
  createdAt: Date
  updatedAt: Date
}

export function getWeekStartDate(date: Date = new Date()): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust to Monday
  const monday = new Date(d.setDate(diff))
  monday.setHours(0, 0, 0, 0)

  const year = monday.getFullYear()
  const month = String(monday.getMonth() + 1).padStart(2, '0')
  const dayStr = String(monday.getDate()).padStart(2, '0')

  return `${year}-${month}-${dayStr}`
}

export function formatWeekLabel(weekStartDate: string): string {
  const date = new Date(weekStartDate + 'T00:00:00')
  const endDate = new Date(date)
  endDate.setDate(endDate.getDate() + 6)

  const startDay = date.getDate()
  const endDay = endDate.getDate()
  const month = date.toLocaleDateString('he-IL', { month: 'long' })

  return `${startDay}-${endDay} ${month}`
}
