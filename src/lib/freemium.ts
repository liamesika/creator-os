/**
 * Freemium limits and enforcement
 * Free plan restrictions with upgrade prompts
 */

export const FREEMIUM_LIMITS = {
  companies: 3,
  eventsPerMonth: 30,
  activeTasks: 50,
  aiGenerationsPerMonth: 10,
} as const

export type FreemiumLimitType = keyof typeof FREEMIUM_LIMITS

export interface LimitStatus {
  current: number
  limit: number
  isAtLimit: boolean
  canAdd: boolean
  remaining: number
}

/**
 * Check if user can perform an action based on their plan and current usage
 */
export function checkLimit(
  plan: 'free' | 'premium',
  limitType: FreemiumLimitType,
  currentCount: number
): LimitStatus {
  if (plan === 'premium') {
    // Premium users have no limits
    return {
      current: currentCount,
      limit: Infinity,
      isAtLimit: false,
      canAdd: true,
      remaining: Infinity,
    }
  }

  const limit = FREEMIUM_LIMITS[limitType]
  const isAtLimit = currentCount >= limit
  const canAdd = currentCount < limit
  const remaining = Math.max(0, limit - currentCount)

  return {
    current: currentCount,
    limit,
    isAtLimit,
    canAdd,
    remaining,
  }
}

/**
 * Get upgrade message for hitting a limit
 */
export function getUpgradeMessage(limitType: FreemiumLimitType): string {
  const messages: Record<FreemiumLimitType, string> = {
    companies: `הגעת למגבלה של ${FREEMIUM_LIMITS.companies} חברות בתוכנית החינמית. שדרג לפרימיום לחברות ללא הגבלה.`,
    eventsPerMonth: `הגעת למגבלה של ${FREEMIUM_LIMITS.eventsPerMonth} אירועים בחודש. שדרג לפרימיום לאירועים ללא הגבלה.`,
    activeTasks: `הגעת למגבלה של ${FREEMIUM_LIMITS.activeTasks} משימות פעילות. שדרג לפרימיום למשימות ללא הגבלה.`,
    aiGenerationsPerMonth: `הגעת למגבלה של ${FREEMIUM_LIMITS.aiGenerationsPerMonth} יצירות AI בחודש. שדרג לפרימיום ליצירה ללא הגבלה.`,
  }

  return messages[limitType]
}

/**
 * Get approaching limit warning message
 */
export function getApproachingLimitMessage(
  limitType: FreemiumLimitType,
  remaining: number
): string {
  const warnings: Record<FreemiumLimitType, string> = {
    companies: `נותרו ${remaining} חברות מתוך ${FREEMIUM_LIMITS.companies}`,
    eventsPerMonth: `נותרו ${remaining} אירועים החודש`,
    activeTasks: `נותרו ${remaining} משימות`,
    aiGenerationsPerMonth: `נותרו ${remaining} יצירות AI החודש`,
  }

  return warnings[limitType]
}

/**
 * Calculate events created this month
 */
export function getEventsThisMonth(events: Array<{ createdAt: Date }>): number {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  return events.filter(event => {
    const createdAt = new Date(event.createdAt)
    return createdAt >= startOfMonth
  }).length
}
