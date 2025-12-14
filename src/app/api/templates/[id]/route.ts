/**
 * Single Template API
 * GET - Get template by ID
 * PUT - Update template
 * DELETE - Delete template
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Template, CreateTemplateItemPayload } from '@/types/templates'

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

    const { data: template, error } = await supabase
      .from('templates')
      .select(`
        *,
        items:template_items(*)
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'תבנית לא נמצאה' }, { status: 404 })
      }
      console.error('Error fetching template:', error)
      return NextResponse.json({ error: 'שגיאה בטעינת התבנית' }, { status: 500 })
    }

    // Check access: owner or public template
    if (template.owner_user_id !== user.id && !template.is_public) {
      return NextResponse.json({ error: 'אין הרשאה' }, { status: 403 })
    }

    const transformed: Template = {
      id: template.id,
      ownerUserId: template.owner_user_id,
      ownerType: template.owner_type,
      title: template.title,
      description: template.description,
      category: template.category,
      isPublic: template.is_public,
      createdAt: new Date(template.created_at),
      updatedAt: new Date(template.updated_at),
      items: (template.items || []).map((item: any) => ({
        id: item.id,
        templateId: item.template_id,
        itemType: item.item_type,
        title: item.title,
        notes: item.notes,
        dayOffset: item.day_offset,
        timeOfDay: item.time_of_day,
        durationMinutes: item.duration_minutes,
        eventCategory: item.event_category,
        priority: item.priority,
        sortOrder: item.sort_order,
        createdAt: new Date(item.created_at),
      })),
    }

    return NextResponse.json({ template: transformed })
  } catch (error) {
    console.error('Template GET error:', error)
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

    // Check ownership
    const { data: existing } = await supabase
      .from('templates')
      .select('owner_user_id')
      .eq('id', id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'תבנית לא נמצאה' }, { status: 404 })
    }

    if (existing.owner_user_id !== user.id) {
      return NextResponse.json({ error: 'אין הרשאה לערוך תבנית זו' }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, category, isPublic, items } = body

    // Update template
    const { error: updateError } = await supabase
      .from('templates')
      .update({
        title,
        description,
        category,
        is_public: isPublic,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (updateError) {
      console.error('Error updating template:', updateError)
      return NextResponse.json({ error: 'שגיאה בעדכון התבנית' }, { status: 500 })
    }

    // Update items if provided
    if (items !== undefined) {
      // Delete existing items
      await supabase
        .from('template_items')
        .delete()
        .eq('template_id', id)

      // Insert new items
      if (items && items.length > 0) {
        const itemsToInsert = items.map((item: CreateTemplateItemPayload, index: number) => ({
          template_id: id,
          item_type: item.itemType,
          title: item.title,
          notes: item.notes,
          day_offset: item.dayOffset || 0,
          time_of_day: item.timeOfDay,
          duration_minutes: item.durationMinutes,
          event_category: item.eventCategory,
          priority: item.priority,
          sort_order: item.sortOrder ?? index,
        }))

        const { error: itemsError } = await supabase
          .from('template_items')
          .insert(itemsToInsert)

        if (itemsError) {
          console.error('Error updating template items:', itemsError)
        }
      }
    }

    // Fetch updated template
    const { data: updated } = await supabase
      .from('templates')
      .select(`
        *,
        items:template_items(*)
      `)
      .eq('id', id)
      .single()

    const transformed: Template = {
      id: updated.id,
      ownerUserId: updated.owner_user_id,
      ownerType: updated.owner_type,
      title: updated.title,
      description: updated.description,
      category: updated.category,
      isPublic: updated.is_public,
      createdAt: new Date(updated.created_at),
      updatedAt: new Date(updated.updated_at),
      items: (updated.items || []).map((item: any) => ({
        id: item.id,
        templateId: item.template_id,
        itemType: item.item_type,
        title: item.title,
        notes: item.notes,
        dayOffset: item.day_offset,
        timeOfDay: item.time_of_day,
        durationMinutes: item.duration_minutes,
        eventCategory: item.event_category,
        priority: item.priority,
        sortOrder: item.sort_order,
        createdAt: new Date(item.created_at),
      })),
    }

    return NextResponse.json({ template: transformed })
  } catch (error) {
    console.error('Template PUT error:', error)
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

    // Check ownership
    const { data: existing } = await supabase
      .from('templates')
      .select('owner_user_id')
      .eq('id', id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'תבנית לא נמצאה' }, { status: 404 })
    }

    if (existing.owner_user_id !== user.id) {
      return NextResponse.json({ error: 'אין הרשאה למחוק תבנית זו' }, { status: 403 })
    }

    // Delete template (items will cascade)
    const { error: deleteError } = await supabase
      .from('templates')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting template:', deleteError)
      return NextResponse.json({ error: 'שגיאה במחיקת התבנית' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Template DELETE error:', error)
    return NextResponse.json({ error: 'שגיאת שרת' }, { status: 500 })
  }
}
