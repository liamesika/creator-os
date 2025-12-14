/**
 * Notification Settings API
 * GET/POST user notification preferences
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { NotificationSettings } from '@/types/premium'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get notification settings
    const { data: settings, error } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Return settings or default values
    const defaultSettings: Partial<NotificationSettings> = {
      dailyEmailEnabled: true,
      dailyEmailTime: '08:30:00',
      timezone: 'Asia/Jerusalem',
      includeMotivation: true,
      weeklySummaryEnabled: true,
    }

    return NextResponse.json({
      settings: settings ? {
        id: settings.id,
        userId: settings.user_id,
        dailyEmailEnabled: settings.daily_email_enabled,
        dailyEmailTime: settings.daily_email_time,
        timezone: settings.timezone,
        includeMotivation: settings.include_motivation,
        weeklySummaryEnabled: settings.weekly_summary_enabled,
        createdAt: settings.created_at,
        updatedAt: settings.updated_at,
      } : defaultSettings,
    })
  } catch (error) {
    console.error('Error fetching notification settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      dailyEmailEnabled,
      dailyEmailTime,
      timezone,
      includeMotivation,
      weeklySummaryEnabled,
    } = body

    // Upsert notification settings
    const { data: settings, error } = await supabase
      .from('notification_settings')
      .upsert({
        user_id: user.id,
        daily_email_enabled: dailyEmailEnabled ?? true,
        daily_email_time: dailyEmailTime ?? '08:30:00',
        timezone: timezone ?? 'Asia/Jerusalem',
        include_motivation: includeMotivation ?? true,
        weekly_summary_enabled: weeklySummaryEnabled ?? true,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      settings: {
        id: settings.id,
        userId: settings.user_id,
        dailyEmailEnabled: settings.daily_email_enabled,
        dailyEmailTime: settings.daily_email_time,
        timezone: settings.timezone,
        includeMotivation: settings.include_motivation,
        weeklySummaryEnabled: settings.weekly_summary_enabled,
        createdAt: settings.created_at,
        updatedAt: settings.updated_at,
      },
    })
  } catch (error) {
    console.error('Error saving notification settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
