'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useCompaniesStore } from '@/stores/companiesStore'
import { useCalendarStore } from '@/stores/calendarStore'
import { useTasksStore } from '@/stores/tasksStore'
import { useGoalsStore } from '@/stores/goalsStore'
import { migrateLocalStorageToSupabase, clearLocalStorageData } from '@/lib/migration/localStorage'

const isDev = process.env.NODE_ENV === 'development'

/**
 * Hook to initialize all stores when user logs in
 * Also handles one-time migration from localStorage to Supabase
 * Should be called once at the app level
 */
export function useStoreInitialization() {
  const { user } = useAuth()
  const companiesStore = useCompaniesStore()
  const calendarStore = useCalendarStore()
  const tasksStore = useTasksStore()
  const goalsStore = useGoalsStore()
  const [migrationAttempted, setMigrationAttempted] = useState(false)

  useEffect(() => {
    if (user?.id && !migrationAttempted) {
      setMigrationAttempted(true)

      // First, attempt migration from localStorage
      migrateLocalStorageToSupabase(user.id)
        .then((migrated) => {
          if (migrated) {
            if (isDev) console.log('Migration completed successfully')
            // Clear localStorage after successful migration
            clearLocalStorageData()
          }

          // Then initialize all stores with data from Supabase
          return Promise.all([
            companiesStore.initialize(user.id),
            calendarStore.initialize(user.id),
            tasksStore.initialize(user.id),
            goalsStore.initialize(user.id),
          ])
        })
        .catch((error) => {
          if (isDev) console.error('Failed to initialize app:', error)
        })
    }
  }, [user?.id, migrationAttempted])
}
