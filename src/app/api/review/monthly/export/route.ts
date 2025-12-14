/**
 * Monthly Review Export API
 * POST - Generate downloadable report
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { computeMonthlyReview } from '@/lib/review/computeMonthlyReview'

const MONTHS_HEBREW = [
  'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
]

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'לא מאומת' }, { status: 401 })
    }

    const body = await request.json()
    const { month, year, format = 'json' } = body

    if (month === undefined || year === undefined) {
      return NextResponse.json({ error: 'חסרים חודש ושנה' }, { status: 400 })
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()

    // Fetch data
    const [tasksRes, eventsRes, goalsRes] = await Promise.all([
      supabase.from('tasks').select('*').eq('user_id', user.id),
      supabase.from('events').select('*').eq('user_id', user.id),
      supabase.from('daily_goals').select('*').eq('user_id', user.id),
    ])

    const tasks = (tasksRes.data || []).map((t: any) => ({
      id: t.id,
      userId: t.user_id,
      title: t.title,
      status: t.status,
      priority: t.priority,
      dueDate: t.due_date ? new Date(t.due_date) : undefined,
      archived: t.archived,
      createdAt: t.created_at ? new Date(t.created_at) : undefined,
      updatedAt: t.updated_at ? new Date(t.updated_at) : undefined,
    }))

    const events = (eventsRes.data || []).map((e: any) => ({
      id: e.id,
      userId: e.user_id,
      title: e.title,
      date: e.date,
      category: e.category,
      startTime: e.start_time,
      endTime: e.end_time,
      createdAt: e.created_at ? new Date(e.created_at) : undefined,
    }))

    const goals = (goalsRes.data || []).map((g: any) => ({
      id: g.id,
      date: g.date,
      items: g.items || [],
      createdAt: g.created_at ? new Date(g.created_at) : undefined,
      updatedAt: g.updated_at ? new Date(g.updated_at) : undefined,
    }))

    // Compute review
    const review = computeMonthlyReview({
      tasks,
      events,
      goals,
      month,
      year,
    })

    // Build export payload
    const exportData = {
      title: `סיכום חודשי - ${MONTHS_HEBREW[month]} ${year}`,
      generatedAt: new Date().toISOString(),
      ownerName: profile?.full_name || 'יוצר',
      month: MONTHS_HEBREW[month],
      year,
      stats: {
        tasksCompleted: review.stats.tasksCompleted,
        tasksCreated: review.stats.tasksCreated,
        taskCompletionRate: review.stats.taskCompletionRate,
        eventsCount: review.stats.eventsAttended,
        goalsAchieved: review.stats.goalsAchieved,
        goalsTotal: review.stats.goalsTotal,
        averageDailyLoad: review.stats.averageDailyLoad,
        totalEventsHours: review.stats.totalEventsHours,
      },
      insights: review.insights.map(i => ({
        icon: i.icon,
        title: i.title,
        description: i.description || '',
      })),
      weeklyBreakdown: review.weeklyBreakdown,
      priorityDistribution: review.priorityDistribution,
      topCategories: review.topCategories,
    }

    if (format === 'json') {
      return new NextResponse(JSON.stringify(exportData, null, 2), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="monthly-review-${year}-${String(month + 1).padStart(2, '0')}.json"`,
        },
      })
    }

    // For other formats (PDF would require additional processing)
    return NextResponse.json({ export: exportData })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'שגיאת שרת' }, { status: 500 })
  }
}
