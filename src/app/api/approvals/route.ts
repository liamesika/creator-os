/**
 * Approvals API
 * GET - List all approval items for the current user (or agency creators)
 * POST - Create a new approval item
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { ApprovalItem, CreateApprovalPayload } from '@/types/client-portal'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'לא מחובר' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')
    const status = searchParams.get('status')
    const creatorId = searchParams.get('creatorId') // For agency filtering

    // Build query
    let query = supabase
      .from('approval_items')
      .select(`
        *,
        companies:company_id (name),
        approval_comments (id)
      `)
      .order('created_at', { ascending: false })

    // Filter by creator - either current user or agency's creator
    if (creatorId) {
      // Check if user is agency owner of this creator
      const { data: agencyRelation } = await supabase
        .from('agency_creators')
        .select('id')
        .eq('agency_user_id', user.id)
        .eq('creator_user_id', creatorId)
        .single()

      if (!agencyRelation) {
        return NextResponse.json({ error: 'אין הרשאה' }, { status: 403 })
      }
      query = query.eq('creator_user_id', creatorId)
    } else {
      query = query.eq('creator_user_id', user.id)
    }

    if (companyId) {
      query = query.eq('company_id', companyId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data: items, error } = await query

    if (error) {
      console.error('Approvals fetch error:', error)
      return NextResponse.json({ error: 'שגיאה בטעינת אישורים' }, { status: 500 })
    }

    // Transform to include company name and comments count
    const approvals: ApprovalItem[] = (items || []).map((item: Record<string, unknown>) => ({
      id: item.id as string,
      creatorUserId: item.creator_user_id as string,
      companyId: item.company_id as string,
      relatedEventId: item.related_event_id as string | null,
      relatedTaskId: item.related_task_id as string | null,
      title: item.title as string,
      type: item.type as ApprovalItem['type'],
      status: item.status as ApprovalItem['status'],
      dueOn: item.due_on as string | null,
      assetUrl: item.asset_url as string | null,
      notes: item.notes as string | null,
      createdAt: item.created_at as string,
      updatedAt: item.updated_at as string,
      companyName: (item.companies as { name: string } | null)?.name,
      commentsCount: Array.isArray(item.approval_comments) ? item.approval_comments.length : 0,
    }))

    return NextResponse.json({ approvals })
  } catch (error) {
    console.error('Approvals API error:', error)
    return NextResponse.json({ error: 'שגיאת שרת' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'לא מחובר' }, { status: 401 })
    }

    const body: CreateApprovalPayload = await request.json()
    const { companyId, title, type, status, dueOn, assetUrl, notes, relatedEventId, relatedTaskId } = body

    if (!companyId || !title || !type) {
      return NextResponse.json({ error: 'חסרים פרטים' }, { status: 400 })
    }

    // Verify user owns the company or is agency
    const { data: company } = await supabase
      .from('companies')
      .select('id, creator_user_id')
      .eq('id', companyId)
      .single()

    if (!company) {
      return NextResponse.json({ error: 'חברה לא נמצאה' }, { status: 404 })
    }

    // Check ownership or agency relationship
    let creatorUserId = user.id
    if (company.creator_user_id !== user.id) {
      const { data: agencyRelation } = await supabase
        .from('agency_creators')
        .select('creator_user_id')
        .eq('agency_user_id', user.id)
        .eq('creator_user_id', company.creator_user_id)
        .single()

      if (!agencyRelation) {
        return NextResponse.json({ error: 'אין הרשאה' }, { status: 403 })
      }
      creatorUserId = agencyRelation.creator_user_id
    }

    const { data: newItem, error } = await supabase
      .from('approval_items')
      .insert({
        creator_user_id: creatorUserId,
        company_id: companyId,
        title,
        type,
        status: status || 'draft',
        due_on: dueOn || null,
        asset_url: assetUrl || null,
        notes: notes || null,
        related_event_id: relatedEventId || null,
        related_task_id: relatedTaskId || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Create approval error:', error)
      return NextResponse.json({ error: 'שגיאה ביצירת פריט אישור' }, { status: 500 })
    }

    return NextResponse.json({
      approval: {
        id: newItem.id,
        creatorUserId: newItem.creator_user_id,
        companyId: newItem.company_id,
        title: newItem.title,
        type: newItem.type,
        status: newItem.status,
        dueOn: newItem.due_on,
        assetUrl: newItem.asset_url,
        notes: newItem.notes,
        createdAt: newItem.created_at,
        updatedAt: newItem.updated_at,
      },
    })
  } catch (error) {
    console.error('Approvals POST error:', error)
    return NextResponse.json({ error: 'שגיאת שרת' }, { status: 500 })
  }
}
