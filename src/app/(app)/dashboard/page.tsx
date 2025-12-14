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

      <div className="relative p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Top Section - Greeting & Quick Actions */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Greeting */}
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-100 via-orange-100 to-amber-50 flex items-center justify-center shadow-sm"
              >
                <GreetingIcon size={26} className="text-amber-600" strokeWidth={1.5} />
              </motion.div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
                  {getGreeting()}, {firstName}
                </h1>
                <p className="text-neutral-500 text-sm mt-0.5">{formatDate()}</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              {[
                { icon: CalendarDays, label: 'אירוע', color: 'bg-blue-50 text-blue-600 hover:bg-blue-100', href: '/calendar' },
                { icon: Building2, label: 'חברה', color: 'bg-violet-50 text-violet-600 hover:bg-violet-100', href: '/companies' },
                { icon: Target, label: 'מטרה', color: 'bg-accent-50 text-accent-600 hover:bg-accent-100', href: '/goals' },
              ].map((action, i) => (
                <Link key={action.label} href={action.href}>
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${action.color}`}
                  >
                    <action.icon size={16} strokeWidth={2} />
                    <span>{action.label}</span>
                  </motion.button>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Analytics Strip */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={18} className="text-neutral-400" strokeWidth={2} />
            <h2 className="text-sm font-semibold text-neutral-500">סטטיסטיקות מהירות</h2>
          </div>

          {/* Horizontal scroll on mobile */}
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide snap-x snap-mandatory">
            <div className="flex-shrink-0 w-[200px] sm:w-auto sm:flex-1 snap-start">
              <AnalyticsCard
                icon={Flame}
                label="עקביות שבועית"
                value="5/7"
                subValue="ימים פעילים"
                color="orange"
                chart="ring"
                chartValue={71}
                delay={0.1}
              />
            </div>
            <div className="flex-shrink-0 w-[200px] sm:w-auto sm:flex-1 snap-start">
              <AnalyticsCard
                icon={Building2}
                label="חברות פעילות"
                value={activeCompanies.length.toString()}
                subValue="חברות"
                color="blue"
                chart="bar"
                chartValue={activeCompanies.length > 0 ? 80 : 20}
                delay={0.15}
              />
            </div>
            <div className="flex-shrink-0 w-[200px] sm:w-auto sm:flex-1 snap-start">
              <AnalyticsCard
                icon={AlertTriangle}
                label="חוזים לחידוש"
                value={expiringContracts.length.toString()}
                subValue="ב-30 יום"
                color={expiringContracts.length > 0 ? 'orange' : 'green'}
                delay={0.2}
              />
            </div>
            <div className="flex-shrink-0 w-[200px] sm:w-auto sm:flex-1 snap-start">
              <AnalyticsCard
                icon={Briefcase}
                label="ריטיינרים חודשיים"
                value={totalRetainers > 0 ? formatCurrency(totalRetainers, 'ILS') : '0'}
                subValue="סה״כ"
                color="purple"
                chart="sparkline"
                delay={0.25}
              />
            </div>
          </div>
        </motion.div>

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
            {/* Brand Work Card */}
            <motion.div variants={itemVariants}>
              <PremiumCard delay={0.3}>
                <div className="p-5 sm:p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-violet-50 flex items-center justify-center">
                        <Building2 size={18} className="text-violet-600" strokeWidth={2} />
                      </div>
                      <div>
                        <h2 className="font-semibold text-neutral-900">עבודה עם מותגים</h2>
                        <p className="text-xs text-neutral-400">{companyEventsThisWeek.length} אירועים השבוע</p>
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
                    <div className="text-center py-8">
                      <Building2 size={48} className="text-neutral-300 mx-auto mb-4" />
                      <h3 className="text-lg font-bold text-neutral-900 mb-2">
                        אין אירועים מקושרים למותגים
                      </h3>
                      <p className="text-neutral-600 mb-6">
                        קשר אירועים לחברות כדי לעקוב אחרי העבודה
                      </p>
                      <Link
                        href="/companies"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors"
                      >
                        <Plus size={20} />
                        הוסף חברה
                      </Link>
                    </div>
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

            {/* Goals Card */}
            <motion.div variants={itemVariants}>
              <PremiumCard delay={0.35}>
                <div className="p-5 sm:p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-100 to-accent-50 flex items-center justify-center">
                        <Target size={18} className="text-accent-600" strokeWidth={2} />
                      </div>
                      <div>
                        <h2 className="font-semibold text-neutral-900">המטרות של היום</h2>
                        <p className="text-xs text-neutral-400">
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
                    <div className="text-center py-8">
                      <Target size={48} className="text-neutral-300 mx-auto mb-4" />
                      <h3 className="text-lg font-bold text-neutral-900 mb-2">
                        עוד לא הוגדרו מטרות להיום
                      </h3>
                      <p className="text-neutral-600 mb-6">
                        בחרי 1-3 מטרות כדי להתחיל חד
                      </p>
                      <Link
                        href="/goals"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-accent-600 text-white rounded-xl font-bold hover:bg-accent-700 transition-colors"
                      >
                        <Plus size={20} />
                        הוסף מטרה
                      </Link>
                    </div>
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

            {/* Tasks Card */}
            <motion.div variants={itemVariants}>
              <PremiumCard delay={0.4}>
                <div className="p-5 sm:p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center">
                        <CheckSquare size={18} className="text-emerald-600" strokeWidth={2} />
                      </div>
                      <div>
                        <h2 className="font-semibold text-neutral-900">משימות להיום</h2>
                        <p className="text-xs text-neutral-400">
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
                    <div className="text-center py-8">
                      <CheckSquare size={48} className="text-neutral-300 mx-auto mb-4" />
                      <h3 className="text-lg font-bold text-neutral-900 mb-2">
                        היום עדיין ריק
                      </h3>
                      <p className="text-neutral-600 mb-6">
                        נוסיף משימה ראשונה ונבנה שגרה
                      </p>
                      <Link
                        href="/tasks"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors"
                      >
                        <Plus size={20} />
                        הוסף משימה
                      </Link>
                    </div>
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
            {/* Health Score Card */}
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

            {/* Focus Mode CTA */}
            <motion.div variants={itemVariants}>
              <Link href="/focus">
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-5 cursor-pointer shadow-xl shadow-indigo-600/20"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                  <div className="relative z-10 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                      <Focus size={24} className="text-white" />
                    </div>
                    <div className="text-white">
                      <h3 className="font-bold text-lg">מצב פוקוס</h3>
                      <p className="text-white/80 text-sm">התחל את היום המרוכז שלך</p>
                    </div>
                    <ChevronLeft size={20} className="text-white/60 mr-auto" />
                  </div>
                </motion.div>
              </Link>
            </motion.div>

            {/* Calendar Preview */}
            <motion.div variants={itemVariants}>
              <PremiumCard delay={0.45}>
                <div className="p-5 sm:p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                        <CalendarDays size={18} className="text-blue-600" strokeWidth={2} />
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

                  <div className="text-center py-8">
                    <CalendarDays size={48} className="text-neutral-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-neutral-900 mb-2">
                      אין אירועים קרובים
                    </h3>
                    <p className="text-neutral-600 mb-6">
                      זה זמן טוב לתכנן קדימה
                    </p>
                    <Link
                      href="/calendar"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
                    >
                      <Plus size={20} />
                      הוסף אירוע
                    </Link>
                  </div>
                </div>
              </PremiumCard>
            </motion.div>

            {/* Companies Overview */}
            {activeCompanies.length > 0 && (
              <motion.div variants={itemVariants}>
                <PremiumCard delay={0.5}>
                  <div className="p-5 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-violet-50 flex items-center justify-center">
                          <Building2 size={18} className="text-violet-600" strokeWidth={2} />
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

            {/* Expiring Contracts Warning */}
            {expiringContracts.length > 0 && (
              <motion.div variants={itemVariants}>
                <PremiumCard delay={0.55}>
                  <div className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <AlertTriangle size={18} className="text-amber-600" strokeWidth={2} />
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

            {/* Recent Activity */}
            {recentActivity.length > 0 && (
              <motion.div variants={itemVariants}>
                <PremiumCard delay={0.6}>
                  <div className="p-5 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center">
                          <Clock size={18} className="text-purple-600" strokeWidth={2} />
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

            {/* AI Tip */}
            <motion.div variants={itemVariants}>
              <PremiumCard delay={0.65}>
                <div className="p-5 bg-gradient-to-br from-accent-50/50 via-white to-violet-50/30">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-violet-500 flex items-center justify-center flex-shrink-0">
                      <Sparkles size={18} className="text-white" strokeWidth={2} />
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

      {/* Mobile FAB */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, type: 'spring' }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="sm:hidden fixed bottom-24 left-4 w-14 h-14 bg-neutral-900 text-white rounded-2xl shadow-xl shadow-neutral-900/30 flex items-center justify-center z-40"
      >
        <Plus size={24} strokeWidth={2} />
      </motion.button>
    </motion.div>
  )
}
