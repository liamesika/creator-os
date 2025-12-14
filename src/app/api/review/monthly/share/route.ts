/**
 * Monthly Review Share API
 * POST - Create share token and return URL
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { computeMonthlyReview } from '@/lib/review/computeMonthlyReview'
import { generateShareToken } from '@/types/shared-reports'

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
    const { month, year, expiresInDays } = body

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

    // Build share payload
    const payload = {
      title: `סיכום חודשי - ${MONTHS_HEBREW[month]} ${year}`,
      subtitle: 'Creators OS',
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
      },
      insights: review.insights.slice(0, 3).map(i => ({
        icon: i.icon,
        title: i.title,
        description: i.description || '',
      })),
      highlights: [
        {
          label: 'משימות שהושלמו',
          value: review.stats.tasksCompleted,
          icon: '✅',
        },
        {
          label: 'אירועים',
          value: review.stats.eventsAttended,
          icon: '📅',
        },
        {
          label: 'שיעור השלמה',
          value: `${review.stats.taskCompletionRate}%`,
          icon: '📊',
        },
      ],
    }

    // Generate token
    const token = generateShareToken()

    // Calculate expiry
    let expiresAt = null
    if (expiresInDays) {
      const expiry = new Date()
      expiry.setDate(expiry.getDate() + expiresInDays)
      expiresAt = expiry.toISOString()
    }

    // Store in database (using service role via RPC or direct insert)
    // For now, we'll store it directly - in production use service role
    const { error: insertError } = await supabase
      .from('shared_reports')
      .insert({
        token,
        owner_user_id: user.id,
        scope: 'monthly_review',
        payload,
        expires_at: expiresAt,
      })

    if (insertError) {
      console.error('Error creating share:', insertError)
      return NextResponse.json({ error: 'שגיאה ביצירת הקישור' }, { status: 500 })
    }

    // Build share URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://creators-os.com'
    const shareUrl = `${baseUrl}/shared/${token}`

    return NextResponse.json({
      success: true,
      token,
      shareUrl,
      expiresAt,
    })
  } catch (error) {
    console.error('Share error:', error)
    return NextResponse.json({ error: 'שגיאת שרת' }, { status: 500 })
  }
}
