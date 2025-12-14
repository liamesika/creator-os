/**
 * Shared Report Public API
 * GET - Render read-only report (no auth required)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const supabase = await createClient()

    // Fetch shared report
    const { data: report, error } = await supabase
      .from('shared_reports')
      .select('*')
      .eq('token', token)
      .single()

    if (error || !report) {
      return NextResponse.json({ error: 'דוח לא נמצא' }, { status: 404 })
    }

    // Check expiry
    if (report.expires_at && new Date(report.expires_at) < new Date()) {
      return NextResponse.json({ error: 'הקישור פג תוקף' }, { status: 410 })
    }

    return NextResponse.json({
      report: {
        scope: report.scope,
        payload: report.payload,
        createdAt: report.created_at,
      },
    })
  } catch (error) {
    console.error('Shared report error:', error)
    return NextResponse.json({ error: 'שגיאת שרת' }, { status: 500 })
  }
}
