/**
 * Client Portal Comment API
 * POST - Client adds a comment on an approval item
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{ token: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { token } = await params
    const supabase = await createClient()

    const body = await request.json()
    const { approvalItemId, message, authorName } = body

    if (!approvalItemId || !message) {
      return NextResponse.json({ error: 'חסרים פרטים' }, { status: 400 })
    }

    // Validate portal token
    const { data: portal } = await supabase
      .from('client_portals')
      .select('id, company_id, is_enabled')
      .eq('token', token)
      .single()

    if (!portal || !portal.is_enabled) {
      return NextResponse.json({ error: 'פורטל לא תקין' }, { status: 403 })
    }

    // Verify approval item belongs to this company
    const { data: approvalItem } = await supabase
      .from('approval_items')
      .select('id, company_id')
      .eq('id', approvalItemId)
      .single()

    if (!approvalItem || approvalItem.company_id !== portal.company_id) {
      return NextResponse.json({ error: 'פריט לא נמצא' }, { status: 404 })
    }

    // Add comment as client
    const { data: comment, error: commentError } = await supabase
      .from('approval_comments')
      .insert({
        approval_item_id: approvalItemId,
        author_type: 'client',
        author_name: authorName || 'לקוח',
        message,
      })
      .select()
      .single()

    if (commentError) {
      console.error('Comment create error:', commentError)
      return NextResponse.json({ error: 'שגיאה בהוספת תגובה' }, { status: 500 })
    }

    return NextResponse.json({
      comment: {
        id: comment.id,
        authorType: comment.author_type,
        authorName: comment.author_name,
        message: comment.message,
        createdAt: comment.created_at,
      },
    })
  } catch (error) {
    console.error('Portal comment error:', error)
    return NextResponse.json({ error: 'שגיאת שרת' }, { status: 500 })
  }
}
