'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Target,
  CheckSquare,
  CalendarDays,
  TrendingUp,
  Plus,
  Sparkles,
  Sun,
  Moon,
  Sunrise,
  Zap,
  BarChart3,
  Clock,
  Flame,
  FileText,
  ChevronLeft,
  Building2,
  AlertTriangle,
  Briefcase,
  Focus,
  ArrowLeft,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useCompaniesStore } from '@/stores/companiesStore'
import { useCalendarStore } from '@/stores/calendarStore'
import { useActivityStore } from '@/stores/activityStore'
import { useGoalsStore } from '@/stores/goalsStore'
import { useTasksStore } from '@/stores/tasksStore'
import { getTodayDateString } from '@/types/goal'
import { CATEGORY_PRESETS } from '@/types/calendar'
import { BRAND_TYPE_PRESETS, formatCurrency } from '@/types/company'
import { ACTIVITY_CONFIGS } from '@/types/activity'
import { formatRelativeTime } from '@/lib/format-time'
import PremiumCard from '@/components/app/PremiumCard'
import AnalyticsCard from '@/components/app/AnalyticsCard'
import PremiumEmptyState from '@/components/app/PremiumEmptyState'
import HealthScoreCard from '@/components/app/HealthScoreCard'
import { InsightsStrip } from '@/components/app/insights/InsightsStrip'
import { useHealthScore } from '@/hooks/useHealthScore'
import { useInsights } from '@/hooks/useInsights'

// Get greeting based on time
const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'בוקר טוב'
  if (hour < 17) return 'צהריים טובים'
  if (hour < 21) return 'ערב טוב'
  return 'לילה טוב'
}

const getGreetingIcon = () => {
  const hour = new Date().getHours()
  if (hour < 6) return Moon
  if (hour < 12) return Sunrise
  if (hour < 18) return Sun
  return Moon
}

// Format date in Hebrew
const formatDate = () => {
  const date = new Date()
  const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']
  const months = [
    'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
    'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
  ]
  return `יום ${days[date.getDay()]}, ${date.getDate()} ב${months[date.getMonth()]}`
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
}

