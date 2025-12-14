import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/agency/earnings
 * Get earnings for agency's creators
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const creatorId = searchParams.get('creatorId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'לא מאומת' }, { status: 401 })
    }

    // Verify user is an agency
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('account_type')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.account_type !== 'agency') {
      return NextResponse.json({ error: 'הגישה מותרת רק לסוכנויות' }, { status: 403 })
    }

    // If specific creator requested, verify they're managed by this agency
    if (creatorId) {
      const { data: membership } = await supabase
        .from('agency_memberships')
        .select('id')
        .eq('agency_id', user.id)
        .eq('creator_user_id', creatorId)
        .eq('status', 'active')
        .single()

      if (!membership) {
        return NextResponse.json({ error: 'היוצר אינו חבר בסוכנות' }, { status: 403 })
      }
    }

    // Build query
    let query = supabase
      .from('earnings_entries')
      .select(`
        *,
        companies:company_id (name),
        creator:creator_user_id (id, name, email)
      `)
      .order('earned_on', { ascending: false })

    if (creatorId) {
      query = query.eq('creator_user_id', creatorId)
    } else {
      // Get all creators managed by this agency
      const { data: memberships } = await supabase
        .from('agency_memberships')
        .select('creator_user_id')
        .eq('agency_id', user.id)
        .eq('status', 'active')

      const creatorIds = (memberships || [])
        .map(m => m.creator_user_id)
        .filter(Boolean)

      if (creatorIds.length === 0) {
        return NextResponse.json({ earnings: [] })
      }

      query = query.in('creator_user_id', creatorIds)
    }

    if (startDate) {
      query = query.gte('earned_on', startDate)
    }
    if (endDate) {
      query = query.lte('earned_on', endDate)
    }

    const { data: earnings, error: earningsError } = await query

    if (earningsError) {
      console.error('Error fetching earnings:', earningsError)
      return NextResponse.json({ error: 'שגיאה בטעינת ההכנסות' }, { status: 500 })
    }

    return NextResponse.json({ earnings })
  } catch (error) {
    console.error('Agency earnings GET error:', error)
    return NextResponse.json({ error: 'שגיאת שרת' }, { status: 500 })
  }
}

