/**
 * Client Portal Approve API
 * POST - Client approves or requests changes on an approval item
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { ApprovalStatus } from '@/types/client-portal'

interface RouteParams {
  params: Promise<{ token: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { token } = await params
    const supabase = await createClient()

    const body = await request.json()
    const { approvalItemId, status, comment, authorName } = body

    if (!approvalItemId || !status) {
      return NextResponse.json({ error: 'חסרים פרטים' }, { status: 400 })
    }

    // Only allow approved or changes_requested
    const validStatuses: ApprovalStatus[] = ['approved', 'changes_requested']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'סטטוס לא תקין' }, { status: 400 })
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
      .select('id, company_id, status')
      .eq('id', approvalItemId)
      .single()

    if (!approvalItem || approvalItem.company_id !== portal.company_id) {
      return NextResponse.json({ error: 'פריט לא נמצא' }, { status: 404 })
    }

    // Update status
    const { error: updateError } = await supabase
      .from('approval_items')
      .update({ status })
      .eq('id', approvalItemId)

    if (updateError) {
      console.error('Status update error:', updateError)
      return NextResponse.json({ error: 'שגיאה בעדכון סטטוס' }, { status: 500 })
    }

    // Add comment if provided
    if (comment) {
      await supabase
        .from('approval_comments')
        .insert({
          approval_item_id: approvalItemId,
          author_type: 'client',
          author_name: authorName || 'לקוח',
          message: comment,
        })
    }

    // Add automatic status change comment
    const statusMessage = status === 'approved'
      ? 'הפריט אושר על ידי הלקוח'
      : 'הלקוח ביקש שינויים'

    await supabase
      .from('approval_comments')
      .insert({
        approval_item_id: approvalItemId,
        author_type: 'client',
        author_name: authorName || 'לקוח',
        message: `📋 ${statusMessage}`,
      })

    return NextResponse.json({
      success: true,
      status,
    })
  } catch (error) {
    console.error('Portal approve error:', error)
    return NextResponse.json({ error: 'שגיאת שרת' }, { status: 500 })
  }
}
