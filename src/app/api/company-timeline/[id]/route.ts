/**
 * Single Timeline Item API
 * GET - Get timeline item by ID
 * PUT - Update timeline item
 * DELETE - Delete timeline item
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { TimelineItem } from '@/types/timeline'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'לא מאומת' }, { status: 401 })
    }

    const { data: item, error } = await supabase
      .from('company_timeline_items')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'פריט לא נמצא' }, { status: 404 })
      }
      console.error('Error fetching timeline item:', error)
      return NextResponse.json({ error: 'שגיאה בטעינת הפריט' }, { status: 500 })
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

    return NextResponse.json({ item: transformed })
  } catch (error) {
    console.error('Timeline GET error:', error)
    return NextResponse.json({ error: 'שגיאת שרת' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'לא מאומת' }, { status: 401 })
    }

    const body = await request.json()
    const { type, title, details, amount, occurredOn } = body

    // Verify the item exists and user has access (RLS will handle this)
    const { data: existing } = await supabase
      .from('company_timeline_items')
      .select('id')
      .eq('id', id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'פריט לא נמצא' }, { status: 404 })
    }

    const updateData: any = {}
    if (type !== undefined) updateData.type = type
    if (title !== undefined) updateData.title = title
    if (details !== undefined) updateData.details = details
    if (amount !== undefined) updateData.amount = amount
    if (occurredOn !== undefined) updateData.occurred_on = occurredOn

    const { data: item, error: updateError } = await supabase
      .from('company_timeline_items')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating timeline item:', updateError)
      return NextResponse.json({ error: 'שגיאה בעדכון הפריט' }, { status: 500 })
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

    return NextResponse.json({ item: transformed })
  } catch (error) {
    console.error('Timeline PUT error:', error)
    return NextResponse.json({ error: 'שגיאת שרת' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'לא מאומת' }, { status: 401 })
    }

    const { error: deleteError } = await supabase
      .from('company_timeline_items')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting timeline item:', deleteError)
      return NextResponse.json({ error: 'שגיאה במחיקת הפריט' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Timeline DELETE error:', error)
    return NextResponse.json({ error: 'שגיאת שרת' }, { status: 500 })
  }
}
