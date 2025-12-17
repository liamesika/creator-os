import { createClient } from './client'
import type { Company } from '@/types/company'
import type { CalendarEvent } from '@/types/calendar'
import type { Task } from '@/types/task'
import type { DailyGoal } from '@/types/goal'
import type { AIGeneratedContent, AIGenerationInput } from '@/types/ai-content'
import type { ActivityEvent, ActivityType } from '@/types/activity'
import type { WeeklyReview } from '@/types/weekly-review'
import type {
  AgencyMembership,
  EarningsEntry,
  AgencyCreatorStats,
  AgencyDashboardStats,
  CreatorDetailData,
} from '@/types/agency'

/**
 * Validates that userId is a valid UUID string
 * Prevents queries with undefined/null/empty user IDs
 */
function validateUserId(userId: string | null | undefined): string {
  if (!userId || typeof userId !== 'string' || userId.trim() === '') {
    throw new Error('Invalid user ID: User must be authenticated')
  }
  // Basic UUID format check
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(userId)) {
    throw new Error('Invalid user ID format')
  }
  return userId
}

/**
 * Validates required string field
 */
function validateRequired(value: any, fieldName: string): string {
  if (!value || typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${fieldName} is required`)
  }
  return value.trim()
}

/**
 * Cleans an object by removing undefined values
 * Supabase doesn't accept undefined, so we convert to null or omit
 */
function cleanPayload<T extends Record<string, any>>(obj: T): Partial<T> {
  const cleaned: Partial<T> = {}
  for (const key in obj) {
    if (obj[key] !== undefined) {
      cleaned[key] = obj[key]
    }
  }
  return cleaned
}

export class DatabaseService {
  private supabase = createClient()

  // Companies
  async getCompanies(userId: string) {
    const validUserId = validateUserId(userId)

    const { data, error } = await this.supabase
      .from('companies')
      .select('*')
      .eq('owner_uid', validUserId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('getCompanies error:', error)
      throw new Error(`Failed to load companies: ${error.message}`)
    }
    return this.mapCompaniesFromDB(data || [])
  }

  async createCompany(userId: string, company: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) {
    const validUserId = validateUserId(userId)
    const name = validateRequired(company.name, 'Company name')

    const payload = cleanPayload({
      owner_uid: validUserId,
      name,
      brand_type: company.brandType || null,
      contact_name: company.contactName || null,
      contact_email: company.contactEmail || null,
      contact_phone: company.contactPhone || null,
      notes: company.notes || null,
      contract: company.contract || {},
      payment_terms: company.paymentTerms || {},
      status: company.status || 'ACTIVE',
    })

    const { data, error } = await this.supabase
      .from('companies')
      .insert(payload)
      .select()
      .single()

    if (error) {
      console.error('createCompany error:', error)
      throw new Error(`Failed to create company: ${error.message}`)
    }
    if (!data) {
      throw new Error('Company created but no data returned')
    }
    return this.mapCompanyFromDB(data)
  }

  async updateCompany(id: string, updates: Partial<Company>) {
    if (!id) throw new Error('Company ID is required')

    const payload = cleanPayload({
      name: updates.name,
      brand_type: updates.brandType,
      contact_name: updates.contactName,
      contact_email: updates.contactEmail,
      contact_phone: updates.contactPhone,
      notes: updates.notes,
      contract: updates.contract,
      payment_terms: updates.paymentTerms,
      status: updates.status,
    })

    const { data, error } = await this.supabase
      .from('companies')
      .update(payload)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('updateCompany error:', error)
      throw new Error(`Failed to update company: ${error.message}`)
    }
    return this.mapCompanyFromDB(data)
  }

  async deleteCompany(id: string) {
    if (!id) throw new Error('Company ID is required')

    const { error } = await this.supabase.from('companies').delete().eq('id', id)
    if (error) {
      console.error('deleteCompany error:', error)
      throw new Error(`Failed to delete company: ${error.message}`)
    }
  }

  // Calendar Events
  async getCalendarEvents(userId: string) {
    const validUserId = validateUserId(userId)

    const { data, error } = await this.supabase
      .from('calendar_events')
      .select(`
        *,
        calendar_reminders (*),
        calendar_linked_tasks (*)
      `)
      .eq('owner_uid', validUserId)
      .order('date', { ascending: true })

    if (error) {
      console.error('getCalendarEvents error:', error)
      throw new Error(`Failed to load events: ${error.message}`)
    }
    return this.mapEventsFromDB(data || [])
  }

  async createCalendarEvent(
    userId: string,
    event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>
  ) {
    const validUserId = validateUserId(userId)
    const title = validateRequired(event.title, 'Event title')
    const category = validateRequired(event.category, 'Event category')

    // Build base payload without optional snapshot field
    const basePayload = cleanPayload({
      owner_uid: validUserId,
      category,
      title,
      date: event.date instanceof Date ? event.date.toISOString() : event.date,
      start_time: event.startTime || null,
      end_time: event.endTime || null,
      is_all_day: event.isAllDay || false,
      notes: event.notes || null,
      company_id: event.companyId || null,
    })

    // Try with company_name_snapshot first, fallback without it if column missing
    let payload: Record<string, any> = {
      ...basePayload,
      company_name_snapshot: event.companyNameSnapshot || null,
    }

    let { data: eventData, error: eventError } = await this.supabase
      .from('calendar_events')
      .insert(payload)
      .select()
      .single()

    // If error mentions missing column, retry without the snapshot field
    if (eventError && eventError.message?.includes('company_name_snapshot')) {
      const { data: retryData, error: retryError } = await this.supabase
        .from('calendar_events')
        .insert(basePayload)
        .select()
        .single()

      eventData = retryData
      eventError = retryError
    }

    if (eventError) {
      console.error('createCalendarEvent error:', eventError)
      throw new Error(`Failed to create event: ${eventError.message}`)
    }
    if (!eventData) {
      throw new Error('Event created but no data returned')
    }

    // Insert reminders if any
    if (event.reminders && event.reminders.length > 0) {
      const reminderPayloads = event.reminders.map((r) => ({
        event_id: eventData.id,
        minutes_before: r.minutesBefore,
        is_custom: r.isCustom || false,
      }))

      const { error: reminderError } = await this.supabase
        .from('calendar_reminders')
        .insert(reminderPayloads)

      if (reminderError) {
        console.warn('Failed to create reminders:', reminderError)
      }
    }

    // Insert linked tasks if any
    if (event.linkedTasks && event.linkedTasks.length > 0) {
      const taskPayloads = event.linkedTasks.map((t) => ({
        event_id: eventData.id,
        title: t.title,
        completed: t.completed || false,
      }))

      const { error: taskError } = await this.supabase
        .from('calendar_linked_tasks')
        .insert(taskPayloads)

      if (taskError) {
        console.warn('Failed to create linked tasks:', taskError)
      }
    }

    return this.mapEventFromDB(eventData)
  }

  async updateCalendarEvent(id: string, updates: Partial<CalendarEvent>) {
    if (!id) throw new Error('Event ID is required')

    // Build base payload without optional snapshot field
    const basePayload: Record<string, any> = {}
    if (updates.category !== undefined) basePayload.category = updates.category
    if (updates.title !== undefined) basePayload.title = updates.title
    if (updates.date !== undefined) {
      basePayload.date = updates.date instanceof Date ? updates.date.toISOString() : updates.date
    }
    if (updates.startTime !== undefined) basePayload.start_time = updates.startTime
    if (updates.endTime !== undefined) basePayload.end_time = updates.endTime
    if (updates.isAllDay !== undefined) basePayload.is_all_day = updates.isAllDay
    if (updates.notes !== undefined) basePayload.notes = updates.notes
    if (updates.companyId !== undefined) basePayload.company_id = updates.companyId

    // Add snapshot field to full payload
    const payload = { ...basePayload }
    if (updates.companyNameSnapshot !== undefined) payload.company_name_snapshot = updates.companyNameSnapshot

    let { data, error } = await this.supabase
      .from('calendar_events')
      .update(payload)
      .eq('id', id)
      .select()
      .single()

    // If error mentions missing column, retry without the snapshot field
    if (error && error.message?.includes('company_name_snapshot')) {
      const { data: retryData, error: retryError } = await this.supabase
        .from('calendar_events')
        .update(basePayload)
        .eq('id', id)
        .select()
        .single()

      data = retryData
      error = retryError
    }

    if (error) {
      console.error('updateCalendarEvent error:', error)
      throw new Error(`Failed to update event: ${error.message}`)
    }
    return this.mapEventFromDB(data)
  }

  async deleteCalendarEvent(id: string) {
    if (!id) throw new Error('Event ID is required')

    const { error } = await this.supabase.from('calendar_events').delete().eq('id', id)
    if (error) {
      console.error('deleteCalendarEvent error:', error)
      throw new Error(`Failed to delete event: ${error.message}`)
    }
  }

  async toggleEventTaskCompletion(eventId: string, taskId: string) {
    if (!eventId || !taskId) throw new Error('Event ID and Task ID are required')

    const { data: task } = await this.supabase
      .from('calendar_linked_tasks')
      .select('completed')
      .eq('id', taskId)
      .eq('event_id', eventId)
      .single()

    if (!task) return

    const { error } = await this.supabase
      .from('calendar_linked_tasks')
      .update({ completed: !task.completed })
      .eq('id', taskId)

    if (error) {
      console.error('toggleEventTaskCompletion error:', error)
      throw new Error(`Failed to toggle task: ${error.message}`)
    }
  }

  // Tasks
  async getTasks(userId: string) {
    const validUserId = validateUserId(userId)

    const { data, error } = await this.supabase
      .from('tasks')
      .select('*')
      .eq('owner_uid', validUserId)
      .eq('archived', false)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('getTasks error:', error)
      throw new Error(`Failed to load tasks: ${error.message}`)
    }
    return this.mapTasksFromDB(data || [])
  }

  async createTask(userId: string, task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'archived'>) {
    const validUserId = validateUserId(userId)
    const title = validateRequired(task.title, 'Task title')

    // Build base payload without optional snapshot fields
    const basePayload = cleanPayload({
      owner_uid: validUserId,
      title,
      description: task.description || null,
      status: task.status || 'TODO',
      priority: task.priority || 'MEDIUM',
      due_date: task.dueDate instanceof Date ? task.dueDate.toISOString() : task.dueDate || null,
      scheduled_at: task.scheduledAt || null,
      company_id: task.companyId || null,
      event_id: task.eventId || null,
      category: task.category || null,
      archived: false,
    })

    // Try with snapshot fields first
    const payload: Record<string, any> = {
      ...basePayload,
      company_name_snapshot: task.companyNameSnapshot || null,
      event_title_snapshot: task.eventTitleSnapshot || null,
    }

    let { data, error } = await this.supabase
      .from('tasks')
      .insert(payload)
      .select()
      .single()

    // If error mentions missing column, retry without snapshot fields
    if (error && (error.message?.includes('company_name_snapshot') || error.message?.includes('event_title_snapshot'))) {
      const { data: retryData, error: retryError } = await this.supabase
        .from('tasks')
        .insert(basePayload)
        .select()
        .single()

      data = retryData
      error = retryError
    }

    if (error) {
      console.error('createTask error:', error)
      throw new Error(`Failed to create task: ${error.message}`)
    }
    if (!data) {
      throw new Error('Task created but no data returned')
    }
    return this.mapTaskFromDB(data)
  }

  async updateTask(id: string, updates: Partial<Task>) {
    if (!id) throw new Error('Task ID is required')

    // Build base payload without optional snapshot fields
    const basePayload: Record<string, any> = {}
    if (updates.title !== undefined) basePayload.title = updates.title
    if (updates.description !== undefined) basePayload.description = updates.description
    if (updates.status !== undefined) basePayload.status = updates.status
    if (updates.priority !== undefined) basePayload.priority = updates.priority
    if (updates.dueDate !== undefined) {
      basePayload.due_date = updates.dueDate instanceof Date ? updates.dueDate.toISOString() : updates.dueDate
    }
    if (updates.scheduledAt !== undefined) basePayload.scheduled_at = updates.scheduledAt
    if (updates.companyId !== undefined) basePayload.company_id = updates.companyId
    if (updates.eventId !== undefined) basePayload.event_id = updates.eventId
    if (updates.category !== undefined) basePayload.category = updates.category
    if (updates.archived !== undefined) basePayload.archived = updates.archived

    // Add snapshot fields to full payload
    const payload = { ...basePayload }
    if (updates.companyNameSnapshot !== undefined) payload.company_name_snapshot = updates.companyNameSnapshot
    if (updates.eventTitleSnapshot !== undefined) payload.event_title_snapshot = updates.eventTitleSnapshot

    let { data, error } = await this.supabase
      .from('tasks')
      .update(payload)
      .eq('id', id)
      .select()
      .single()

    // If error mentions missing column, retry without snapshot fields
    if (error && (error.message?.includes('company_name_snapshot') || error.message?.includes('event_title_snapshot'))) {
      const { data: retryData, error: retryError } = await this.supabase
        .from('tasks')
        .update(basePayload)
        .eq('id', id)
        .select()
        .single()

      data = retryData
      error = retryError
    }

    if (error) {
      console.error('updateTask error:', error)
      throw new Error(`Failed to update task: ${error.message}`)
    }
    return this.mapTaskFromDB(data)
  }

  async deleteTask(id: string) {
    if (!id) throw new Error('Task ID is required')

    const { error } = await this.supabase.from('tasks').delete().eq('id', id)
    if (error) {
      console.error('deleteTask error:', error)
      throw new Error(`Failed to delete task: ${error.message}`)
    }
  }

  // Goals
  async getGoals(userId: string) {
    const validUserId = validateUserId(userId)

    const { data, error } = await this.supabase
      .from('goals')
      .select('*')
      .eq('owner_uid', validUserId)
      .order('date', { ascending: false })

    if (error) {
      console.error('getGoals error:', error)
      throw new Error(`Failed to load goals: ${error.message}`)
    }
    return this.mapGoalsFromDB(data || [])
  }

  async upsertGoal(userId: string, goal: Omit<DailyGoal, 'createdAt' | 'updatedAt'> | DailyGoal) {
    const validUserId = validateUserId(userId)
    if (!goal.date) throw new Error('Goal date is required')

    const payload = cleanPayload({
      id: goal.id || undefined,
      owner_uid: validUserId,
      date: goal.date,
      items: goal.items || [],
      reflection: goal.reflection || {},
    })

    const { data, error } = await this.supabase
      .from('goals')
      .upsert(payload, { onConflict: 'owner_uid,date' })
      .select()
      .single()

    if (error) {
      console.error('upsertGoal error:', error)
      throw new Error(`Failed to save goal: ${error.message}`)
    }
    return this.mapGoalFromDB(data)
  }

  async deleteGoal(id: string) {
    if (!id) throw new Error('Goal ID is required')

    const { error } = await this.supabase.from('goals').delete().eq('id', id)
    if (error) {
      console.error('deleteGoal error:', error)
      throw new Error(`Failed to delete goal: ${error.message}`)
    }
  }

  // Check migration status - gracefully handles missing table/column
  // This is non-blocking and never throws - returns false on any error
  async checkMigrationStatus(userId: string): Promise<boolean> {
    try {
      const validUserId = validateUserId(userId)

      const { data, error } = await this.supabase
        .from('migration_status')
        .select('owner_uid')
        .eq('owner_uid', validUserId)
        .maybeSingle() // Use maybeSingle to avoid error when not found

      // Any error (including missing table/column) - silently return false
      if (error) {
        // Don't log errors to avoid console spam
        return false
      }

      return !!data
    } catch {
      // Silently handle any exception
      return false
    }
  }

  async markMigrationComplete(userId: string, migrationData: any): Promise<void> {
    try {
      const validUserId = validateUserId(userId)

      await this.supabase.from('migration_status').insert({
        owner_uid: validUserId,
        migration_data: migrationData,
      })
    } catch (error) {
      console.warn('Failed to mark migration complete:', error)
      // Don't throw - migration status is not critical
    }
  }

  // Mapping helpers
  private mapCompaniesFromDB(data: any[]): Company[] {
    return data.map(this.mapCompanyFromDB)
  }

  private mapCompanyFromDB(data: any): Company {
    return {
      id: data.id,
      name: data.name,
      brandType: data.brand_type,
      contactName: data.contact_name,
      contactEmail: data.contact_email,
      contactPhone: data.contact_phone,
      notes: data.notes,
      contract: data.contract || {},
      paymentTerms: data.payment_terms || {},
      status: data.status,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    }
  }

  private mapEventsFromDB(data: any[]): CalendarEvent[] {
    return data.map(this.mapEventFromDB)
  }

  private mapEventFromDB(data: any): CalendarEvent {
    return {
      id: data.id,
      category: data.category,
      title: data.title,
      date: new Date(data.date),
      startTime: data.start_time,
      endTime: data.end_time,
      isAllDay: data.is_all_day,
      notes: data.notes,
      companyId: data.company_id,
      companyNameSnapshot: data.company_name_snapshot,
      reminders: (data.calendar_reminders || []).map((r: any) => ({
        id: r.id,
        minutesBefore: r.minutes_before,
        isCustom: r.is_custom,
      })),
      linkedTasks: (data.calendar_linked_tasks || []).map((t: any) => ({
        id: t.id,
        title: t.title,
        completed: t.completed,
        createdAt: new Date(t.created_at),
      })),
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    }
  }

  private mapTasksFromDB(data: any[]): Task[] {
    return data.map(this.mapTaskFromDB)
  }

  private mapTaskFromDB(data: any): Task {
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      dueDate: data.due_date ? new Date(data.due_date) : undefined,
      scheduledAt: data.scheduled_at,
      companyId: data.company_id,
      companyNameSnapshot: data.company_name_snapshot,
      eventId: data.event_id,
      eventTitleSnapshot: data.event_title_snapshot,
      category: data.category,
      archived: data.archived,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    }
  }

  private mapGoalsFromDB(data: any[]): DailyGoal[] {
    return data.map(this.mapGoalFromDB)
  }

  private mapGoalFromDB(data: any): DailyGoal {
    return {
      id: data.id,
      date: data.date,
      items: data.items || [],
      reflection: data.reflection,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    }
  }

  // AI Content
  async getAIGenerations(userId: string) {
    const validUserId = validateUserId(userId)

    const { data, error } = await this.supabase
      .from('ai_generations')
      .select('*')
      .eq('user_id', validUserId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('getAIGenerations error:', error)
      throw new Error(`Failed to load AI generations: ${error.message}`)
    }
    return this.mapAIGenerationsFromDB(data || [])
  }

  async generateAIContent(userId: string, input: AIGenerationInput) {
    const validUserId = validateUserId(userId)

    const mockOutput = this.generateMockContent(input)

    const { data, error } = await this.supabase
      .from('ai_generations')
      .insert({
        user_id: validUserId,
        template_id: input.templateId,
        input_data: input,
        output: mockOutput,
      })
      .select()
      .single()

    if (error) {
      console.error('generateAIContent error:', error)
      throw new Error(`Failed to generate content: ${error.message}`)
    }
    return this.mapAIGenerationFromDB(data)
  }

  async updateAIGeneration(id: string, updates: { output: string }) {
    if (!id) throw new Error('Generation ID is required')

    const { data, error } = await this.supabase
      .from('ai_generations')
      .update({ output: updates.output })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('updateAIGeneration error:', error)
      throw new Error(`Failed to update generation: ${error.message}`)
    }
    return this.mapAIGenerationFromDB(data)
  }

  async deleteAIGeneration(id: string) {
    if (!id) throw new Error('Generation ID is required')

    const { error } = await this.supabase.from('ai_generations').delete().eq('id', id)
    if (error) {
      console.error('deleteAIGeneration error:', error)
      throw new Error(`Failed to delete generation: ${error.message}`)
    }
  }

  private generateMockContent(input: AIGenerationInput): string {
    const { templateId, topic, tone } = input

    const templates: Record<string, string> = {
      'sales-story': `🎯 ${topic}\n\n✨ מוכנים לשינוי?\n\nזה בדיוק מה שאתם צריכים עכשיו.\n\n👉 לחצו על הלינק בביו`,
      'personal-story': `💭 ${topic}\n\nרגע של אמת:\nזה שינה לי את כל המשחק.\n\nואני רוצה לשתף אתכם איך.`,
      'before-after-reel': `Hook: "לפני שנה הייתי...\n\n[${topic}]\n\nהיום? הכל השתנה.\n\nואני אספר לכם בדיוק איך עשיתי את זה 👇"`,
      'tiktok-hook': `Hook #1: "רגע, אני חייבת לספר לכם על ${topic}..."\n\nHook #2: "אם עוד לא שמעתם על ${topic}, תשבו"\n\nHook #3: "הדבר הזה ש-${topic} עשה לי? אין על זה"`,
      'cta-variations': `1. "לחצו על הלינק בביו עכשיו ↗️"\n2. "שמרו את הפוסט הזה למאוחר יותר 🔖"\n3. "שלחו למישהו שצריך את זה 💌"\n4. "תגובו 'כן' ואני אשלח לכם את הפרטים"\n5. "עקבו לעוד תכנים כאלה 🎯"`,
    }

    return templates[templateId] || `תוכן מותאם אישית על ${topic} בסגנון ${tone}`
  }

  private mapAIGenerationsFromDB(data: any[]): AIGeneratedContent[] {
    return data.map(this.mapAIGenerationFromDB)
  }

  private mapAIGenerationFromDB(data: any): AIGeneratedContent {
    return {
      id: data.id,
      userId: data.user_id,
      templateId: data.template_id,
      input: data.input_data,
      output: data.output,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    }
  }

  // Activity Events
  async getActivityEvents(userId: string, limit = 50) {
    const validUserId = validateUserId(userId)

    const { data, error } = await this.supabase
      .from('activity_events')
      .select('*')
      .eq('user_id', validUserId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('getActivityEvents error:', error)
      throw new Error(`Failed to load activity: ${error.message}`)
    }
    return this.mapActivityEventsFromDB(data || [])
  }

  async createActivityEvent(
    userId: string,
    type: ActivityType,
    entityId?: string,
    entityName?: string,
    metadata?: Record<string, any>
  ) {
    const validUserId = validateUserId(userId)

    const { data, error } = await this.supabase
      .from('activity_events')
      .insert({
        user_id: validUserId,
        type,
        entity_id: entityId || null,
        entity_name: entityName || null,
        metadata: metadata || null,
      })
      .select()
      .single()

    if (error) {
      console.error('createActivityEvent error:', error)
      throw new Error(`Failed to log activity: ${error.message}`)
    }
    return this.mapActivityEventFromDB(data)
  }

  private mapActivityEventsFromDB(data: any[]): ActivityEvent[] {
    return data.map(this.mapActivityEventFromDB)
  }

  private mapActivityEventFromDB(data: any): ActivityEvent {
    return {
      id: data.id,
      userId: data.user_id,
      type: data.type,
      entityId: data.entity_id,
      entityName: data.entity_name,
      metadata: data.metadata,
      createdAt: new Date(data.created_at),
    }
  }

  // Weekly Reviews
  async getWeeklyReviews(userId: string, limit = 10) {
    const validUserId = validateUserId(userId)

    const { data, error } = await this.supabase
      .from('weekly_reviews')
      .select('*')
      .eq('user_id', validUserId)
      .order('week_start_date', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('getWeeklyReviews error:', error)
      throw new Error(`Failed to load weekly reviews: ${error.message}`)
    }
    return this.mapWeeklyReviewsFromDB(data || [])
  }

  async getWeeklyReview(userId: string, weekStartDate: string) {
    const validUserId = validateUserId(userId)

    const { data, error } = await this.supabase
      .from('weekly_reviews')
      .select('*')
      .eq('user_id', validUserId)
      .eq('week_start_date', weekStartDate)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('getWeeklyReview error:', error)
      throw new Error(`Failed to load weekly review: ${error.message}`)
    }
    return data ? this.mapWeeklyReviewFromDB(data) : null
  }

  async upsertWeeklyReview(
    userId: string,
    review: Omit<WeeklyReview, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ) {
    const validUserId = validateUserId(userId)

    const { data, error } = await this.supabase
      .from('weekly_reviews')
      .upsert({
        user_id: validUserId,
        week_start_date: review.weekStartDate,
        stats: review.stats,
        what_worked: review.reflection.whatWorked || null,
        improve_next: review.reflection.improveNext || null,
      })
      .select()
      .single()

    if (error) {
      console.error('upsertWeeklyReview error:', error)
      throw new Error(`Failed to save weekly review: ${error.message}`)
    }
    return this.mapWeeklyReviewFromDB(data)
  }

  private mapWeeklyReviewsFromDB(data: any[]): WeeklyReview[] {
    return data.map(this.mapWeeklyReviewFromDB)
  }

  private mapWeeklyReviewFromDB(data: any): WeeklyReview {
    return {
      id: data.id,
      userId: data.user_id,
      weekStartDate: data.week_start_date,
      stats: data.stats,
      reflection: {
        whatWorked: data.what_worked,
        improveNext: data.improve_next,
      },
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    }
  }

  // Agency Methods

  async getAgencyDashboardStats(agencyId: string): Promise<AgencyDashboardStats> {
    const validAgencyId = validateUserId(agencyId)

    const { data: creatorStats, error: statsError } = await this.supabase
      .from('agency_creator_stats')
      .select('*')
      .eq('agency_id', validAgencyId)

    if (statsError) {
      console.error('getAgencyDashboardStats error:', statsError)
      throw new Error(`Failed to load agency stats: ${statsError.message}`)
    }

    const creators = (creatorStats || []).map(this.mapCreatorStatsFromDB)

    const totalMonthlyEarnings = creators.reduce((sum, c) => sum + c.monthlyEarnings, 0)
    const totalYearlyEarnings = creators.reduce((sum, c) => sum + c.yearlyEarnings, 0)
    const totalActiveCompanies = creators.reduce((sum, c) => sum + c.activeCompanyCount, 0)

    return {
      totalMonthlyEarnings,
      totalYearlyEarnings,
      totalCreators: creators.length,
      totalActiveCompanies,
      creators,
    }
  }

  async getAgencyMembers(agencyId: string): Promise<AgencyMembership[]> {
    const validAgencyId = validateUserId(agencyId)

    const { data, error } = await this.supabase
      .from('agency_memberships')
      .select('*')
      .eq('agency_id', validAgencyId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('getAgencyMembers error:', error)
      throw new Error(`Failed to load agency members: ${error.message}`)
    }
    return (data || []).map(this.mapMembershipFromDB)
  }

  async getActiveMembersCount(agencyId: string): Promise<number> {
    const validAgencyId = validateUserId(agencyId)

    const { count, error } = await this.supabase
      .from('agency_memberships')
      .select('*', { count: 'exact', head: true })
      .eq('agency_id', validAgencyId)
      .eq('status', 'active')

    if (error) {
      console.error('getActiveMembersCount error:', error)
      throw new Error(`Failed to count members: ${error.message}`)
    }
    return count || 0
  }

  async inviteCreatorToAgency(
    agencyId: string,
    email: string
  ): Promise<AgencyMembership> {
    const validAgencyId = validateUserId(agencyId)
    if (!email || !email.includes('@')) throw new Error('Valid email is required')

    const { data: existingUser } = await this.supabase
      .from('user_profiles')
      .select('id')
      .eq('email', email)
      .single()

    const insertData: any = {
      agency_id: validAgencyId,
      role: 'creator',
      status: existingUser ? 'active' : 'invited',
    }

    if (existingUser) {
      insertData.creator_user_id = existingUser.id
    } else {
      insertData.invite_email = email
    }

    const { data, error } = await this.supabase
      .from('agency_memberships')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('inviteCreatorToAgency error:', error)
      throw new Error(`Failed to invite creator: ${error.message}`)
    }
    return this.mapMembershipFromDB(data)
  }

  async removeCreatorFromAgency(membershipId: string): Promise<void> {
    if (!membershipId) throw new Error('Membership ID is required')

    const { error } = await this.supabase
      .from('agency_memberships')
      .update({ status: 'removed' })
      .eq('id', membershipId)

    if (error) {
      console.error('removeCreatorFromAgency error:', error)
      throw new Error(`Failed to remove creator: ${error.message}`)
    }
  }

  async deleteMembership(membershipId: string): Promise<void> {
    if (!membershipId) throw new Error('Membership ID is required')

    const { error } = await this.supabase
      .from('agency_memberships')
      .delete()
      .eq('id', membershipId)

    if (error) {
      console.error('deleteMembership error:', error)
      throw new Error(`Failed to delete membership: ${error.message}`)
    }
  }

  async getCreatorEarnings(
    creatorId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<EarningsEntry[]> {
    const validCreatorId = validateUserId(creatorId)

    let query = this.supabase
      .from('earnings_entries')
      .select(`
        *,
        companies:company_id (name)
      `)
      .eq('creator_user_id', validCreatorId)
      .order('earned_on', { ascending: false })

    if (startDate) {
      query = query.gte('earned_on', startDate.toISOString().split('T')[0])
    }
    if (endDate) {
      query = query.lte('earned_on', endDate.toISOString().split('T')[0])
    }

    const { data, error } = await query

    if (error) {
      console.error('getCreatorEarnings error:', error)
      throw new Error(`Failed to load earnings: ${error.message}`)
    }
    return (data || []).map(this.mapEarningsFromDB)
  }

  async createEarningsEntry(
    creatorId: string,
    entry: Omit<EarningsEntry, 'id' | 'createdAt' | 'updatedAt' | 'creatorUserId'>,
    createdBy?: string
  ): Promise<EarningsEntry> {
    const validCreatorId = validateUserId(creatorId)
    if (!entry.amount || entry.amount < 0) throw new Error('Valid amount is required')

    const { data, error } = await this.supabase
      .from('earnings_entries')
      .insert({
        creator_user_id: validCreatorId,
        company_id: entry.companyId || null,
        amount: entry.amount,
        currency: entry.currency || 'ILS',
        earned_on: entry.earnedOn instanceof Date
          ? entry.earnedOn.toISOString().split('T')[0]
          : entry.earnedOn,
        notes: entry.notes || null,
        created_by: createdBy || null,
      })
      .select(`
        *,
        companies:company_id (name)
      `)
      .single()

    if (error) {
      console.error('createEarningsEntry error:', error)
      throw new Error(`Failed to create earnings entry: ${error.message}`)
    }
    return this.mapEarningsFromDB(data)
  }

  async updateEarningsEntry(
    entryId: string,
    updates: Partial<Omit<EarningsEntry, 'id' | 'createdAt' | 'updatedAt' | 'creatorUserId'>>
  ): Promise<EarningsEntry> {
    if (!entryId) throw new Error('Entry ID is required')

    const payload: Record<string, any> = {}
    if (updates.companyId !== undefined) payload.company_id = updates.companyId
    if (updates.amount !== undefined) payload.amount = updates.amount
    if (updates.currency !== undefined) payload.currency = updates.currency
    if (updates.earnedOn !== undefined) {
      payload.earned_on = updates.earnedOn instanceof Date
        ? updates.earnedOn.toISOString().split('T')[0]
        : updates.earnedOn
    }
    if (updates.notes !== undefined) payload.notes = updates.notes

    const { data, error } = await this.supabase
      .from('earnings_entries')
      .update(payload)
      .eq('id', entryId)
      .select(`
        *,
        companies:company_id (name)
      `)
      .single()

    if (error) {
      console.error('updateEarningsEntry error:', error)
      throw new Error(`Failed to update earnings entry: ${error.message}`)
    }
    return this.mapEarningsFromDB(data)
  }

  async deleteEarningsEntry(entryId: string): Promise<void> {
    if (!entryId) throw new Error('Entry ID is required')

    const { error } = await this.supabase
      .from('earnings_entries')
      .delete()
      .eq('id', entryId)

    if (error) {
      console.error('deleteEarningsEntry error:', error)
      throw new Error(`Failed to delete earnings entry: ${error.message}`)
    }
  }

  async getCreatorDetailForAgency(
    agencyId: string,
    creatorId: string
  ): Promise<CreatorDetailData | null> {
    const validAgencyId = validateUserId(agencyId)
    const validCreatorId = validateUserId(creatorId)

    const { data: membership } = await this.supabase
      .from('agency_memberships')
      .select('*')
      .eq('agency_id', validAgencyId)
      .eq('creator_user_id', validCreatorId)
      .eq('status', 'active')
      .single()

    if (!membership) return null

    const { data: creatorProfile } = await this.supabase
      .from('user_profiles')
      .select('id, name, email')
      .eq('id', validCreatorId)
      .single()

    if (!creatorProfile) return null

    const { data: companies } = await this.supabase
      .from('companies')
      .select('id, name, brand_type, status, payment_terms')
      .eq('owner_uid', validCreatorId)

    const { data: earnings } = await this.supabase
      .from('earnings_entries')
      .select(`
        *,
        companies:company_id (name)
      `)
      .eq('creator_user_id', validCreatorId)
      .order('earned_on', { ascending: false })
      .limit(100)

    const { data: activity } = await this.supabase
      .from('activity_events')
      .select('id, type, entity_name, created_at')
      .eq('user_id', validCreatorId)
      .order('created_at', { ascending: false })
      .limit(20)

    const earningsData = (earnings || []).map(this.mapEarningsFromDB)
    const monthlyBreakdown = this.calculateMonthlyBreakdown(earningsData)

    return {
      creator: {
        id: creatorProfile.id,
        name: creatorProfile.name || '',
        email: creatorProfile.email || '',
      },
      companies: (companies || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        brandType: c.brand_type,
        status: c.status,
        monthlyRetainer: c.payment_terms?.monthlyRetainerAmount,
        currency: c.payment_terms?.currency,
      })),
      earnings: earningsData,
      monthlyEarningsBreakdown: monthlyBreakdown,
      recentActivity: (activity || []).map((a: any) => ({
        id: a.id,
        type: a.type,
        entityName: a.entity_name,
        createdAt: new Date(a.created_at),
      })),
    }
  }

  async getCreatorCompanies(creatorId: string): Promise<Company[]> {
    const validCreatorId = validateUserId(creatorId)

    const { data, error } = await this.supabase
      .from('companies')
      .select('*')
      .eq('owner_uid', validCreatorId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('getCreatorCompanies error:', error)
      throw new Error(`Failed to load companies: ${error.message}`)
    }
    return this.mapCompaniesFromDB(data || [])
  }

  async getCreatorCalendarEvents(creatorId: string): Promise<CalendarEvent[]> {
    const validCreatorId = validateUserId(creatorId)

    const { data, error } = await this.supabase
      .from('calendar_events')
      .select(`
        *,
        calendar_reminders (*),
        calendar_linked_tasks (*)
      `)
      .eq('owner_uid', validCreatorId)
      .order('date', { ascending: true })

    if (error) {
      console.error('getCreatorCalendarEvents error:', error)
      throw new Error(`Failed to load events: ${error.message}`)
    }
    return this.mapEventsFromDB(data || [])
  }

  async getCreatorTasks(creatorId: string): Promise<Task[]> {
    const validCreatorId = validateUserId(creatorId)

    const { data, error } = await this.supabase
      .from('tasks')
      .select('*')
      .eq('owner_uid', validCreatorId)
      .eq('archived', false)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('getCreatorTasks error:', error)
      throw new Error(`Failed to load tasks: ${error.message}`)
    }
    return this.mapTasksFromDB(data || [])
  }

  private calculateMonthlyBreakdown(earnings: EarningsEntry[]) {
    const breakdown: Map<string, {
      month: string
      total: number
      byCompany: Map<string, { companyId: string; companyName: string; amount: number }>
    }> = new Map()

    for (const entry of earnings) {
      const date = new Date(entry.earnedOn)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

      if (!breakdown.has(monthKey)) {
        breakdown.set(monthKey, {
          month: monthKey,
          total: 0,
          byCompany: new Map(),
        })
      }

      const monthData = breakdown.get(monthKey)!
      monthData.total += entry.amount

      if (entry.companyId) {
        const companyKey = entry.companyId
        if (!monthData.byCompany.has(companyKey)) {
          monthData.byCompany.set(companyKey, {
            companyId: entry.companyId,
            companyName: entry.companyName || 'לא ידוע',
            amount: 0,
          })
        }
        monthData.byCompany.get(companyKey)!.amount += entry.amount
      }
    }

    return Array.from(breakdown.values())
      .sort((a, b) => b.month.localeCompare(a.month))
      .map((m) => ({
        month: m.month,
        total: m.total,
        byCompany: Array.from(m.byCompany.values()),
      }))
  }

  private mapCreatorStatsFromDB(data: any): AgencyCreatorStats {
    return {
      agencyId: data.agency_id,
      creatorUserId: data.creator_user_id,
      creatorName: data.creator_name || '',
      creatorEmail: data.creator_email || '',
      companyCount: data.company_count || 0,
      monthlyEarnings: parseFloat(data.monthly_earnings) || 0,
      yearlyEarnings: parseFloat(data.yearly_earnings) || 0,
      activeCompanyCount: data.active_company_count || 0,
    }
  }

  private mapMembershipFromDB(data: any): AgencyMembership {
    return {
      id: data.id,
      agencyId: data.agency_id,
      creatorUserId: data.creator_user_id,
      inviteEmail: data.invite_email,
      role: data.role,
      status: data.status,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    }
  }

  private mapEarningsFromDB(data: any): EarningsEntry {
    return {
      id: data.id,
      creatorUserId: data.creator_user_id,
      companyId: data.company_id,
      companyName: data.companies?.name,
      amount: parseFloat(data.amount) || 0,
      currency: data.currency,
      earnedOn: new Date(data.earned_on),
      notes: data.notes,
      createdBy: data.created_by,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    }
  }
}

export const db = new DatabaseService()
