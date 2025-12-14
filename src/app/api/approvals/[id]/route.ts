/**
 * Single Approval Item API
 * GET - Get approval item with comments
 * PUT - Update approval item
 * DELETE - Delete approval item
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { ApprovalItem, ApprovalComment } from '@/types/client-portal'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'לא מחובר' }, { status: 401 })
    }

    // Fetch approval item with comments and company name
    const { data: item, error } = await supabase
      .from('approval_items')
      .select(`
        *,
        companies:company_id (name, creator_user_id),
        approval_comments (
          id,
          author_type,
          author_name,
          message,
          created_at
        )
      `)
      .eq('id', id)
      .single()

    if (error || !item) {
      return NextResponse.json({ error: 'פריט לא נמצא' }, { status: 404 })
    }

    // Check access - owner or agency
    const company = item.companies as { name: string; creator_user_id: string } | null
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

    const approval: ApprovalItem = {
      id: item.id,
      creatorUserId: item.creator_user_id,
      companyId: item.company_id,
      relatedEventId: item.related_event_id,
      relatedTaskId: item.related_task_id,
      title: item.title,
      type: item.type,
      status: item.status,
      dueOn: item.due_on,
      assetUrl: item.asset_url,
      notes: item.notes,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      companyName: company?.name,
      commentsCount: Array.isArray(item.approval_comments) ? item.approval_comments.length : 0,
    }

    const comments: ApprovalComment[] = (item.approval_comments as Array<Record<string, unknown>> || []).map(c => ({
      id: c.id as string,
      approvalItemId: item.id,
      authorType: c.author_type as 'creator' | 'client' | 'agency',
      authorName: c.author_name as string | null,
      message: c.message as string,
      createdAt: c.created_at as string,
    }))

    return NextResponse.json({ approval, comments })
  } catch (error) {
    console.error('Approval GET error:', error)
    return NextResponse.json({ error: 'שגיאת שרת' }, { status: 500 })
  }
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
    const { title, type, dueOn, assetUrl, notes, relatedEventId, relatedTaskId } = body

    // Verify ownership
    const { data: item } = await supabase
      .from('approval_items')
      .select('id, creator_user_id')
      .eq('id', id)
      .single()

    if (!item) {
      return NextResponse.json({ error: 'פריט לא נמצא' }, { status: 404 })
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

    // Build update object (only include provided fields)
    const updateData: Record<string, unknown> = {}
    if (title !== undefined) updateData.title = title
    if (type !== undefined) updateData.type = type
    if (dueOn !== undefined) updateData.due_on = dueOn
    if (assetUrl !== undefined) updateData.asset_url = assetUrl
    if (notes !== undefined) updateData.notes = notes
    if (relatedEventId !== undefined) updateData.related_event_id = relatedEventId
    if (relatedTaskId !== undefined) updateData.related_task_id = relatedTaskId

    const { data: updated, error } = await supabase
      .from('approval_items')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Update approval error:', error)
      return NextResponse.json({ error: 'שגיאה בעדכון פריט' }, { status: 500 })
    }

    return NextResponse.json({
      approval: {
        id: updated.id,
        creatorUserId: updated.creator_user_id,
        companyId: updated.company_id,
        title: updated.title,
        type: updated.type,
        status: updated.status,
        dueOn: updated.due_on,
        assetUrl: updated.asset_url,
        notes: updated.notes,
        createdAt: updated.created_at,
        updatedAt: updated.updated_at,
      },
    })
  } catch (error) {
    console.error('Approval PUT error:', error)
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
      .from('approval_items')
      .select('id, creator_user_id')
      .eq('id', id)
      .single()

    if (!item) {
      return NextResponse.json({ error: 'פריט לא נמצא' }, { status: 404 })
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

    // Delete comments first (cascade should handle this, but be explicit)
    await supabase
      .from('approval_comments')
      .delete()
      .eq('approval_item_id', id)

    // Delete item
    const { error } = await supabase
      .from('approval_items')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Delete approval error:', error)
      return NextResponse.json({ error: 'שגיאה במחיקת פריט' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Approval DELETE error:', error)
    return NextResponse.json({ error: 'שגיאת שרת' }, { status: 500 })
  }
}
