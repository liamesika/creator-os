/**
 * Daily Digest Cron Endpoint
 * Sends daily digest emails to all users with notifications enabled
 * Should be called via cron job (e.g., Vercel Cron, Railway Cron)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail, isResendConfigured } from '@/lib/email/resend'
import { generateDailyDigestHTML, generateAgencyDigestHTML, getRandomMotivation } from '@/lib/email/templates'
import { computeHealthScore } from '@/lib/health/computeHealthScore'
import type { DailyDigestContent, AgencyDigestContent, HealthStatus } from '@/types/premium'

// Verify cron secret to prevent unauthorized access
const CRON_SECRET = process.env.CRON_SECRET

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check if Resend is configured
  if (!isResendConfigured()) {
    return NextResponse.json({
      success: false,
      error: 'Email service not configured',
      message: 'Set RESEND_API_KEY environment variable',
    }, { status: 503 })
  }

  // Initialize Supabase admin client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  const results = {
    processed: 0,
    sent: 0,
    errors: 0,
    details: [] as { userId: string; status: string; error?: string }[],
  }

  try {
    // Get all users with daily email enabled
    const { data: notificationSettings, error: settingsError } = await supabase
      .from('notification_settings')
      .select(`
        user_id,
        daily_email_enabled,
        daily_email_time,
        timezone,
        include_motivation
      `)
      .eq('daily_email_enabled', true)

    if (settingsError) {
      console.error('Failed to fetch notification settings:', settingsError)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch settings',
      }, { status: 500 })
    }

    // Get current hour in different timezones to determine who should receive email now
    const currentHour = today.getHours()

    for (const settings of notificationSettings || []) {
      results.processed++

      try {
        // Get user profile
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('id, name, email, account_type')
          .eq('id', settings.user_id)
          .single()

        if (profileError || !profile) {
          results.errors++
          results.details.push({
            userId: settings.user_id,
            status: 'error',
            error: 'Profile not found',
          })
          continue
        }

        // Check if already sent today
        const { data: existingDigest } = await supabase
          .from('daily_digest_log')
          .select('id')
          .eq('user_id', settings.user_id)
          .eq('digest_date', todayStr)
          .eq('digest_type', 'daily')
          .single()

        if (existingDigest) {
          results.details.push({
            userId: settings.user_id,
            status: 'skipped',
            error: 'Already sent today',
          })
          continue
        }

        // Generate and send digest based on account type
        if (profile.account_type === 'agency') {
          // Agency digest
          const digestContent = await generateAgencyDigestContent(supabase, profile, todayStr)
          const html = generateAgencyDigestHTML(digestContent)

          const emailResult = await sendEmail({
            to: profile.email,
            subject: `סיכום הסוכנות - ${formatDateHebrew(today)}`,
            html,
          })

          if (emailResult.success) {
            // Log the digest
            await supabase.from('daily_digest_log').insert({
              user_id: profile.id,
              digest_date: todayStr,
              digest_type: 'agency',
              sent_at: new Date().toISOString(),
              email_id: emailResult.id,
            })

            results.sent++
            results.details.push({ userId: profile.id, status: 'sent' })
          } else {
            results.errors++
            results.details.push({
              userId: profile.id,
              status: 'error',
              error: emailResult.error,
            })
          }
        } else {
          // Creator digest
          const digestContent = await generateCreatorDigestContent(
            supabase,
            profile,
            todayStr,
            settings.include_motivation
          )
          const html = generateDailyDigestHTML(digestContent)

          const emailResult = await sendEmail({
            to: profile.email,
            subject: `בוקר טוב! הסיכום היומי שלך - ${formatDateHebrew(today)}`,
            html,
          })

          if (emailResult.success) {
            // Log the digest
            await supabase.from('daily_digest_log').insert({
              user_id: profile.id,
              digest_date: todayStr,
              digest_type: 'daily',
              sent_at: new Date().toISOString(),
              email_id: emailResult.id,
            })

            results.sent++
            results.details.push({ userId: profile.id, status: 'sent' })
          } else {
            results.errors++
            results.details.push({
              userId: profile.id,
              status: 'error',
              error: emailResult.error,
            })
          }
        }
      } catch (error) {
        results.errors++
        results.details.push({
          userId: settings.user_id,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    return NextResponse.json({
      success: true,
      results,
    })
  } catch (error) {
    console.error('Daily digest cron error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      results,
    }, { status: 500 })
  }
}

// Helper to generate creator digest content
async function generateCreatorDigestContent(
  supabase: any,
  profile: { id: string; name: string; email: string },
  dateStr: string,
  includeMotivation: boolean
): Promise<DailyDigestContent> {
  const today = new Date(dateStr)

  // Get today's tasks
  const { data: tasks } = await supabase
    .from('tasks')
    .select('id, title, due_date, priority, status')
    .eq('user_id', profile.id)
    .eq('archived', false)
    .neq('status', 'DONE')
    .lte('due_date', dateStr)
    .order('priority', { ascending: false })
    .limit(10)

  // Get today's events
  const { data: events } = await supabase
    .from('calendar_events')
    .select('id, title, start_time, date')
    .eq('user_id', profile.id)
    .eq('date', dateStr)
    .order('start_time', { ascending: true })
    .limit(10)

  // Calculate health score
  const openTasks = tasks?.filter((t: any) => t.status !== 'DONE').length || 0
  const overdueTasks = tasks?.filter((t: any) => {
    if (!t.due_date) return false
    return new Date(t.due_date) < today
  }).length || 0
  const eventsToday = events?.length || 0

  // Get week events count
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - today.getDay())
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)

  const { data: weekEvents } = await supabase
    .from('calendar_events')
    .select('id')
    .eq('user_id', profile.id)
    .gte('date', weekStart.toISOString().split('T')[0])
    .lte('date', weekEnd.toISOString().split('T')[0])

  const eventsWeek = weekEvents?.length || 0

  const healthResult = computeHealthScore({
    openTasksCount: openTasks,
    overdueTasksCount: overdueTasks,
    eventsTodayCount: eventsToday,
    eventsWeekCount: eventsWeek,
    backlogPressure: Math.max(0, openTasks - 10) / 10,
    streakPressure: 0,
  })

  return {
    userId: profile.id,
    userName: profile.name,
    userEmail: profile.email,
    date: dateStr,
    topTasks: (tasks || []).map((t: any) => ({
      id: t.id,
      title: t.title,
      dueDate: t.due_date,
      priority: t.priority,
    })),
    todayEvents: (events || []).map((e: any) => ({
      id: e.id,
      title: e.title,
      time: e.start_time || '00:00',
    })),
    healthScore: healthResult.score,
    healthStatus: healthResult.status,
    healthInsight: healthResult.details.insights[0] || '',
    motivationalMessage: includeMotivation ? getRandomMotivation() : '',
  }
}

// Helper to generate agency digest content
async function generateAgencyDigestContent(
  supabase: any,
  profile: { id: string; name: string; email: string },
  dateStr: string
): Promise<AgencyDigestContent> {
  // Get agency members
  const { data: members } = await supabase
    .from('agency_memberships')
    .select(`
      creator_user_id,
      user_profiles!agency_memberships_creator_user_id_fkey (
        id,
        name,
        email
      )
    `)
    .eq('agency_id', profile.id)
    .eq('status', 'active')
    .eq('role', 'creator')

  const creatorHealthData = []

  for (const member of members || []) {
    if (!member.creator_user_id || !member.user_profiles) continue

    const creatorProfile = member.user_profiles as { id: string; name: string; email: string }

    // Get creator's tasks
    const { data: tasks } = await supabase
      .from('tasks')
      .select('id, status, due_date')
      .eq('user_id', member.creator_user_id)
      .eq('archived', false)

    const openTasks = tasks?.filter((t: any) => t.status !== 'DONE').length || 0
    const overdueTasks = tasks?.filter((t: any) => {
      if (!t.due_date || t.status === 'DONE') return false
      return new Date(t.due_date) < new Date(dateStr)
    }).length || 0

    // Simplified health calculation
    const healthScore = Math.min(100, Math.max(0, openTasks * 5 + overdueTasks * 10))
    const healthStatus: HealthStatus =
      healthScore <= 35 ? 'calm' : healthScore <= 70 ? 'busy' : 'overloaded'

    creatorHealthData.push({
      creatorId: member.creator_user_id,
      creatorName: creatorProfile.name,
      creatorEmail: creatorProfile.email,
      score: healthScore,
      status: healthStatus,
      insights: [],
    })
  }

  const overloadedCreators = creatorHealthData.filter(c => c.status === 'overloaded')
  const busyCreators = creatorHealthData.filter(c => c.status === 'busy')

  return {
    agencyId: profile.id,
    agencyName: profile.name,
    agencyEmail: profile.email,
    date: dateStr,
    totalCreators: creatorHealthData.length,
    overloadedCreators,
    busyCreators,
    weeklyTrend: 'stable', // Would need historical data to calculate
  }
}

// Helper to format date in Hebrew
function formatDateHebrew(date: Date): string {
  return date.toLocaleDateString('he-IL', {
    day: 'numeric',
    month: 'long',
  })
}
