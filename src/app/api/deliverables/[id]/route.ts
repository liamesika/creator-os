/**
 * Single Deliverable API
 * PUT - Update deliverable
 * DELETE - Delete deliverable
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'לא מחובר' }, { status: 401 })
    }

    const body = await request.json()
    const { title, quantity, completedQuantity, status, linkedApprovalItemId } = body

    // Verify ownership
    const { data: item } = await supabase
      .from('deliverables')
      .select('id, creator_user_id, company_id, month')
      .eq('id', id)
      .single()

    if (!item) {
      return NextResponse.json({ error: 'deliverable לא נמצא' }, { status: 404 })
    }

    // Check access
    if (item.creator_user_id !== user.id) {
      const { data: agencyRelation } = await supabase
        .from('agency_creators')
        .select('id')
        .eq('agency_user_id', user.id)
        .eq('creator_user_id', item.creator_user_id)
        .single()

      if (!agencyRelation) {
        return NextResponse.json({ error: 'אין הרשאה' }, { status: 403 })
      }
    }

    // Build update object
    const updateData: Record<string, unknown> = {}
    if (title !== undefined) {
      // Check uniqueness if title is changing
      const { data: existing } = await supabase
        .from('deliverables')
        .select('id')
        .eq('company_id', item.company_id)
        .eq('month', item.month)
        .eq('title', title)
        .neq('id', id)
        .single()

      if (existing) {
        return NextResponse.json({ error: 'deliverable עם שם זה כבר קיים לחודש זה' }, { status: 409 })
      }
      updateData.title = title
    }
    if (quantity !== undefined) updateData.quantity = quantity
    if (completedQuantity !== undefined) updateData.completed_quantity = completedQuantity
    if (status !== undefined) updateData.status = status
    if (linkedApprovalItemId !== undefined) updateData.linked_approval_item_id = linkedApprovalItemId

    const { data: updated, error } = await supabase
      .from('deliverables')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Update deliverable error:', error)
      return NextResponse.json({ error: 'שגיאה בעדכון deliverable' }, { status: 500 })
    }

    return NextResponse.json({
      deliverable: {
        id: updated.id,
        creatorUserId: updated.creator_user_id,
        companyId: updated.company_id,
        month: updated.month,
        title: updated.title,
        quantity: updated.quantity,
        completedQuantity: updated.completed_quantity,
        status: updated.status,
        linkedApprovalItemId: updated.linked_approval_item_id,
        createdAt: updated.created_at,
        updatedAt: updated.updated_at,
      },
    })
  } catch (error) {
    console.error('Deliverable PUT error:', error)
    return NextResponse.json({ error: 'שגיאת שרת' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'לא מחובר' }, { status: 401 })
    }

    // Verify ownership
    const { data: item } = await supabase
      .from('deliverables')
      .select('id, creator_user_id')
      .eq('id', id)
      .single()

    if (!item) {
      return NextResponse.json({ error: 'deliverable לא נמצא' }, { status: 404 })
    }

    // Check access
    if (item.creator_user_id !== user.id) {
      const { data: agencyRelation } = await supabase
        .from('agency_creators')
        .select('id')
        .eq('agency_user_id', user.id)
        .eq('creator_user_id', item.creator_user_id)
        .single()

      if (!agencyRelation) {
        return NextResponse.json({ error: 'אין הרשאה' }, { status: 403 })
      }
    }

    const { error } = await supabase
      .from('deliverables')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Delete deliverable error:', error)
      return NextResponse.json({ error: 'שגיאה במחיקת deliverable' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Deliverable DELETE error:', error)
    return NextResponse.json({ error: 'שגיאת שרת' }, { status: 500 })
  }
}
