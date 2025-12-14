'use client'

import { useMemo } from 'react'
import { useTasksStore } from '@/stores/tasksStore'
import { useCalendarStore } from '@/stores/calendarStore'
import { useCompaniesStore } from '@/stores/companiesStore'
import { useAuth } from '@/context/AuthContext'
import { computeInsights, computeAgencyInsights } from '@/lib/insights/computeInsights'
import type { InsightDisplay } from '@/types/insights'

interface UseInsightsOptions {
  scope?: 'creator' | 'agency'
}

interface UseInsightsReturn {
  insights: InsightDisplay[]
  isLoading: boolean
}

/**
 * Hook to get deterministic insights for creator or agency
 */
export function useInsights(options: UseInsightsOptions = {}): UseInsightsReturn {
  const { scope = 'creator' } = options
  const { user } = useAuth()
  const { tasks } = useTasksStore()
  const { events } = useCalendarStore()
  const { companies } = useCompaniesStore()

  const insights = useMemo((): InsightDisplay[] => {
    if (!user) return []

    if (scope === 'creator') {
      return computeInsights({
        tasks,
        events,
        companies: companies.map(c => ({ id: c.id, name: c.name })),
        scope: 'creator',
      })
    }

    // Agency scope - in a real implementation this would aggregate from multiple creators
    // For now, compute insights for the current user's data
    return computeInsights({
      tasks,
      events,
      companies: companies.map(c => ({ id: c.id, name: c.name })),
      scope: 'agency',
    })
  }, [user, tasks, events, companies, scope])

  return {
    insights,
    isLoading: false,
  }
}

export default useInsights
