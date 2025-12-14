import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { MAX_CREATORS_PER_AGENCY } from '@/types/agency'

/**
 * GET /api/agency/members
 * List all members of the agency
 */
export async function GET() {
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

    // Get members with creator details
    const { data: members, error: membersError } = await supabase
      .from('agency_memberships')
      .select(`
        *,
        creator:creator_user_id (
          id,
          name,
          email
        )
      `)
      .eq('agency_id', user.id)
      .order('created_at', { ascending: false })

    if (membersError) {
      console.error('Error fetching members:', membersError)
      return NextResponse.json({ error: 'שגיאה בטעינת החברים' }, { status: 500 })
    }

    return NextResponse.json({ members })
  } catch (error) {
    console.error('Agency members GET error:', error)
    return NextResponse.json({ error: 'שגיאת שרת' }, { status: 500 })
  }
}

/**
 * POST /api/agency/members/invite
 * Invite a creator to the agency by email
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

    // Check current member count
    const { count: memberCount } = await supabase
      .from('agency_memberships')
      .select('*', { count: 'exact', head: true })
      .eq('agency_id', user.id)
      .in('status', ['active', 'invited'])

    if (memberCount && memberCount >= MAX_CREATORS_PER_AGENCY) {
      return NextResponse.json(
        { error: `הגעת למקסימום ${MAX_CREATORS_PER_AGENCY} יוצרים. שדרג את החבילה שלך להוספת יוצרים נוספים.` },
        { status: 400 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { email } = body

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'נדרש אימייל תקין' }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'פורמט אימייל לא תקין' }, { status: 400 })
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('user_profiles')
      .select('id, account_type')
      .eq('email', email.toLowerCase())
      .single()

    // Check if already a member
    const { data: existingMembership } = await supabase
      .from('agency_memberships')
      .select('id, status')
      .eq('agency_id', user.id)
      .or(`creator_user_id.eq.${existingUser?.id || ''},invite_email.eq.${email.toLowerCase()}`)
      .single()

    if (existingMembership) {
      if (existingMembership.status === 'active') {
        return NextResponse.json({ error: 'היוצר כבר חבר בסוכנות' }, { status: 400 })
      }
      if (existingMembership.status === 'invited') {
        return NextResponse.json({ error: 'ההזמנה כבר נשלחה ליוצר זה' }, { status: 400 })
      }
      // If removed, we can re-invite
    }

    // Prevent inviting another agency
    if (existingUser?.account_type === 'agency') {
      return NextResponse.json({ error: 'לא ניתן להזמין סוכנות אחרת כיוצר' }, { status: 400 })
    }

    // Create membership
    const insertData: any = {
      agency_id: user.id,
      role: 'creator',
      status: existingUser ? 'active' : 'invited',
    }

    if (existingUser) {
      insertData.creator_user_id = existingUser.id
    } else {
      insertData.invite_email = email.toLowerCase()
    }

    const { data: membership, error: insertError } = await supabase
      .from('agency_memberships')
      .insert(insertData)
      .select(`
        *,
        creator:creator_user_id (
          id,
          name,
          email
        )
      `)
      .single()

    if (insertError) {
      console.error('Error creating membership:', insertError)
      return NextResponse.json({ error: 'שגיאה ביצירת ההזמנה' }, { status: 500 })
    }

    return NextResponse.json({
      membership,
      message: existingUser
        ? 'היוצר נוסף בהצלחה לסוכנות'
        : 'ההזמנה נשלחה. היוצר יצטרף לסוכנות לאחר ההרשמה.',
    })
  } catch (error) {
    console.error('Agency invite POST error:', error)
    return NextResponse.json({ error: 'שגיאת שרת' }, { status: 500 })
  }
}

/**
 * DELETE /api/agency/members
 * Remove a creator from the agency
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
    const { membershipId } = body

    if (!membershipId) {
      return NextResponse.json({ error: 'נדרש מזהה חברות' }, { status: 400 })
    }

    // Verify the membership belongs to this agency
    const { data: membership, error: membershipError } = await supabase
      .from('agency_memberships')
      .select('id')
      .eq('id', membershipId)
      .eq('agency_id', user.id)
      .single()

    if (membershipError || !membership) {
      return NextResponse.json({ error: 'החברות לא נמצאה' }, { status: 404 })
    }

    // Remove the membership
    const { error: deleteError } = await supabase
      .from('agency_memberships')
      .update({ status: 'removed' })
      .eq('id', membershipId)

    if (deleteError) {
      console.error('Error removing membership:', deleteError)
      return NextResponse.json({ error: 'שגיאה בהסרת היוצר' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'היוצר הוסר מהסוכנות' })
  } catch (error) {
    console.error('Agency members DELETE error:', error)
    return NextResponse.json({ error: 'שגיאת שרת' }, { status: 500 })
  }
}