export default function DashboardPage() {
  const { user } = useAuth()
  const {
    getActiveCompanies,
    getExpiringContracts,
    getTotalMonthlyRetainers,
  } = useCompaniesStore()
  const {
    getUpcomingCompanyEvents,
    getCompanyEventsThisWeek,
  } = useCalendarStore()
  const { companies } = useCompaniesStore()
  const { events: activityEvents, fetchEvents } = useActivityStore()
  const { health, isLoading: healthLoading } = useHealthScore()
  const { insights, isLoading: insightsLoading } = useInsights({ scope: 'creator' })
  const { goals, getGoalForDate } = useGoalsStore()
  const { tasks, getTodayTasks, getOverdueTasks } = useTasksStore()

  useEffect(() => {
    if (user?.id) {
      fetchEvents()
    }
  }, [user?.id, fetchEvents])

  const GreetingIcon = getGreetingIcon()
  const firstName = user?.name?.split(' ')[0] || 'משתמש'

  // Companies analytics
  const activeCompanies = getActiveCompanies()
  const expiringContracts = getExpiringContracts()
  const totalRetainers = getTotalMonthlyRetainers()
  const companyEventsThisWeek = getCompanyEventsThisWeek()
  const upcomingBrandEvents = getUpcomingCompanyEvents(5)

  // Recent activity (last 5)
  const recentActivity = activityEvents.slice(0, 5)

  // Today's goals
  const todayGoal = getGoalForDate(getTodayDateString())
  const todayGoalItems = todayGoal?.items || []

  // Today's tasks and overdue
  const todayTasks = getTodayTasks()
  const overdueTasks = getOverdueTasks()
  const upcomingTasks = [...overdueTasks, ...todayTasks.filter(t => t.status !== 'DONE')].slice(0, 5)

  const getCompanyName = (companyId: string | undefined | null): string => {
    if (!companyId) return ''
    const company = companies.find(c => c.id === companyId)
    return company?.name || ''
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="min-h-screen"
    >
      {/* Subtle background gradient */}
      <div className="fixed inset-0 bg-gradient-to-b from-neutral-50 via-white to-neutral-50/80 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">
        {/* HERO SECTION - Emotional Entry Point */}
        <motion.section
          variants={itemVariants}
          className="relative overflow-hidden py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 mb-6"
        >
          {/* Abstract background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 sm:w-[500px] sm:h-[500px] rounded-full bg-gradient-to-br from-accent-200/30 via-violet-200/20 to-transparent blur-3xl" />
            <div className="absolute -bottom-32 -left-32 w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-gradient-to-tr from-amber-200/25 via-orange-200/15 to-transparent blur-2xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-2xl max-h-96 rounded-full bg-gradient-to-r from-blue-100/10 via-violet-100/10 to-accent-100/10 blur-3xl" />
          </div>

          <div className="relative z-10 text-center">
            {/* Greeting Icon Badge */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-amber-100 via-orange-100 to-amber-50 shadow-lg shadow-amber-500/20 mb-6 sm:mb-8"
            >
              <GreetingIcon size={32} className="text-amber-600 sm:w-10 sm:h-10" strokeWidth={1.5} />
            </motion.div>

            {/* Main Greeting - Large Typography */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 tracking-tight leading-[1.1] mb-3 sm:mb-4"
            >
              {getGreeting()}, {firstName}
            </motion.h1>

            {/* Date subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="text-base sm:text-lg text-neutral-500 mb-8 sm:mb-10"
            >
              {formatDate()}
            </motion.p>

            {/* Quick Stats Row - Signature Element */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="flex items-center justify-center gap-8 sm:gap-16 mb-8 sm:mb-10"
            >
              <div className="text-center">
                <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900">{activeCompanies.length}</p>
                <p className="text-xs sm:text-sm text-neutral-500 font-medium mt-1">חברות פעילות</p>
              </div>
              <div className="w-px h-12 bg-neutral-200" />
              <div className="text-center">
                <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-emerald-600">
                  {totalRetainers > 0 ? formatCurrency(totalRetainers, 'ILS') : '₪0'}
                </p>
                <p className="text-xs sm:text-sm text-neutral-500 font-medium mt-1">ריטיינר חודשי</p>
              </div>
              <div className="hidden sm:block w-px h-12 bg-neutral-200" />
              <div className="hidden sm:block text-center">
                <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-violet-600">
                  {todayGoalItems.filter(g => g.status === 'DONE').length}/{todayGoalItems.length || 0}
                </p>
                <p className="text-xs sm:text-sm text-neutral-500 font-medium mt-1">מטרות היום</p>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.55 }}
              className="flex items-center justify-center gap-3"
            >
              <Link href="/focus">
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-xl text-sm font-semibold shadow-lg shadow-neutral-900/25 hover:bg-neutral-800 transition-all"
                >
                  <Focus size={18} />
                  <span>התחל מצב פוקוס</span>
                </motion.button>
              </Link>
              <Link href="/calendar">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="hidden sm:flex items-center gap-2 px-5 py-3 bg-white text-neutral-700 rounded-xl text-sm font-semibold border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 transition-all"
                >
                  <CalendarDays size={18} />
                  <span>פתח יומן</span>
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </motion.section>

        {/* Rest of content with padding */}
        <div className="px-4 sm:px-6 lg:px-8">

        {/* Insights Strip */}
        {insights.length > 0 && (
          <motion.div variants={itemVariants} className="mb-8">
            <InsightsStrip
              insights={insights}
              loading={insightsLoading}
              delay={0.25}
            />
          </motion.div>
        )}

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Today's Focus */}
          <div className="lg:col-span-2 space-y-6">
            {/* Brand Work Card - Secondary tier */}
            <motion.div variants={itemVariants}>
              <PremiumCard delay={0.3} tier="secondary">
                <div className="p-5 sm:p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-100 via-violet-50 to-white flex items-center justify-center shadow-[0_2px_8px_-2px_rgba(139,92,246,0.2)]">
                        <Building2 size={18} className="text-violet-600 drop-shadow-sm" strokeWidth={2} />
                      </div>
                      <div>
                        <h2 className="font-semibold text-neutral-900 tracking-tight">עבודה עם מותגים</h2>
                        <p className="text-xs text-neutral-500">{companyEventsThisWeek.length} אירועים השבוע</p>
                      </div>
                    </div>
                    <Link href="/companies">
                      <motion.button
                        whileHover={{ x: -2 }}
                        className="flex items-center gap-1 text-sm text-accent-600 hover:text-accent-700"
                      >
                        כל החברות
                        <ChevronLeft size={16} />
                      </motion.button>
                    </Link>
                  </div>

                  {upcomingBrandEvents.length === 0 ? (
                    <Link href="/companies">
                      <PremiumEmptyState
                        icon={Building2}
                        title="אין אירועים מקושרים למותגים"
                        description="קשר אירועים לחברות כדי לעקוב אחרי העבודה"
                        subtitle="זה יהפוך את הניהול לקל יותר"
                        actionLabel="הוסף חברה"
                        onAction={() => {}}
                        color="purple"
                      />
                    </Link>
                  ) : (
                    <div className="space-y-3">
                      {upcomingBrandEvents.map((event, index) => {
                        const categoryPreset = CATEGORY_PRESETS[event.category]
                        const CategoryIcon = categoryPreset.icon
                        const companyName = getCompanyName(event.companyId)

                        return (
                          <motion.div
                            key={event.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * index }}
                            className="flex items-center gap-3 p-3 bg-neutral-50 hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer"
                          >
                            <div className={`p-2 rounded-lg ${categoryPreset.bgColor}`}>
                              <CategoryIcon size={16} className={categoryPreset.color} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-neutral-800 truncate">
                                  {event.title}
                                </p>
                                {companyName && (
                                  <span className="text-[10px] font-medium text-violet-600 bg-violet-100 px-1.5 py-0.5 rounded flex-shrink-0">
                                    {companyName}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-neutral-500 mt-0.5">
                                <Clock size={12} />
                                <span>
                                  {new Date(event.date).toLocaleDateString('he-IL', { weekday: 'short', day: 'numeric', month: 'short' })}
                                  {' | '}
                                  {event.startTime}
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </PremiumCard>
            </motion.div>

            {/* Goals Card - Primary tier (important daily item) */}
            <motion.div variants={itemVariants}>
              <PremiumCard delay={0.35} tier="primary">
                <div className="p-5 sm:p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-accent-100 via-accent-50 to-white flex items-center justify-center shadow-[0_2px_8px_-2px_rgba(168,85,247,0.2)]">
                        <Target size={18} className="text-accent-600 drop-shadow-sm" strokeWidth={2} />
                      </div>
                      <div>
                        <h2 className="font-semibold text-neutral-900 tracking-tight">המטרות של היום</h2>
                        <p className="text-xs text-neutral-500">
                          {todayGoalItems.length > 0
                            ? `${todayGoalItems.filter(g => g.status === 'DONE').length}/${todayGoalItems.length} הושלמו`
                            : 'הגדר 1-3 מטרות'
                          }
                        </p>
                      </div>
                    </div>
                    <Link href="/goals">
                      <motion.button
                        whileHover={{ x: -2 }}
                        className="flex items-center gap-1 text-sm text-accent-600 hover:text-accent-700"
                      >
                        כל המטרות
                        <ChevronLeft size={16} />
                      </motion.button>
                    </Link>
                  </div>

                  {todayGoalItems.length === 0 ? (
                    <Link href="/goals">
                      <PremiumEmptyState
                        icon={Target}
                        title="עוד לא הוגדרו מטרות להיום"
                        description="בחרי 1-3 מטרות כדי להתחיל חד"
                        subtitle="מטרות ברורות מייצרות יום ממוקד"
                        actionLabel="הוסף מטרה"
                        onAction={() => {}}
                        color="accent"
                      />
                    </Link>
                  ) : (
                    <div className="space-y-2">
                      {todayGoalItems.map((goal, index) => {
                        const statusConfig = {
                          DONE: { icon: '✅', bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'הושלם' },
                          PARTIAL: { icon: '🔄', bg: 'bg-amber-50', text: 'text-amber-700', label: 'חלקי' },
                          NOT_DONE: { icon: '⏳', bg: 'bg-neutral-50', text: 'text-neutral-600', label: 'לא הושלם' },
                        }
                        const config = statusConfig[goal.status]

                        return (
                          <motion.div
                            key={goal.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * index }}
                            className={`flex items-center gap-3 p-3 ${config.bg} rounded-xl`}
                          >
                            <span className="text-lg flex-shrink-0">{config.icon}</span>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium ${config.text} truncate`}>
                                {goal.title}
                              </p>
                            </div>
                            <span className={`text-xs ${config.text} font-medium flex-shrink-0`}>
                              {config.label}
                            </span>
                          </motion.div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </PremiumCard>
            </motion.div>

            {/* Tasks Card - Primary tier (important daily item) */}
            <motion.div variants={itemVariants}>
              <PremiumCard delay={0.4} tier="primary">
                <div className="p-5 sm:p-7">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-100 via-emerald-50 to-white flex items-center justify-center shadow-[0_2px_8px_-2px_rgba(16,185,129,0.25)]">
                        <CheckSquare size={18} className="text-emerald-600 drop-shadow-sm" strokeWidth={2} />
                      </div>
                      <div>
                        <h2 className="font-semibold text-neutral-900 tracking-tight">משימות להיום</h2>
                        <p className="text-xs text-neutral-500">
                          {upcomingTasks.length > 0
                            ? `${upcomingTasks.length} משימות פתוחות${overdueTasks.length > 0 ? ` (${overdueTasks.length} באיחור)` : ''}`
                            : '0 משימות פתוחות'
                          }
                        </p>
                      </div>
                    </div>
                    <Link href="/tasks">
                      <motion.button
                        whileHover={{ x: -2 }}
                        className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700"
                      >
                        כל המשימות
                        <ChevronLeft size={16} />
                      </motion.button>
                    </Link>
                  </div>

                  {upcomingTasks.length === 0 ? (
                    <Link href="/tasks">
                      <PremiumEmptyState
                        icon={CheckSquare}
                        title="היום עדיין ריק"
                        description="נוסיף משימה ראשונה ונבנה שגרה"
                        subtitle="התחלה קטנה מובילה להישגים גדולים"
                        actionLabel="הוסף משימה"
                        onAction={() => {}}
                        color="green"
                      />
                    </Link>
                  ) : (
                    <div className="space-y-2">
                      {upcomingTasks.map((task, index) => {
                        const isOverdue = overdueTasks.some(t => t.id === task.id)
                        const statusConfig = {
                          TODO: { icon: '📋', bg: 'bg-neutral-50', text: 'text-neutral-700' },
                          DOING: { icon: '🔄', bg: 'bg-blue-50', text: 'text-blue-700' },
                          DONE: { icon: '✅', bg: 'bg-emerald-50', text: 'text-emerald-700' },
                        }
                        const priorityConfig = {
                          HIGH: { label: 'גבוה', color: 'text-red-600 bg-red-50' },
                          MEDIUM: { label: 'בינוני', color: 'text-amber-600 bg-amber-50' },
                          LOW: { label: 'נמוך', color: 'text-neutral-500 bg-neutral-100' },
                        }
                        const config = statusConfig[task.status]
                        const priorityStyle = priorityConfig[task.priority]
                        const companyName = getCompanyName(task.companyId)

                        return (
                          <motion.div
                            key={task.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * index }}
                            className={`flex items-center gap-3 p-3 ${isOverdue ? 'bg-red-50 border border-red-200' : config.bg} rounded-xl`}
                          >
                            <span className="text-lg flex-shrink-0">{isOverdue ? '⚠️' : config.icon}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className={`text-sm font-medium ${isOverdue ? 'text-red-700' : config.text} truncate`}>
                                  {task.title}
                                </p>
                                {companyName && (
                                  <span className="text-[10px] font-medium text-violet-600 bg-violet-100 px-1.5 py-0.5 rounded flex-shrink-0">
                                    {companyName}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${priorityStyle.color}`}>
                                  {priorityStyle.label}
                                </span>
                                {isOverdue && (
                                  <span className="text-[10px] text-red-600 font-medium">באיחור</span>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </PremiumCard>
            </motion.div>
          </div>

          {/* Right Column - Calendar & Progress */}
          <div className="space-y-6">
            {/* Health Score Card - Primary tier (signature element) */}
            {health && !healthLoading && (
              <motion.div variants={itemVariants}>
                <HealthScoreCard
                  score={health.score}
                  status={health.status}
                  statusLabel={health.statusLabel}
                  insights={health.details.insights}
                  delay={0.3}
                />
              </motion.div>
            )}

            {/* Calendar Preview - Secondary tier */}
            <motion.div variants={itemVariants}>
              <PremiumCard delay={0.45} tier="secondary">
                <div className="p-5 sm:p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-100 via-blue-50 to-white flex items-center justify-center shadow-[0_2px_8px_-2px_rgba(59,130,246,0.2)]">
                        <CalendarDays size={18} className="text-blue-600 drop-shadow-sm" strokeWidth={2} />
                      </div>
                      <div>
                        <h2 className="font-semibold text-neutral-900">אירועים קרובים</h2>
                        <p className="text-xs text-neutral-400">היום</p>
                      </div>
                    </div>
                    <Link href="/calendar">
                      <motion.button
                        whileHover={{ x: -2 }}
                        className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                      >
                        <ChevronLeft size={18} className="text-neutral-400" strokeWidth={2} />
                      </motion.button>
                    </Link>
                  </div>

                  <Link href="/calendar">
                    <PremiumEmptyState
                      icon={CalendarDays}
                      title="אין אירועים קרובים"
                      description="זה זמן טוב לתכנן קדימה"
                      subtitle="יומן מאורגן מפנה מקום ליצירתיות"
                      actionLabel="הוסף אירוע"
                      onAction={() => {}}
                      color="blue"
                    />
                  </Link>
                </div>
              </PremiumCard>
            </motion.div>

            {/* Companies Overview - Tertiary tier */}
            {activeCompanies.length > 0 && (
              <motion.div variants={itemVariants}>
                <PremiumCard delay={0.5} tier="tertiary">
                  <div className="p-5 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-100 via-violet-50 to-white flex items-center justify-center shadow-[0_2px_8px_-2px_rgba(139,92,246,0.2)]">
                          <Building2 size={18} className="text-violet-600 drop-shadow-sm" strokeWidth={2} />
                        </div>
                        <div>
                          <h2 className="font-semibold text-neutral-900">החברות שלי</h2>
                          <p className="text-xs text-neutral-400">{activeCompanies.length} חברות פעילות</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {activeCompanies.slice(0, 4).map((company) => {
                        const brandPreset = company.brandType ? BRAND_TYPE_PRESETS[company.brandType] : null
                        const BrandIcon = brandPreset?.icon || Building2

                        return (
                          <div
                            key={company.id}
                            className="flex items-center gap-3 p-2.5 hover:bg-neutral-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <div className={`p-1.5 rounded-lg ${brandPreset?.bgColor || 'bg-neutral-100'}`}>
                              <BrandIcon size={14} className={brandPreset?.color || 'text-neutral-500'} />
                            </div>
                            <span className="text-sm font-medium text-neutral-700 truncate flex-1">
                              {company.name}
                            </span>
                            {company.paymentTerms.monthlyRetainerAmount && (
                              <span className="text-xs text-emerald-600 font-medium">
                                {formatCurrency(company.paymentTerms.monthlyRetainerAmount, company.paymentTerms.currency)}
                              </span>
                            )}
                          </div>
                        )
                      })}
                    </div>

                    {activeCompanies.length > 4 && (
                      <Link href="/companies">
                        <button className="w-full mt-3 text-sm text-accent-600 hover:text-accent-700 font-medium">
                          הצג את כל {activeCompanies.length} החברות
                        </button>
                      </Link>
                    )}
                  </div>
                </PremiumCard>
              </motion.div>
            )}

            {/* Expiring Contracts Warning - Secondary tier (attention) */}
            {expiringContracts.length > 0 && (
              <motion.div variants={itemVariants}>
                <PremiumCard delay={0.55} tier="secondary">
                  <div className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100">
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-100 via-amber-50 to-white flex items-center justify-center flex-shrink-0 shadow-[0_2px_8px_-2px_rgba(245,158,11,0.25)]">
                        <AlertTriangle size={18} className="text-amber-600 drop-shadow-sm" strokeWidth={2} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-800 mb-1">חוזים לחידוש</h3>
                        <p className="text-sm text-neutral-600 mb-3">
                          {expiringContracts.length} חוזים פגים ב-30 יום הקרובים
                        </p>
                        <div className="space-y-1">
                          {expiringContracts.slice(0, 3).map((company) => (
                            <p key={company.id} className="text-xs text-amber-700">
                              {company.name}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </PremiumCard>
              </motion.div>
            )}

            {/* Recent Activity - Tertiary tier */}
            {recentActivity.length > 0 && (
              <motion.div variants={itemVariants}>
                <PremiumCard delay={0.6} tier="tertiary">
                  <div className="p-5 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-100 via-purple-50 to-white flex items-center justify-center shadow-[0_2px_8px_-2px_rgba(147,51,234,0.2)]">
                          <Clock size={18} className="text-purple-600 drop-shadow-sm" strokeWidth={2} />
                        </div>
                        <div>
                          <h2 className="font-semibold text-neutral-900">פעילות אחרונה</h2>
                          <p className="text-xs text-neutral-400">עדכונים אחרונים</p>
                        </div>
                      </div>
                      <Link href="/activity">
                        <motion.button
                          whileHover={{ x: -2 }}
                          className="flex items-center gap-1 text-sm text-accent-600 hover:text-accent-700"
                        >
                          הכל
                          <ChevronLeft size={16} />
                        </motion.button>
                      </Link>
                    </div>

                    <div className="space-y-2">
                      {recentActivity.map((event, index) => {
                        const config = ACTIVITY_CONFIGS[event.type]
                        const link = config.getLink?.(event)

                        const ActivityContent = (
                          <div className="flex items-start gap-3 p-2.5 hover:bg-neutral-50 rounded-lg transition-colors">
                            <div className="text-lg flex-shrink-0">{config.icon}</div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-neutral-900 truncate">
                                {config.getDescription(event)}
                              </p>
                              <p className="text-xs text-neutral-400 mt-0.5">
                                {formatRelativeTime(event.createdAt)}
                              </p>
                            </div>
                          </div>
                        )

                        return link ? (
                          <Link key={event.id} href={link}>
                            {ActivityContent}
                          </Link>
                        ) : (
                          <div key={event.id}>{ActivityContent}</div>
                        )
                      })}
                    </div>
                  </div>
                </PremiumCard>
              </motion.div>
            )}

            {/* AI Tip - Tertiary tier */}
            <motion.div variants={itemVariants}>
              <PremiumCard delay={0.65} tier="tertiary">
                <div className="p-5 bg-gradient-to-br from-accent-50/50 via-white to-violet-50/30">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-accent-500 via-violet-500 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-[0_4px_12px_-2px_rgba(139,92,246,0.35)]">
                      <Sparkles size={18} className="text-white drop-shadow-sm" strokeWidth={2} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-800 mb-1">טיפ מה-AI</h3>
                      <p className="text-sm text-neutral-600 leading-relaxed">
                        {activeCompanies.length === 0
                          ? 'הוסיפי את החברות והמותגים שאת עובדת איתם כדי לעקוב אחרי עבודה, חוזים ותשלומים.'
                          : 'זכרי לבדוק את תוקף החוזים שלך ולעדכן את תנאי התשלום כשצריך.'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </PremiumCard>
            </motion.div>
          </div>
        </div>
        </div>
      </div>

      {/* Mobile FAB - Enhanced with premium styling */}
      <motion.button
        initial={{ opacity: 0, scale: 0, rotate: -90 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ delay: 0.6, type: 'spring', stiffness: 200, damping: 15 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className="sm:hidden fixed bottom-24 left-4 w-14 h-14 bg-gradient-to-br from-neutral-800 to-neutral-900 text-white rounded-2xl shadow-[0_8px_24px_-4px_rgba(0,0,0,0.3),0_4px_8px_-2px_rgba(0,0,0,0.2)] flex items-center justify-center z-40"
      >
        {/* Inner glow effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
        <Plus size={24} strokeWidth={2.5} className="relative z-10" />
      </motion.button>
    </motion.div>
  )
}
