import { db } from '@/lib/supabase/database'

export async function migrateLocalStorageToSupabase(userId: string): Promise<boolean> {
  try {
    // Check if already migrated using the new db method
    const alreadyMigrated = await db.checkMigrationStatus(userId)

    if (alreadyMigrated) {
      console.log('Migration already completed')
      return true
    }

    console.log('Starting localStorage migration...')

    // Get data from localStorage
    const companiesData = localStorage.getItem('creators-os-companies')
    const calendarData = localStorage.getItem('creators-os-calendar')
    const tasksData = localStorage.getItem('creators-os-tasks')
    const goalsData = localStorage.getItem('creators-os-goals')

    let migratedCounts = {
      companies: 0,
      events: 0,
      tasks: 0,
      goals: 0,
    }

    // Migrate Companies
    if (companiesData) {
      try {
        const parsed = JSON.parse(companiesData)
        const companies = parsed.state?.companies || []

        for (const company of companies) {
          try {
            await db.createCompany(userId, {
              name: company.name,
              brandType: company.brandType,
              contactName: company.contactName,
              contactEmail: company.contactEmail,
              contactPhone: company.contactPhone,
              notes: company.notes,
              contract: company.contract,
              paymentTerms: company.paymentTerms,
              status: company.status,
            })
            migratedCounts.companies++
          } catch (err) {
            console.warn('Failed to migrate company:', company.name, err)
          }
        }
      } catch (error) {
        console.error('Error parsing companies data:', error)
      }
    }

    // Migrate Calendar Events
    if (calendarData) {
      try {
        const parsed = JSON.parse(calendarData)
        const events = parsed.state?.events || []

        for (const event of events) {
          try {
            await db.createCalendarEvent(userId, {
              category: event.category,
              title: event.title,
              date: new Date(event.date),
              startTime: event.startTime,
              endTime: event.endTime,
              isAllDay: event.isAllDay,
              notes: event.notes,
              companyId: event.companyId,
              companyNameSnapshot: event.companyNameSnapshot,
              reminders: event.reminders || [],
              linkedTasks: event.linkedTasks || [],
            })
            migratedCounts.events++
          } catch (err) {
            console.warn('Failed to migrate event:', event.title, err)
          }
        }
      } catch (error) {
        console.error('Error parsing calendar data:', error)
      }
    }

    // Migrate Tasks
    if (tasksData) {
      try {
        const parsed = JSON.parse(tasksData)
        const tasks = parsed.state?.tasks || []

        for (const task of tasks) {
          try {
            await db.createTask(userId, {
              title: task.title,
              description: task.description,
              status: task.status,
              priority: task.priority,
              dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
              scheduledAt: task.scheduledAt,
              companyId: task.companyId,
              companyNameSnapshot: task.companyNameSnapshot,
              eventId: task.eventId,
              eventTitleSnapshot: task.eventTitleSnapshot,
              category: task.category,
            })
            migratedCounts.tasks++
          } catch (err) {
            console.warn('Failed to migrate task:', task.title, err)
          }
        }
      } catch (error) {
        console.error('Error parsing tasks data:', error)
      }
    }

    // Migrate Goals
    if (goalsData) {
      try {
        const parsed = JSON.parse(goalsData)
        const goals = parsed.state?.goals || []

        for (const goal of goals) {
          try {
            await db.upsertGoal(userId, {
              id: goal.id,
              date: goal.date,
              items: goal.items || [],
              reflection: goal.reflection,
              createdAt: new Date(goal.createdAt),
              updatedAt: new Date(goal.updatedAt),
            })
            migratedCounts.goals++
          } catch (err) {
            console.warn('Failed to migrate goal:', goal.date, err)
          }
        }
      } catch (error) {
        console.error('Error parsing goals data:', error)
      }
    }

    // Mark migration as complete
    await db.markMigrationComplete(userId, migratedCounts)

    console.log('Migration completed:', migratedCounts)
    return true
  } catch (error) {
    console.error('Migration failed:', error)
    return false
  }
}

export function clearLocalStorageData() {
  localStorage.removeItem('creators-os-companies')
  localStorage.removeItem('creators-os-calendar')
  localStorage.removeItem('creators-os-tasks')
  localStorage.removeItem('creators-os-goals')
  console.log('localStorage data cleared')
}
