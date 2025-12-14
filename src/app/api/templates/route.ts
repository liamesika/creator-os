/**
 * Templates API
 * GET - List templates
 * POST - Create template
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { CreateTemplatePayload, Template } from '@/types/templates'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'לא מאומת' }, { status: 401 })
    }

    // Get user's account type
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('account_type')
      .eq('id', user.id)
      .single()

    const isAgency = profile?.account_type === 'agency'

    // Get own templates + public templates
    const { data: templates, error } = await supabase
      .from('templates')
      .select(`
        *,
        items:template_items(*)
      `)
      .or(`owner_user_id.eq.${user.id},is_public.eq.true`)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching templates:', error)
      return NextResponse.json({ error: 'שגיאה בטעינת התבניות' }, { status: 500 })
    }

    // Transform to camelCase
    const transformedTemplates: Template[] = (templates || []).map((t: any) => ({
      id: t.id,
      ownerUserId: t.owner_user_id,
      ownerType: t.owner_type,
      title: t.title,
      description: t.description,
      category: t.category,
      isPublic: t.is_public,
      createdAt: new Date(t.created_at),
      updatedAt: new Date(t.updated_at),
      items: (t.items || []).map((item: any) => ({
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
    }))

    return NextResponse.json({ templates: transformedTemplates })
  } catch (error) {
    console.error('Templates GET error:', error)
    return NextResponse.json({ error: 'שגיאת שרת' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'לא מאומת' }, { status: 401 })
    }

    // Get user's account type
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('account_type')
      .eq('id', user.id)
      .single()

    const body: CreateTemplatePayload = await request.json()
    const { title, description, category, isPublic, items } = body

    if (!title || !category) {
      return NextResponse.json({ error: 'שם וקטגוריה נדרשים' }, { status: 400 })
    }

    // Create template
    const { data: template, error: templateError } = await supabase
      .from('templates')
      .insert({
        owner_user_id: user.id,
        owner_type: profile?.account_type || 'creator',
        title,
        description,
        category,
        is_public: isPublic || false,
      })
      .select()
      .single()

    if (templateError) {
      console.error('Error creating template:', templateError)
      return NextResponse.json({ error: 'שגיאה ביצירת התבנית' }, { status: 500 })
    }

    // Create items if provided
    if (items && items.length > 0) {
      const itemsToInsert = items.map((item, index) => ({
        template_id: template.id,
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
        console.error('Error creating template items:', itemsError)
        // Template was created, items failed - still return success with warning
      }
    }

    // Fetch complete template with items
    const { data: completeTemplate } = await supabase
      .from('templates')
      .select(`
        *,
        items:template_items(*)
      `)
      .eq('id', template.id)
      .single()

    const transformed: Template = {
      id: completeTemplate.id,
      ownerUserId: completeTemplate.owner_user_id,
      ownerType: completeTemplate.owner_type,
      title: completeTemplate.title,
      description: completeTemplate.description,
      category: completeTemplate.category,
      isPublic: completeTemplate.is_public,
      createdAt: new Date(completeTemplate.created_at),
      updatedAt: new Date(completeTemplate.updated_at),
      items: (completeTemplate.items || []).map((item: any) => ({
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

    return NextResponse.json({ template: transformed }, { status: 201 })
  } catch (error) {
    console.error('Templates POST error:', error)
    return NextResponse.json({ error: 'שגיאת שרת' }, { status: 500 })
  }
}
