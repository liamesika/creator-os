/**
 * Format relative time in Hebrew
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'עכשיו'
  if (diffMins < 60) return `לפני ${diffMins} דקות`
  if (diffHours < 24) return `לפני ${diffHours} שעות`
  if (diffDays < 7) return `לפני ${diffDays} ימים`

  // Format as date for older items
  return date.toLocaleDateString('he-IL', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  })
}

/**
 * Group activities by day
 */
export function groupActivitiesByDay<T extends { createdAt: Date }>(
  activities: T[]
): { label: string; items: T[] }[] {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const groups: Map<string, T[]> = new Map()

  activities.forEach((activity) => {
    const activityDate = new Date(activity.createdAt)
    const activityDay = new Date(
      activityDate.getFullYear(),
      activityDate.getMonth(),
      activityDate.getDate()
    )

    let label: string
    if (activityDay.getTime() === today.getTime()) {
      label = 'היום'
    } else if (activityDay.getTime() === yesterday.getTime()) {
      label = 'אתמול'
    } else {
      label = activityDate.toLocaleDateString('he-IL', {
        day: 'numeric',
        month: 'long',
        year: activityDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      })
    }

    if (!groups.has(label)) {
      groups.set(label, [])
    }
    groups.get(label)!.push(activity)
  })

  return Array.from(groups.entries()).map(([label, items]) => ({
    label,
    items,
  }))
}
