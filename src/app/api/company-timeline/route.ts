/**
 * Company Timeline API
 * GET - List timeline items for a company
 * POST - Create timeline item
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { TimelineItem, CreateTimelineItemPayload } from '@/types/timeline'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'לא מאומת' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')
    const creatorId = searchParams.get('creatorId')
    const type = searchParams.get('type')
    const month = searchParams.get('month') // YYYY-MM

    let query = supabase
      .from('company_timeline_items')
      .select('*')
      .order('occurred_on', { ascending: false })

    if (companyId) {
      query = query.eq('company_id', companyId)
    }

    if (creatorId) {
      query = query.eq('creator_user_id', creatorId)
    }

    if (type) {
      query = query.eq('type', type)
    }

    if (month) {
      const [year, monthNum] = month.split('-').map(Number)
      const startDate = new Date(year, monthNum - 1, 1).toISOString().split('T')[0]
      const endDate = new Date(year, monthNum, 0).toISOString().split('T')[0]
      query = query.gte('occurred_on', startDate).lte('occurred_on', endDate)
    }

    const { data: items, error } = await query

    if (error) {
      console.error('Error fetching timeline items:', error)
      return NextResponse.json({ error: 'שגיאה בטעינת ציר הזמן' }, { status: 500 })
    }

    const transformedItems: TimelineItem[] = (items || []).map((item: any) => ({
      id: item.id,
      creatorUserId: item.creator_user_id,
      companyId: item.company_id,
      type: item.type,
      title: item.title,
      details: item.details,
      eventId: item.event_id,
      taskId: item.task_id,
      amount: item.amount,
      occurredOn: new Date(item.occurred_on),
      createdAt: new Date(item.created_at),
    }))

    return NextResponse.json({ items: transformedItems })
  } catch (error) {
    console.error('Timeline GET error:', error)
    return NextResponse.json({ error: 'שגיאת שרת' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'לא מאומת' }, { status: 401 })
    }

    const body: CreateTimelineItemPayload = await request.json()
    const { companyId, type, title, details, eventId, taskId, amount, occurredOn } = body

    if (!companyId || !type || !title || !occurredOn) {
      return NextResponse.json({ error: 'חסרים שדות חובה' }, { status: 400 })
    }

    // Get user profile to determine creator ID
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('account_type')
      .eq('id', user.id)
      .single()

    const isAgency = profile?.account_type === 'agency'

    // Verify company access
    const { data: company } = await supabase
      .from('companies')
      .select('user_id')
      .eq('id', companyId)
      .single()

    if (!company) {
      return NextResponse.json({ error: 'חברה לא נמצאה' }, { status: 404 })
    }

    let creatorUserId = company.user_id

    // If agency, verify they manage this creator
    if (isAgency && company.user_id !== user.id) {
      const { data: relationship } = await supabase
        .from('agency_creator_relationships')
        .select('id')
        .eq('agency_user_id', user.id)
        .eq('creator_user_id', company.user_id)
        .eq('status', 'active')
        .single()

      if (!relationship) {
        return NextResponse.json({ error: 'אין הרשאה לחברה זו' }, { status: 403 })
      }
    } else if (!isAgency && company.user_id !== user.id) {
      return NextResponse.json({ error: 'אין הרשאה' }, { status: 403 })
    }

    // Create timeline item
    const { data: item, error: insertError } = await supabase
      .from('company_timeline_items')
      .insert({
        creator_user_id: creatorUserId,
        company_id: companyId,
        type,
        title,
        details,
        event_id: eventId,
        task_id: taskId,
        amount,
        occurred_on: occurredOn,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating timeline item:', insertError)
      return NextResponse.json({ error: 'שגיאה ביצירת פריט בציר הזמן' }, { status: 500 })
    }

    const transformed: TimelineItem = {
      id: item.id,
      creatorUserId: item.creator_user_id,
      companyId: item.company_id,
      type: item.type,
      title: item.title,
      details: item.details,
      eventId: item.event_id,
      taskId: item.task_id,
      amount: item.amount,
      occurredOn: new Date(item.occurred_on),
      createdAt: new Date(item.created_at),
    }

    return NextResponse.json({ item: transformed }, { status: 201 })
  } catch (error) {
    console.error('Timeline POST error:', error)
    return NextResponse.json({ error: 'שגיאת שרת' }, { status: 500 })
  }
}
