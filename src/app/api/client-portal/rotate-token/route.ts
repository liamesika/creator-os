/**
 * Client Portal Rotate Token API
 * POST - Rotate the portal token for security
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
    const { portalId, companyId } = body

    if (!portalId && !companyId) {
      return NextResponse.json({ error: 'חסר מזהה פורטל או חברה' }, { status: 400 })
    }

    // Get portal
    let query = supabase.from('client_portals').select('*')
    if (portalId) {
      query = query.eq('id', portalId)
    } else {
      query = query.eq('company_id', companyId)
    }

    const { data: portal } = await query.single()

    if (!portal) {
      return NextResponse.json({ error: 'פורטל לא נמצא' }, { status: 404 })
    }

    // Check access
    const isOwner = portal.creator_user_id === user.id

    if (!isOwner) {
      const { data: relationship } = await supabase
        .from('agency_creator_relationships')
        .select('id')
        .eq('agency_user_id', user.id)
        .eq('creator_user_id', portal.creator_user_id)
        .eq('status', 'active')
        .single()

      if (!relationship) {
        return NextResponse.json({ error: 'אין הרשאה' }, { status: 403 })
      }
    }

    // Generate new token
    const newToken = generatePortalToken()

    const { data: updatedPortal, error: updateError } = await supabase
      .from('client_portals')
      .update({ token: newToken })
      .eq('id', portal.id)
      .select()
      .single()

    if (updateError) {
      console.error('Token rotate error:', updateError)
      return NextResponse.json({ error: 'שגיאה בחידוש טוקן' }, { status: 500 })
    }

    return NextResponse.json({
      token: updatedPortal.token,
    })
  } catch (error) {
    console.error('Rotate token error:', error)
    return NextResponse.json({ error: 'שגיאת שרת' }, { status: 500 })
  }
}
