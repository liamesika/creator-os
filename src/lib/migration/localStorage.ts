import { db } from '@/lib/supabase/database'
import { createClient } from '@/lib/supabase/client'

export async function migrateLocalStorageToSupabase(userId: string): Promise<boolean> {
  try {
    const supabase = createClient()

    // Check if already migrated
    const { data: migrationStatus } = await supabase
      .from('migration_status')
      .select('*')
      .eq('owner_uid', userId)
      .single()

    if (migrationStatus) {
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
        }
      } catch (error) {
        console.error('Error migrating companies:', error)
      }
    }

    // Migrate Calendar Events
    if (calendarData) {
      try {
        const parsed = JSON.parse(calendarData)
        const events = parsed.state?.events || []

        for (const event of events) {
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
        }
      } catch (error) {
        console.error('Error migrating calendar events:', error)
      }
    }

    // Migrate Tasks
    if (tasksData) {
      try {
        const parsed = JSON.parse(tasksData)
        const tasks = parsed.state?.tasks || []

        for (const task of tasks) {
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
        }
      } catch (error) {
        console.error('Error migrating tasks:', error)
      }
    }

    // Migrate Goals
    if (goalsData) {
      try {
        const parsed = JSON.parse(goalsData)
        const goals = parsed.state?.goals || []

        for (const goal of goals) {
          await db.upsertGoal(userId, {
            id: goal.id,
            date: goal.date,
            items: goal.items || [],
            reflection: goal.reflection,
            createdAt: new Date(goal.createdAt),
            updatedAt: new Date(goal.updatedAt),
          })
          migratedCounts.goals++
        }
      } catch (error) {
        console.error('Error migrating goals:', error)
      }
    }

    // Mark migration as complete
    await supabase.from('migration_status').insert({
      owner_uid: userId,
      migration_data: migratedCounts,
    })

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
