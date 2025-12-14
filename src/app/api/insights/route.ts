/**
 * Insights API
 * GET - Get computed insights for user/agency
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { computeInsights, computeAgencyInsights } from '@/lib/insights/computeInsights'
import type { InsightDisplay } from '@/types/insights'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'לא מאומת' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const scope = searchParams.get('scope') || 'creator'

    // Get user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('account_type, full_name')
      .eq('id', user.id)
      .single()

    const isAgency = profile?.account_type === 'agency'

    if (scope === 'agency' && !isAgency) {
      return NextResponse.json({ error: 'לא סוכנות' }, { status: 403 })
    }

    let insights: InsightDisplay[] = []

    if (scope === 'creator' || !isAgency) {
      // Get creator's tasks and events
      const [tasksRes, eventsRes, companiesRes] = await Promise.all([
        supabase.from('tasks').select('*').eq('user_id', user.id),
        supabase.from('events').select('*').eq('user_id', user.id),
        supabase.from('companies').select('id, name').eq('user_id', user.id),
      ])

      const tasks = (tasksRes.data || []).map((t: any) => ({
        id: t.id,
        userId: t.user_id,
        title: t.title,
        status: t.status,
        priority: t.priority,
        dueDate: t.due_date ? new Date(t.due_date) : undefined,
        companyId: t.company_id,
        archived: t.archived,
        createdAt: t.created_at ? new Date(t.created_at) : undefined,
        updatedAt: t.updated_at ? new Date(t.updated_at) : undefined,
      }))

      const events = (eventsRes.data || []).map((e: any) => ({
        id: e.id,
        userId: e.user_id,
        title: e.title,
        date: e.date,
        category: e.category,
        companyId: e.company_id,
        startTime: e.start_time,
        endTime: e.end_time,
        createdAt: e.created_at ? new Date(e.created_at) : undefined,
      }))

      const companies = companiesRes.data || []

      insights = computeInsights({
        tasks,
        events,
        companies,
        scope: 'creator',
      })
    } else {
      // Agency scope - get all managed creators' data
      const { data: relationships } = await supabase
        .from('agency_creator_relationships')
        .select(`
          creator_user_id,
          creator:user_profiles!agency_creator_relationships_creator_user_id_fkey(
            id,
            full_name
          )
        `)
        .eq('agency_user_id', user.id)
        .eq('status', 'active')

      if (!relationships || relationships.length === 0) {
        return NextResponse.json({ insights: [] })
      }

      const creatorIds = relationships.map((r: any) => r.creator_user_id)

      // Fetch all tasks and events for managed creators
      const [tasksRes, eventsRes] = await Promise.all([
        supabase.from('tasks').select('*').in('user_id', creatorIds),
        supabase.from('events').select('*').in('user_id', creatorIds),
      ])

      const allTasks = tasksRes.data || []
      const allEvents = eventsRes.data || []

      // Group by creator
      const creators = relationships.map((r: any) => {
        const creatorTasks = allTasks
          .filter((t: any) => t.user_id === r.creator_user_id)
          .map((t: any) => ({
            id: t.id,
            userId: t.user_id,
            title: t.title,
            status: t.status,
            priority: t.priority,
            dueDate: t.due_date ? new Date(t.due_date) : undefined,
            companyId: t.company_id,
            archived: t.archived,
            createdAt: t.created_at ? new Date(t.created_at) : undefined,
          }))

        const creatorEvents = allEvents
          .filter((e: any) => e.user_id === r.creator_user_id)
          .map((e: any) => ({
            id: e.id,
            userId: e.user_id,
            title: e.title,
            date: e.date,
            category: e.category,
            companyId: e.company_id,
          }))

        // Compute simple health status
        const overdueTasks = creatorTasks.filter((t: any) => {
          if (t.status === 'DONE' || t.archived || !t.dueDate) return false
          return new Date(t.dueDate) < new Date()
        }).length

        const today = new Date().toISOString().split('T')[0]
        const todayEvents = creatorEvents.filter((e: any) => e.date === today).length

        let healthStatus: 'calm' | 'busy' | 'overloaded' = 'calm'
        if (overdueTasks > 3 || todayEvents > 5) {
          healthStatus = 'overloaded'
        } else if (overdueTasks > 0 || todayEvents > 3) {
          healthStatus = 'busy'
        }

        return {
          id: r.creator_user_id,
          name: r.creator?.full_name || 'יוצר',
          tasks: creatorTasks,
          events: creatorEvents,
          healthStatus,
        }
      })

      insights = computeAgencyInsights(creators)
    }

    return NextResponse.json({ insights })
  } catch (error) {
    console.error('Insights GET error:', error)
    return NextResponse.json({ error: 'שגיאת שרת' }, { status: 500 })
  }
}
