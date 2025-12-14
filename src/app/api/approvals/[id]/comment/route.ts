/**
 * Approval Comments API
 * POST - Add a comment to an approval item (creator or agency)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { CreateCommentPayload, ApprovalComment } from '@/types/client-portal'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'לא מחובר' }, { status: 401 })
    }

    const body: CreateCommentPayload = await request.json()
    const { message, authorName } = body

    if (!message) {
      return NextResponse.json({ error: 'חסרה הודעה' }, { status: 400 })
    }

    // Verify approval item exists and user has access
    const { data: item } = await supabase
      .from('approval_items')
      .select('id, creator_user_id')
      .eq('id', id)
      .single()

    if (!item) {
      return NextResponse.json({ error: 'פריט לא נמצא' }, { status: 404 })
    }

    // Determine author type based on relationship
    let authorType: 'creator' | 'agency' = 'creator'

    if (item.creator_user_id !== user.id) {
      // Check if agency
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

    // Get user profile for name
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()

    const { data: newComment, error } = await supabase
      .from('approval_comments')
      .insert({
        approval_item_id: id,
        author_type: authorType,
        author_name: authorName || profile?.full_name || 'יוצר',
        message,
      })
      .select()
      .single()

    if (error) {
      console.error('Create comment error:', error)
      return NextResponse.json({ error: 'שגיאה בהוספת תגובה' }, { status: 500 })
    }

    const comment: ApprovalComment = {
      id: newComment.id,
      approvalItemId: newComment.approval_item_id,
      authorType: newComment.author_type,
      authorName: newComment.author_name,
      message: newComment.message,
      createdAt: newComment.created_at,
    }

    return NextResponse.json({ comment })
  } catch (error) {
    console.error('Comment POST error:', error)
    return NextResponse.json({ error: 'שגיאת שרת' }, { status: 500 })
  }
}
