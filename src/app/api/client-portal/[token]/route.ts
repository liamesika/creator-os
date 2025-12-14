/**
 * Client Portal Public API
 * GET - Get public portal payload (no auth required)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { PortalPublicPayload } from '@/types/client-portal'

interface RouteParams {
  params: Promise<{ token: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { token } = await params
    const supabase = await createClient()

    // Get portal by token
    const { data: portal } = await supabase
      .from('client_portals')
      .select(`
        id,
        creator_user_id,
        company_id,
        is_enabled,
        brand_name,
        brand_color,
        company:companies(id, name)
      `)
      .eq('token', token)
      .single()

    if (!portal) {
      return NextResponse.json({ error: 'פורטל לא נמצא' }, { status: 404 })
    }

    if (!portal.is_enabled) {
      return NextResponse.json({ error: 'פורטל לא פעיל' }, { status: 403 })
    }

    // Supabase returns single relation as object, but handle array case too
    const companyData = portal.company as unknown
    const company = Array.isArray(companyData) ? companyData[0] : companyData as { id: string; name: string } | null

    // Get current month
    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    // Get deliverables for current month
    const { data: deliverables } = await supabase
      .from('deliverables')
      .select('title, quantity, completed_quantity, status')
      .eq('company_id', portal.company_id)
      .eq('month', currentMonth)
      .order('created_at', { ascending: true })

    // Get approvals (pending and recent)
    const { data: approvals } = await supabase
      .from('approval_items')
      .select(`
        id,
        title,
        type,
        status,
        due_on
      `)
      .eq('company_id', portal.company_id)
      .in('status', ['pending', 'changes_requested', 'approved'])
      .order('created_at', { ascending: false })
      .limit(20)

    // Get comments count for each approval
    const approvalIds = (approvals || []).map(a => a.id)
    let commentsCounts: Record<string, number> = {}

    if (approvalIds.length > 0) {
      const { data: comments } = await supabase
        .from('approval_comments')
        .select('approval_item_id')
        .in('approval_item_id', approvalIds)

      if (comments) {
        comments.forEach(c => {
          commentsCounts[c.approval_item_id] = (commentsCounts[c.approval_item_id] || 0) + 1
        })
      }
    }

    // Get upcoming events (next 7 days)
    const today = now.toISOString().split('T')[0]
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    const { data: upcomingEvents } = await supabase
      .from('events')
      .select('title, date, start_time')
      .eq('company_id', portal.company_id)
      .gte('date', today)
      .lte('date', nextWeek)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true })
      .limit(10)

    const payload: PortalPublicPayload = {
      companyName: company?.name || 'Company',
      brandName: portal.brand_name || undefined,
      brandColor: portal.brand_color || undefined,
      deliverables: (deliverables || []).map(d => ({
        title: d.title,
        quantity: d.quantity,
        completedQuantity: d.completed_quantity,
        status: d.status,
      })),
      approvals: (approvals || []).map(a => ({
        id: a.id,
        title: a.title,
        type: a.type,
        status: a.status,
        dueOn: a.due_on || undefined,
        commentsCount: commentsCounts[a.id] || 0,
      })),
      upcomingEvents: (upcomingEvents || []).map(e => ({
        title: e.title,
        date: e.date,
        startTime: e.start_time || undefined,
      })),
      month: currentMonth,
    }

    return NextResponse.json({ portal: payload })
  } catch (error) {
    console.error('Portal public API error:', error)
    return NextResponse.json({ error: 'שגיאת שרת' }, { status: 500 })
  }
}
