'use client'

import { motion } from 'framer-motion'
import { useTasksStore } from '@/stores/tasksStore'
import { useGoalsStore } from '@/stores/goalsStore'
import { useCalendarStore } from '@/stores/calendarStore'
import { useCompaniesStore } from '@/stores/companiesStore'
import AnalyticsCard from '@/components/app/AnalyticsCard'
import {
  Flame,
  CheckCircle2,
  Calendar as CalendarIcon,
  Video,
  Building2,
  AlertTriangle,
} from 'lucide-react'

export default function RealAnalytics() {
  const { tasks, getTodayTasks, getThisWeekTasks } = useTasksStore()
  const { getWeeklyConsistency } = useGoalsStore()
  const { events } = useCalendarStore()
  const { getActiveCompanies, getExpiringContracts } = useCompaniesStore()

  // Weekly consistency: days with goals OR tasks OR events
  const calculateWeeklyConsistency = () => {
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    const daysWithActivity = new Set<string>()

    // Check goals
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      const dateString = date.toISOString().split('T')[0]

      // Check if there are events this day
      const hasEvents = events.some((event) => {
        const eventDate = new Date(event.date)
        return (
          eventDate.getDate() === date.getDate() &&
          eventDate.getMonth() === date.getMonth() &&
          eventDate.getFullYear() === date.getFullYear()
        )
      })

      // Check if there are tasks this day
      const hasTasks = tasks.some((task) => {
        if (!task.dueDate) return false
        const taskDate = new Date(task.dueDate)
        return (
          taskDate.getDate() === date.getDate() &&
          taskDate.getMonth() === date.getMonth() &&
          taskDate.getFullYear() === date.getFullYear()
        )
      })

      if (hasEvents || hasTasks) {
        daysWithActivity.add(dateString)
      }
    }

    const goalsConsistency = getWeeklyConsistency()
    const activityDays = daysWithActivity.size
    const totalConsistency = Math.max(goalsConsistency, Math.round((activityDays / 7) * 100))

    return {
      percentage: totalConsistency,
      days: activityDays,
    }
  }

  // Tasks completed today and this week
  const calculateTasksCompleted = () => {
    const todayTasks = getTodayTasks()
    const weekTasks = getThisWeekTasks()

    return {
      today: todayTasks.filter((t) => t.status === 'DONE').length,
      totalToday: todayTasks.length,
      week: weekTasks.filter((t) => t.status === 'DONE').length,
      totalWeek: weekTasks.length,
    }
  }

  // Upcoming workload: events + tasks in next 7 days
  const calculateUpcomingWorkload = () => {
    const now = new Date()
    const sevenDaysFromNow = new Date()
    sevenDaysFromNow.setDate(now.getDate() + 7)

    const upcomingEvents = events.filter((event) => {
      const eventDate = new Date(event.date)
      return eventDate >= now && eventDate <= sevenDaysFromNow
    }).length

    const upcomingTasks = tasks.filter((task) => {
      if (!task.dueDate || task.archived) return false
      const taskDate = new Date(task.dueDate)
      return taskDate >= now && taskDate <= sevenDaysFromNow
    }).length

    return upcomingEvents + upcomingTasks
  }

  // Content output: number of content events this week
  const calculateContentOutput = () => {
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)

    const contentCategories = [
      'story-upload',
      'story-shoot',
      'photo-day',
      'vlog-shoot',
      'video-edit',
      'post-upload',
    ]

    return events.filter((event) => {
      const eventDate = new Date(event.date)
      return (
        eventDate >= startOfWeek &&
        eventDate <= endOfWeek &&
        contentCategories.includes(event.category)
      )
    }).length
  }

  // Company workload: events + tasks linked to companies this week
  const calculateCompanyWorkload = () => {
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)

    const companyEvents = events.filter((event) => {
      const eventDate = new Date(event.date)
      return (
        event.companyId &&
        eventDate >= startOfWeek &&
        eventDate <= endOfWeek
      )
    }).length

    const companyTasks = tasks.filter((task) => {
      if (!task.dueDate || task.archived || !task.companyId) return false
      const taskDate = new Date(task.dueDate)
      return taskDate >= startOfWeek && taskDate <= endOfWeek
    }).length

    return companyEvents + companyTasks
  }

  const consistency = calculateWeeklyConsistency()
  const tasksCompleted = calculateTasksCompleted()
  const upcomingWorkload = calculateUpcomingWorkload()
  const contentOutput = calculateContentOutput()
  const companyWorkload = calculateCompanyWorkload()
  const activeCompanies = getActiveCompanies()
  const expiringContracts = getExpiringContracts()

  return (
    <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide snap-x snap-mandatory">
      {/* Weekly Consistency */}
      <div className="flex-shrink-0 w-[200px] sm:w-auto sm:flex-1 snap-start">
        <AnalyticsCard
          icon={Flame}
          label="עקביות שבועית"
          value={`${consistency.days}/7`}
          subValue="ימים פעילים"
          color="orange"
          chart="ring"
          chartValue={consistency.percentage}
          delay={0.1}
        />
      </div>

      {/* Tasks Completed */}
      <div className="flex-shrink-0 w-[200px] sm:w-auto sm:flex-1 snap-start">
        <AnalyticsCard
          icon={CheckCircle2}
          label="משימות הושלמו"
          value={tasksCompleted.today.toString()}
          subValue={`מתוך ${tasksCompleted.totalToday} היום`}
          color="green"
          chart="bar"
          chartValue={
            tasksCompleted.totalToday > 0
              ? Math.round((tasksCompleted.today / tasksCompleted.totalToday) * 100)
              : 0
          }
          delay={0.15}
        />
      </div>

      {/* Upcoming Workload */}
      <div className="flex-shrink-0 w-[200px] sm:w-auto sm:flex-1 snap-start">
        <AnalyticsCard
          icon={CalendarIcon}
          label="עומס 7 ימים"
          value={upcomingWorkload.toString()}
          subValue="אירועים + משימות"
          color="blue"
          delay={0.2}
        />
      </div>

      {/* Content Output */}
      <div className="flex-shrink-0 w-[200px] sm:w-auto sm:flex-1 snap-start">
        <AnalyticsCard
          icon={Video}
          label="תוכן השבוע"
          value={contentOutput.toString()}
          subValue="אירועי יצירה"
          color="purple"
          delay={0.25}
        />
      </div>

      {/* Company Workload */}
      <div className="flex-shrink-0 w-[200px] sm:w-auto sm:flex-1 snap-start">
        <AnalyticsCard
          icon={Building2}
          label="עבודת חברות"
          value={companyWorkload.toString()}
          subValue="השבוע"
          color="blue"
          delay={0.3}
        />
      </div>

      {/* Expiring Contracts */}
      <div className="flex-shrink-0 w-[200px] sm:w-auto sm:flex-1 snap-start">
        <AnalyticsCard
          icon={AlertTriangle}
          label="חוזים לחידוש"
          value={expiringContracts.length.toString()}
          subValue="ב-30 יום"
          color={expiringContracts.length > 0 ? 'orange' : 'green'}
          delay={0.35}
        />
      </div>
    </div>
  )
}
