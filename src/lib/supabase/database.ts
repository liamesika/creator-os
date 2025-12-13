import { createClient } from './client'
import type { Company } from '@/types/company'
import type { CalendarEvent } from '@/types/calendar'
import type { Task } from '@/types/task'
import type { DailyGoal } from '@/types/goal'
import type { AIGeneratedContent, AIGenerationInput } from '@/types/ai-content'
import type { ActivityEvent, ActivityType } from '@/types/activity'
import type { WeeklyReview } from '@/types/weekly-review'

export class DatabaseService {
  private supabase = createClient()

  // Companies
  async getCompanies(userId: string) {
    const { data, error } = await this.supabase
      .from('companies')
      .select('*')
      .eq('owner_uid', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return this.mapCompaniesFromDB(data || [])
  }

  async createCompany(userId: string, company: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await this.supabase
      .from('companies')
      .insert({
        owner_uid: userId,
        name: company.name,
        brand_type: company.brandType,
        contact_name: company.contactName,
        contact_email: company.contactEmail,
        contact_phone: company.contactPhone,
        notes: company.notes,
        contract: company.contract,
        payment_terms: company.paymentTerms,
        status: company.status,
      })
      .select()
      .single()

    if (error) throw error
    return this.mapCompanyFromDB(data)
  }

  async updateCompany(id: string, updates: Partial<Company>) {
    const { data, error } = await this.supabase
      .from('companies')
      .update({
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
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return this.mapCompanyFromDB(data)
  }

  async deleteCompany(id: string) {
    const { error } = await this.supabase.from('companies').delete().eq('id', id)
    if (error) throw error
  }

  // Calendar Events
  async getCalendarEvents(userId: string) {
    const { data, error } = await this.supabase
      .from('calendar_events')
      .select(`
        *,
        calendar_reminders (*),
        calendar_linked_tasks (*)
      `)
      .eq('owner_uid', userId)
      .order('date', { ascending: true })

    if (error) throw error
    return this.mapEventsFromDB(data || [])
  }

  async createCalendarEvent(
    userId: string,
    event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>
  ) {
    const { data: eventData, error: eventError } = await this.supabase
      .from('calendar_events')
      .insert({
        owner_uid: userId,
        category: event.category,
        title: event.title,
        date: event.date.toISOString(),
        start_time: event.startTime,
        end_time: event.endTime,
        is_all_day: event.isAllDay,
        notes: event.notes,
        company_id: event.companyId,
        company_name_snapshot: event.companyNameSnapshot,
      })
      .select()
      .single()

    if (eventError) throw eventError

    // Insert reminders
    if (event.reminders.length > 0) {
      await this.supabase.from('calendar_reminders').insert(
        event.reminders.map((r) => ({
          event_id: eventData.id,
          minutes_before: r.minutesBefore,
          is_custom: r.isCustom,
        }))
      )
    }

    // Insert linked tasks
    if (event.linkedTasks.length > 0) {
      await this.supabase.from('calendar_linked_tasks').insert(
        event.linkedTasks.map((t) => ({
          event_id: eventData.id,
          title: t.title,
          completed: t.completed,
        }))
      )
    }

    return this.mapEventFromDB(eventData)
  }

  async updateCalendarEvent(id: string, updates: Partial<CalendarEvent>) {
    const updateData: any = {}
    if (updates.category !== undefined) updateData.category = updates.category
    if (updates.title !== undefined) updateData.title = updates.title
    if (updates.date !== undefined) updateData.date = updates.date.toISOString()
    if (updates.startTime !== undefined) updateData.start_time = updates.startTime
    if (updates.endTime !== undefined) updateData.end_time = updates.endTime
    if (updates.isAllDay !== undefined) updateData.is_all_day = updates.isAllDay
    if (updates.notes !== undefined) updateData.notes = updates.notes
    if (updates.companyId !== undefined) updateData.company_id = updates.companyId
    if (updates.companyNameSnapshot !== undefined)
      updateData.company_name_snapshot = updates.companyNameSnapshot

    const { data, error } = await this.supabase
      .from('calendar_events')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return this.mapEventFromDB(data)
  }

  async deleteCalendarEvent(id: string) {
    const { error } = await this.supabase.from('calendar_events').delete().eq('id', id)
    if (error) throw error
  }

  async toggleEventTaskCompletion(eventId: string, taskId: string) {
    // Get current task
    const { data: task } = await this.supabase
      .from('calendar_linked_tasks')
      .select('completed')
      .eq('id', taskId)
      .eq('event_id', eventId)
      .single()

    if (!task) return

    // Toggle
    const { error } = await this.supabase
      .from('calendar_linked_tasks')
      .update({ completed: !task.completed })
      .eq('id', taskId)

    if (error) throw error
  }

  // Tasks
  async getTasks(userId: string) {
    const { data, error } = await this.supabase
      .from('tasks')
      .select('*')
      .eq('owner_uid', userId)
      .eq('archived', false)
      .order('created_at', { ascending: false })

    if (error) throw error
    return this.mapTasksFromDB(data || [])
  }

  async createTask(userId: string, task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'archived'>) {
    const { data, error } = await this.supabase
      .from('tasks')
      .insert({
        owner_uid: userId,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        due_date: task.dueDate?.toISOString(),
        scheduled_at: task.scheduledAt,
        company_id: task.companyId,
        company_name_snapshot: task.companyNameSnapshot,
        event_id: task.eventId,
        event_title_snapshot: task.eventTitleSnapshot,
        category: task.category,
        archived: false,
      })
      .select()
      .single()

    if (error) throw error
    return this.mapTaskFromDB(data)
  }

  async updateTask(id: string, updates: Partial<Task>) {
    const updateData: any = {}
    if (updates.title !== undefined) updateData.title = updates.title
    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.status !== undefined) updateData.status = updates.status
    if (updates.priority !== undefined) updateData.priority = updates.priority
    if (updates.dueDate !== undefined)
      updateData.due_date = updates.dueDate?.toISOString()
    if (updates.scheduledAt !== undefined) updateData.scheduled_at = updates.scheduledAt
    if (updates.companyId !== undefined) updateData.company_id = updates.companyId
    if (updates.companyNameSnapshot !== undefined)
      updateData.company_name_snapshot = updates.companyNameSnapshot
    if (updates.eventId !== undefined) updateData.event_id = updates.eventId
    if (updates.eventTitleSnapshot !== undefined)
      updateData.event_title_snapshot = updates.eventTitleSnapshot
    if (updates.category !== undefined) updateData.category = updates.category
    if (updates.archived !== undefined) updateData.archived = updates.archived

    const { data, error } = await this.supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return this.mapTaskFromDB(data)
  }

  async deleteTask(id: string) {
    const { error } = await this.supabase.from('tasks').delete().eq('id', id)
    if (error) throw error
  }

  // Goals
  async getGoals(userId: string) {
    const { data, error } = await this.supabase
      .from('goals')
      .select('*')
      .eq('owner_uid', userId)
      .order('date', { ascending: false })

    if (error) throw error
    return this.mapGoalsFromDB(data || [])
  }

  async upsertGoal(userId: string, goal: Omit<DailyGoal, 'createdAt' | 'updatedAt'> | DailyGoal) {
    const { data, error } = await this.supabase
      .from('goals')
      .upsert(
        {
          id: goal.id,
          owner_uid: userId,
          date: goal.date,
          items: goal.items,
          reflection: goal.reflection || {},
        },
        { onConflict: 'owner_uid,date' }
      )
      .select()
      .single()

    if (error) throw error
    return this.mapGoalFromDB(data)
  }

  async deleteGoal(id: string) {
    const { error} = await this.supabase.from('goals').delete().eq('id', id)
    if (error) throw error
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
      contract: data.contract,
      paymentTerms: data.payment_terms,
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
    const { data, error } = await this.supabase
      .from('ai_generations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return this.mapAIGenerationsFromDB(data || [])
  }

  async generateAIContent(userId: string, input: AIGenerationInput) {
    // Mock AI generation for now
    const mockOutput = this.generateMockContent(input)

    const { data, error } = await this.supabase
      .from('ai_generations')
      .insert({
        user_id: userId,
        template_id: input.templateId,
        input_data: input,
        output: mockOutput,
      })
      .select()
      .single()

    if (error) throw error
    return this.mapAIGenerationFromDB(data)
  }

  async updateAIGeneration(id: string, updates: { output: string }) {
    const { data, error } = await this.supabase
      .from('ai_generations')
      .update({ output: updates.output })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return this.mapAIGenerationFromDB(data)
  }

  async deleteAIGeneration(id: string) {
    const { error } = await this.supabase.from('ai_generations').delete().eq('id', id)
    if (error) throw error
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
    const { data, error } = await this.supabase
      .from('activity_events')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return this.mapActivityEventsFromDB(data || [])
  }

  async createActivityEvent(
    userId: string,
    type: ActivityType,
    entityId?: string,
    entityName?: string,
    metadata?: Record<string, any>
  ) {
    const { data, error } = await this.supabase
      .from('activity_events')
      .insert({
        user_id: userId,
        type,
        entity_id: entityId,
        entity_name: entityName,
        metadata,
      })
      .select()
      .single()

    if (error) throw error
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
    const { data, error } = await this.supabase
      .from('weekly_reviews')
      .select('*')
      .eq('user_id', userId)
      .order('week_start_date', { ascending: false })
      .limit(limit)

    if (error) throw error
    return this.mapWeeklyReviewsFromDB(data || [])
  }

  async getWeeklyReview(userId: string, weekStartDate: string) {
    const { data, error } = await this.supabase
      .from('weekly_reviews')
      .select('*')
      .eq('user_id', userId)
      .eq('week_start_date', weekStartDate)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data ? this.mapWeeklyReviewFromDB(data) : null
  }

  async upsertWeeklyReview(
    userId: string,
    review: Omit<WeeklyReview, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ) {
    const { data, error } = await this.supabase
      .from('weekly_reviews')
      .upsert({
        user_id: userId,
        week_start_date: review.weekStartDate,
        stats: review.stats,
        what_worked: review.reflection.whatWorked,
        improve_next: review.reflection.improveNext,
      })
      .select()
      .single()

    if (error) throw error
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
}

export const db = new DatabaseService()
