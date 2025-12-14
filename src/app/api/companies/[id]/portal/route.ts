/**
 * Company Portal API
 * GET - Get portal for a company
 * PUT - Update portal settings (enable/disable, brand)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: companyId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'לא מחובר' }, { status: 401 })
    }

    // Verify access to company
    const { data: company } = await supabase
      .from('companies')
      .select('id, creator_user_id')
      .eq('id', companyId)
      .single()

    if (!company) {
      return NextResponse.json({ error: 'חברה לא נמצאה' }, { status: 404 })
    }

    // Check ownership or agency
    if (company.creator_user_id !== user.id) {
      const { data: agencyRelation } = await supabase
        .from('agency_creators')
        .select('id')
        .eq('agency_user_id', user.id)
        .eq('creator_user_id', company.creator_user_id)
        .single()

      if (!agencyRelation) {
        return NextResponse.json({ error: 'אין הרשאה' }, { status: 403 })
      }
    }

    // Get portal
    const { data: portal } = await supabase
      .from('client_portals')
      .select('*')
      .eq('company_id', companyId)
      .single()

    return NextResponse.json({ portal: portal || null })
  } catch (error) {
    console.error('Company portal GET error:', error)
    return NextResponse.json({ error: 'שגיאת שרת' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: companyId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'לא מחובר' }, { status: 401 })
    }

    const body = await request.json()
    const { isEnabled, brandName, brandColor } = body

    // Verify access to company
    const { data: company } = await supabase
      .from('companies')
      .select('id, creator_user_id')
      .eq('id', companyId)
      .single()

    if (!company) {
      return NextResponse.json({ error: 'חברה לא נמצאה' }, { status: 404 })
    }

    if (company.creator_user_id !== user.id) {
      const { data: agencyRelation } = await supabase
        .from('agency_creators')
        .select('id')
        .eq('agency_user_id', user.id)
        .eq('creator_user_id', company.creator_user_id)
        .single()

      if (!agencyRelation) {
        return NextResponse.json({ error: 'אין הרשאה' }, { status: 403 })
      }
    }

    // Get existing portal
    const { data: portal } = await supabase
      .from('client_portals')
      .select('id')
      .eq('company_id', companyId)
      .single()

    if (!portal) {
      return NextResponse.json({ error: 'פורטל לא נמצא' }, { status: 404 })
    }

    // Build update
    const updateData: Record<string, unknown> = {}
    if (isEnabled !== undefined) updateData.is_enabled = isEnabled
    if (brandName !== undefined) updateData.brand_name = brandName
    if (brandColor !== undefined) updateData.brand_color = brandColor

    const { data: updated, error } = await supabase
      .from('client_portals')
      .update(updateData)
      .eq('id', portal.id)
      .select()
      .single()

    if (error) {
      console.error('Update portal error:', error)
      return NextResponse.json({ error: 'שגיאה בעדכון פורטל' }, { status: 500 })
    }

    return NextResponse.json({ portal: updated })
  } catch (error) {
    console.error('Company portal PUT error:', error)
    return NextResponse.json({ error: 'שגיאת שרת' }, { status: 500 })
  }
}
