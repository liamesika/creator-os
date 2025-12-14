/**
 * Deliverables API
 * GET - List deliverables for a company/month
 * POST - Create a new deliverable
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Deliverable, CreateDeliverablePayload } from '@/types/client-portal'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'לא מחובר' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')
    const month = searchParams.get('month')
    const creatorId = searchParams.get('creatorId')

    if (!companyId) {
      return NextResponse.json({ error: 'חסר מזהה חברה' }, { status: 400 })
    }

    // Build query
    let query = supabase
      .from('deliverables')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })

    // Filter by creator - either current user or agency's creator
    if (creatorId) {
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

    if (month) {
      query = query.eq('month', month)
    }

    const { data: items, error } = await query

    if (error) {
      console.error('Deliverables fetch error:', error)
      return NextResponse.json({ error: 'שגיאה בטעינת deliverables' }, { status: 500 })
    }

    const deliverables: Deliverable[] = (items || []).map((item: Record<string, unknown>) => ({
      id: item.id as string,
      creatorUserId: item.creator_user_id as string,
      companyId: item.company_id as string,
      month: item.month as string,
      title: item.title as string,
      quantity: item.quantity as number,
      completedQuantity: item.completed_quantity as number,
      status: item.status as Deliverable['status'],
      linkedApprovalItemId: item.linked_approval_item_id as string | null,
      createdAt: item.created_at as string,
      updatedAt: item.updated_at as string,
    }))

    return NextResponse.json({ deliverables })
  } catch (error) {
    console.error('Deliverables API error:', error)
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

    const body: CreateDeliverablePayload = await request.json()
    const { companyId, month, title, quantity, status, linkedApprovalItemId } = body

    if (!companyId || !month || !title) {
      return NextResponse.json({ error: 'חסרים פרטים' }, { status: 400 })
    }

    // Validate month format
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json({ error: 'פורמט חודש לא תקין (YYYY-MM)' }, { status: 400 })
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

    // Check for unique constraint (title + month + company)
    const { data: existing } = await supabase
      .from('deliverables')
      .select('id')
      .eq('company_id', companyId)
      .eq('month', month)
      .eq('title', title)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'deliverable עם שם זה כבר קיים לחודש זה' }, { status: 409 })
    }

    const { data: newItem, error } = await supabase
      .from('deliverables')
      .insert({
        creator_user_id: creatorUserId,
        company_id: companyId,
        month,
        title,
        quantity: quantity || 1,
        completed_quantity: 0,
        status: status || 'planned',
        linked_approval_item_id: linkedApprovalItemId || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Create deliverable error:', error)
      return NextResponse.json({ error: 'שגיאה ביצירת deliverable' }, { status: 500 })
    }

    return NextResponse.json({
      deliverable: {
        id: newItem.id,
        creatorUserId: newItem.creator_user_id,
        companyId: newItem.company_id,
        month: newItem.month,
        title: newItem.title,
        quantity: newItem.quantity,
        completedQuantity: newItem.completed_quantity,
        status: newItem.status,
        linkedApprovalItemId: newItem.linked_approval_item_id,
        createdAt: newItem.created_at,
        updatedAt: newItem.updated_at,
      },
    })
  } catch (error) {
    console.error('Deliverables POST error:', error)
    return NextResponse.json({ error: 'שגיאת שרת' }, { status: 500 })
  }
}
