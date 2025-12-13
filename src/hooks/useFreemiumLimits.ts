'use client'

import { useMemo } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useCompaniesStore } from '@/stores/companiesStore'
import { useCalendarStore } from '@/stores/calendarStore'
import { useTasksStore } from '@/stores/tasksStore'
import {
  checkLimit,
  getUpgradeMessage,
  getApproachingLimitMessage,
  getEventsThisMonth,
  type FreemiumLimitType,
  type LimitStatus,
} from '@/lib/freemium'

export function useFreemiumLimits() {
  const { user } = useAuth()
  const companies = useCompaniesStore(state => state.companies)
  const events = useCalendarStore(state => state.events)
  const tasks = useTasksStore(state => state.tasks)

  const plan: 'free' | 'premium' = user?.plan || 'free'

  const limits = useMemo(() => {
    const activeCompanies = companies.filter(c => c.status === 'ACTIVE')
    const eventsThisMonth = getEventsThisMonth(events)
    const activeTasks = tasks.filter(t => !t.archived && t.status !== 'DONE')

    // AI generations - will be updated dynamically from store
    const aiStore = typeof window !== 'undefined' ? (window as any).__AI_GENERATIONS_COUNT__ || 0 : 0

    return {
      companies: checkLimit(plan, 'companies', activeCompanies.length),
      eventsPerMonth: checkLimit(plan, 'eventsPerMonth', eventsThisMonth),
      activeTasks: checkLimit(plan, 'activeTasks', activeTasks.length),
      aiGenerationsPerMonth: checkLimit(plan, 'aiGenerationsPerMonth', aiStore),
    }
  }, [plan, companies, events, tasks])

  const canAddCompany = limits.companies.canAdd
  const canAddEvent = limits.eventsPerMonth.canAdd
  const canAddTask = limits.activeTasks.canAdd

  const checkAndWarn = (limitType: FreemiumLimitType): boolean => {
    const limit = limits[limitType]

    if (plan === 'premium') return true

    if (!limit.canAdd) {
      // Show upgrade message
      return false
    }

    // Optionally warn when approaching limit (e.g., 1 remaining)
    if (limit.remaining <= 1 && limit.remaining > 0) {
      console.log(getApproachingLimitMessage(limitType, limit.remaining))
    }

    return true
  }

  const getBlockMessage = (limitType: FreemiumLimitType): string => {
    return getUpgradeMessage(limitType)
  }

  return {
    plan,
    isPremium: plan === 'premium',
    limits,
    canAddCompany,
    canAddEvent,
    canAddTask,
    checkAndWarn,
    getBlockMessage,
  }
}