/**
 * POST /api/agency/earnings
 * Create an earnings entry for a creator
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'לא מאומת' }, { status: 401 })
    }

    // Verify user is an agency
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('account_type')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.account_type !== 'agency') {
      return NextResponse.json({ error: 'הגישה מותרת רק לסוכנויות' }, { status: 403 })
    }

    // Parse request body
    const body = await request.json()
    const { creatorUserId, companyId, amount, currency, earnedOn, notes } = body

    // Validate required fields
    if (!creatorUserId) {
      return NextResponse.json({ error: 'נדרש מזהה יוצר' }, { status: 400 })
    }
    if (typeof amount !== 'number' || amount < 0) {
      return NextResponse.json({ error: 'נדרש סכום תקין' }, { status: 400 })
    }
    if (!earnedOn) {
      return NextResponse.json({ error: 'נדרש תאריך הכנסה' }, { status: 400 })
    }

    // Verify creator is managed by this agency
    const { data: membership } = await supabase
      .from('agency_memberships')
      .select('id')
      .eq('agency_id', user.id)
      .eq('creator_user_id', creatorUserId)
      .eq('status', 'active')
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'היוצר אינו חבר בסוכנות' }, { status: 403 })
    }

    // If company specified, verify it belongs to the creator
    if (companyId) {
      const { data: company } = await supabase
        .from('companies')
        .select('id')
        .eq('id', companyId)
        .eq('owner_uid', creatorUserId)
        .single()

      if (!company) {
        return NextResponse.json({ error: 'החברה לא נמצאה או לא שייכת ליוצר' }, { status: 400 })
      }
    }

    // Create earnings entry
    const { data: entry, error: insertError } = await supabase
      .from('earnings_entries')
      .insert({
        creator_user_id: creatorUserId,
        company_id: companyId || null,
        amount,
        currency: currency || 'ILS',
        earned_on: earnedOn,
        notes: notes || null,
        created_by: user.id,
      })
      .select(`
        *,
        companies:company_id (name)
      `)
      .single()

    if (insertError) {
      console.error('Error creating earnings entry:', insertError)
      return NextResponse.json({ error: 'שגיאה ביצירת רשומת הכנסה' }, { status: 500 })
    }

    return NextResponse.json({ entry, message: 'רשומת ההכנסה נוצרה בהצלחה' })
  } catch (error) {
    console.error('Agency earnings POST error:', error)
    return NextResponse.json({ error: 'שגיאת שרת' }, { status: 500 })
  }
}

/**
 * PUT /api/agency/earnings
 * Update an earnings entry
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'לא מאומת' }, { status: 401 })
    }

    // Verify user is an agency
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('account_type')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.account_type !== 'agency') {
      return NextResponse.json({ error: 'הגישה מותרת רק לסוכנויות' }, { status: 403 })
    }

    // Parse request body
    const body = await request.json()
    const { entryId, companyId, amount, currency, earnedOn, notes } = body

    if (!entryId) {
      return NextResponse.json({ error: 'נדרש מזהה רשומה' }, { status: 400 })
    }

    // Get the entry and verify access
    const { data: existingEntry, error: entryError } = await supabase
      .from('earnings_entries')
      .select('creator_user_id')
      .eq('id', entryId)
      .single()

    if (entryError || !existingEntry) {
      return NextResponse.json({ error: 'הרשומה לא נמצאה' }, { status: 404 })
    }

    // Verify creator is managed by this agency
    const { data: membership } = await supabase
      .from('agency_memberships')
      .select('id')
      .eq('agency_id', user.id)
      .eq('creator_user_id', existingEntry.creator_user_id)
      .eq('status', 'active')
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'אין הרשאה לערוך רשומה זו' }, { status: 403 })
    }

    // Build update object
    const updateData: any = {}
    if (companyId !== undefined) updateData.company_id = companyId || null
    if (amount !== undefined) updateData.amount = amount
    if (currency !== undefined) updateData.currency = currency
    if (earnedOn !== undefined) updateData.earned_on = earnedOn
    if (notes !== undefined) updateData.notes = notes

    // Update the entry
    const { data: entry, error: updateError } = await supabase
      .from('earnings_entries')
      .update(updateData)
      .eq('id', entryId)
      .select(`
        *,
        companies:company_id (name)
      `)
      .single()

    if (updateError) {
      console.error('Error updating earnings entry:', updateError)
      return NextResponse.json({ error: 'שגיאה בעדכון הרשומה' }, { status: 500 })
    }

    return NextResponse.json({ entry, message: 'הרשומה עודכנה בהצלחה' })
  } catch (error) {
    console.error('Agency earnings PUT error:', error)
    return NextResponse.json({ error: 'שגיאת שרת' }, { status: 500 })
  }
}

/**
 * DELETE /api/agency/earnings
 * Delete an earnings entry
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'לא מאומת' }, { status: 401 })
    }

    // Verify user is an agency
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('account_type')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.account_type !== 'agency') {
      return NextResponse.json({ error: 'הגישה מותרת רק לסוכנויות' }, { status: 403 })
    }

    // Parse request body
    const body = await request.json()
    const { entryId } = body

    if (!entryId) {
      return NextResponse.json({ error: 'נדרש מזהה רשומה' }, { status: 400 })
    }

    // Get the entry and verify access
    const { data: existingEntry, error: entryError } = await supabase
      .from('earnings_entries')
      .select('creator_user_id')
      .eq('id', entryId)
      .single()

    if (entryError || !existingEntry) {
      return NextResponse.json({ error: 'הרשומה לא נמצאה' }, { status: 404 })
    }

    // Verify creator is managed by this agency
    const { data: membership } = await supabase
      .from('agency_memberships')
      .select('id')
      .eq('agency_id', user.id)
      .eq('creator_user_id', existingEntry.creator_user_id)
      .eq('status', 'active')
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'אין הרשאה למחוק רשומה זו' }, { status: 403 })
    }

    // Delete the entry
    const { error: deleteError } = await supabase
      .from('earnings_entries')
      .delete()
      .eq('id', entryId)

    if (deleteError) {
      console.error('Error deleting earnings entry:', deleteError)
      return NextResponse.json({ error: 'שגיאה במחיקת הרשומה' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'הרשומה נמחקה בהצלחה' })
  } catch (error) {
    console.error('Agency earnings DELETE error:', error)
    return NextResponse.json({ error: 'שגיאת שרת' }, { status: 500 })
  }
}
