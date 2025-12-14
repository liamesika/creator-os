/**
 * Apply Template API
 * POST - Apply template to creator, creating events/tasks/goals
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { ApplyTemplatePayload, ApplyTemplateResult } from '@/types/templates'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'לא מאומת' }, { status: 401 })
    }

    const body: ApplyTemplatePayload = await request.json()
    const { templateId, targetCreatorUserId, startDate } = body

    if (!templateId || !targetCreatorUserId || !startDate) {
      return NextResponse.json({ error: 'חסרים פרטים נדרשים' }, { status: 400 })
    }

    // Get user profile to check permissions
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('account_type')
      .eq('id', user.id)
      .single()

    const isAgency = profile?.account_type === 'agency'

    // If agency, verify they manage the target creator
    if (isAgency && targetCreatorUserId !== user.id) {
      const { data: relationship } = await supabase
        .from('agency_creator_relationships')
        .select('id')
        .eq('agency_user_id', user.id)
        .eq('creator_user_id', targetCreatorUserId)
        .eq('status', 'active')
        .single()

      if (!relationship) {
        return NextResponse.json({ error: 'אין הרשאה ליצור עבור יוצר זה' }, { status: 403 })
      }
    } else if (!isAgency && targetCreatorUserId !== user.id) {
      // Creators can only apply to themselves
      return NextResponse.json({ error: 'אין הרשאה' }, { status: 403 })
    }

    // Fetch template with items
    const { data: template, error: templateError } = await supabase
      .from('templates')
      .select(`
        *,
        items:template_items(*)
      `)
      .eq('id', templateId)
      .single()

    if (templateError || !template) {
      return NextResponse.json({ error: 'תבנית לא נמצאה' }, { status: 404 })
    }

    // Check template access
    if (template.owner_user_id !== user.id && !template.is_public) {
      return NextResponse.json({ error: 'אין הרשאה לתבנית זו' }, { status: 403 })
    }

    // Parse start date
    const baseDate = new Date(startDate)

    // Track created items
    const createdEventIds: string[] = []
    const createdTaskIds: string[] = []
    const createdGoalIds: string[] = []

    // Process each template item
    for (const item of template.items || []) {
      const itemDate = new Date(baseDate)
      itemDate.setDate(itemDate.getDate() + (item.day_offset || 0))
      const dateStr = itemDate.toISOString().split('T')[0]

      if (item.item_type === 'event') {
        // Create event
        const eventData: any = {
          user_id: targetCreatorUserId,
          title: item.title,
          date: dateStr,
          notes: item.notes,
          category: item.event_category || 'other',
        }

        if (item.time_of_day) {
          eventData.start_time = item.time_of_day
          if (item.duration_minutes) {
            // Calculate end time
            const [hours, minutes] = item.time_of_day.split(':').map(Number)
            const endMinutes = hours * 60 + minutes + item.duration_minutes
            const endHours = Math.floor(endMinutes / 60) % 24
            const endMins = endMinutes % 60
            eventData.end_time = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}:00`
          }
        }

        const { data: event, error: eventError } = await supabase
          .from('events')
          .insert(eventData)
          .select('id')
          .single()

        if (!eventError && event) {
          createdEventIds.push(event.id)
        }
      } else if (item.item_type === 'task') {
        // Create task
        const { data: task, error: taskError } = await supabase
          .from('tasks')
          .insert({
            user_id: targetCreatorUserId,
            title: item.title,
            notes: item.notes,
            due_date: dateStr,
            priority: item.priority || 'MEDIUM',
            status: 'NOT_STARTED',
          })
          .select('id')
          .single()

        if (!taskError && task) {
          createdTaskIds.push(task.id)
        }
      } else if (item.item_type === 'goal') {
        // Create goal
        const { data: goal, error: goalError } = await supabase
          .from('goals')
          .insert({
            user_id: targetCreatorUserId,
            title: item.title,
            description: item.notes,
            target_date: dateStr,
            status: 'in_progress',
          })
          .select('id')
          .single()

        if (!goalError && goal) {
          createdGoalIds.push(goal.id)
        }
      }
    }

    // Record the application
    const { data: application, error: applicationError } = await supabase
      .from('template_applications')
      .insert({
        template_id: templateId,
        applied_by_user_id: user.id,
        target_creator_user_id: targetCreatorUserId,
        start_date: startDate,
        created_event_ids: createdEventIds,
        created_task_ids: createdTaskIds,
        created_goal_ids: createdGoalIds,
      })
      .select('id')
      .single()

    if (applicationError) {
      console.error('Error recording template application:', applicationError)
      // Items were created, just couldn't record application
    }

    const result: ApplyTemplateResult = {
      success: true,
      applicationId: application?.id || '',
      summary: {
        eventsCreated: createdEventIds.length,
        tasksCreated: createdTaskIds.length,
        goalsCreated: createdGoalIds.length,
      },
      createdEventIds,
      createdTaskIds,
      createdGoalIds,
    }

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Apply template error:', error)
    return NextResponse.json({ error: 'שגיאת שרת' }, { status: 500 })
  }
}
