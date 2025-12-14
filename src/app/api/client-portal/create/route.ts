/**
 * Client Portal Create API
 * POST - Create a new client portal for a company
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generatePortalToken } from '@/types/client-portal'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'לא מאומת' }, { status: 401 })
    }

    const body = await request.json()
    const { companyId, brandName, brandColor } = body

    if (!companyId) {
      return NextResponse.json({ error: 'חסר מזהה חברה' }, { status: 400 })
    }

    // Verify user has access to this company
    const { data: company } = await supabase
      .from('companies')
      .select('id, user_id, name')
      .eq('id', companyId)
      .single()

    if (!company) {
      return NextResponse.json({ error: 'חברה לא נמצאה' }, { status: 404 })
    }

    // Check if user is owner or managing agency
    const isOwner = company.user_id === user.id
    let creatorUserId = user.id

    if (!isOwner) {
      const { data: relationship } = await supabase
        .from('agency_creator_relationships')
        .select('creator_user_id')
        .eq('agency_user_id', user.id)
        .eq('creator_user_id', company.user_id)
        .eq('status', 'active')
        .single()

      if (!relationship) {
        return NextResponse.json({ error: 'אין הרשאה' }, { status: 403 })
      }
      creatorUserId = relationship.creator_user_id
    }

    // Check if portal already exists
    const { data: existingPortal } = await supabase
      .from('client_portals')
      .select('id')
      .eq('company_id', companyId)
      .single()

    if (existingPortal) {
      return NextResponse.json({ error: 'פורטל כבר קיים לחברה זו' }, { status: 400 })
    }

    // Create portal
    const token = generatePortalToken()

    const { data: portal, error: createError } = await supabase
      .from('client_portals')
      .insert({
        creator_user_id: creatorUserId,
        company_id: companyId,
        token,
        is_enabled: true,
        brand_name: brandName || null,
        brand_color: brandColor || null,
      })
      .select()
      .single()

    if (createError) {
      console.error('Portal create error:', createError)
      return NextResponse.json({ error: 'שגיאה ביצירת פורטל' }, { status: 500 })
    }

    return NextResponse.json({
      portal: {
        id: portal.id,
        token: portal.token,
        isEnabled: portal.is_enabled,
        brandName: portal.brand_name,
        brandColor: portal.brand_color,
        createdAt: portal.created_at,
      },
    })
  } catch (error) {
    console.error('Client portal create error:', error)
    return NextResponse.json({ error: 'שגיאת שרת' }, { status: 500 })
  }
}
