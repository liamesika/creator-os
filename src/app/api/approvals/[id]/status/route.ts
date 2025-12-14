/**
 * Approval Status API
 * POST - Change approval item status (pending/approved/changes_requested)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { ApprovalStatus } from '@/types/client-portal'

interface RouteParams {
  params: Promise<{ id: string }>
}

const VALID_STATUSES: ApprovalStatus[] = ['draft', 'pending', 'approved', 'changes_requested']

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'לא מחובר' }, { status: 401 })
    }

    const body = await request.json()
    const { status, comment } = body

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'סטטוס לא תקין' }, { status: 400 })
    }

    // Verify approval item exists and user has access
    const { data: item } = await supabase
      .from('approval_items')
      .select('id, creator_user_id, status')
      .eq('id', id)
      .single()

    if (!item) {
      return NextResponse.json({ error: 'פריט לא נמצא' }, { status: 404 })
    }

    // Determine author type
    let authorType: 'creator' | 'agency' = 'creator'

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
      authorType = 'agency'
    }

    // Update status
    const { error: updateError } = await supabase
      .from('approval_items')
      .update({ status })
      .eq('id', id)

    if (updateError) {
      console.error('Status update error:', updateError)
      return NextResponse.json({ error: 'שגיאה בעדכון סטטוס' }, { status: 500 })
    }

    // Get user profile for name
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()

    const authorName = profile?.full_name || (authorType === 'agency' ? 'סוכנות' : 'יוצר')

    // Add status change comment
    const statusMessages: Record<ApprovalStatus, string> = {
      draft: 'הפריט הועבר לטיוטה',
      pending: 'הפריט נשלח לאישור לקוח',
      approved: 'הפריט אושר',
      changes_requested: 'נדרשים שינויים',
    }

    await supabase
      .from('approval_comments')
      .insert({
        approval_item_id: id,
        author_type: authorType,
        author_name: authorName,
        message: `📋 ${statusMessages[status as ApprovalStatus]}`,
      })

    // Add optional comment if provided
    if (comment) {
      await supabase
        .from('approval_comments')
        .insert({
          approval_item_id: id,
          author_type: authorType,
          author_name: authorName,
          message: comment,
        })
    }

    return NextResponse.json({
      success: true,
      previousStatus: item.status,
      newStatus: status,
    })
  } catch (error) {
    console.error('Status POST error:', error)
    return NextResponse.json({ error: 'שגיאת שרת' }, { status: 500 })
  }
}
