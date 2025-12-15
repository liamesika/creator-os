'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Calendar,
  Target,
  TrendingUp,
  TrendingDown,
  Clock,
  Flame,
  Award,
  Zap,
  ArrowLeft,
  Sparkles,
} from 'lucide-react'
import Link from 'next/link'
import { useTasksStore } from '@/stores/tasksStore'
import { useCalendarStore } from '@/stores/calendarStore'
import { useGoalsStore } from '@/stores/goalsStore'
import PremiumCard from '@/components/app/PremiumCard'
import { InsightsStrip } from '@/components/app/insights/InsightsStrip'
import { useInsights } from '@/hooks/useInsights'
import { computeMonthlyReview, formatDateHebrew } from '@/lib/review/computeMonthlyReview'
import type { MonthlyReviewResult, MonthlyInsight } from '@/lib/review/computeMonthlyReview'

const MONTHS_HEBREW = [
  'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
]

export default function MonthlyReviewPage() {
  const { tasks } = useTasksStore()
  const { events } = useCalendarStore()
  const { goals } = useGoalsStore()
  const { insights } = useInsights({ scope: 'creator' })

  const today = new Date()
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth())
  const [selectedYear, setSelectedYear] = useState(today.getFullYear())

  // Compute review data
  const reviewData = useMemo(() => {
    return computeMonthlyReview({
      tasks,
      events,
      goals,
      month: selectedMonth,
      year: selectedYear,
    })
  }, [tasks, events, goals, selectedMonth, selectedYear])

  // Navigation handlers
  const goToPreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11)
      setSelectedYear(y => y - 1)
    } else {
      setSelectedMonth(m => m - 1)
    }
  }

  const goToNextMonth = () => {
    const isCurrentMonth = selectedMonth === today.getMonth() && selectedYear === today.getFullYear()
    if (isCurrentMonth) return

    if (selectedMonth === 11) {
      setSelectedMonth(0)
      setSelectedYear(y => y + 1)
    } else {
      setSelectedMonth(m => m + 1)
    }
  }

  const isCurrentMonth = selectedMonth === today.getMonth() && selectedYear === today.getFullYear()

  return (
    <div className="min-h-screen" dir="rtl">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-b from-neutral-50 via-white to-neutral-50/80 pointer-events-none" />

      <div className="relative max-w-4xl mx-auto">
        {/* HERO SECTION - Monthly Review */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="relative overflow-hidden py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 mb-6"
        >
          {/* Gradient background - indigo theme */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700" />

          {/* Abstract decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.2 }}
              className="absolute -top-32 -right-32 w-80 h-80 sm:w-[400px] sm:h-[400px] rounded-full bg-gradient-to-br from-white/10 via-white/5 to-transparent blur-3xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.4 }}
              className="absolute -bottom-24 -left-24 w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-gradient-to-tr from-purple-400/20 via-indigo-400/10 to-transparent blur-2xl"
            />
            {/* Grid overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px]" />
          </div>

          <div className="relative z-10 text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm mb-6"
            >
              <Sparkles size={14} className="text-amber-300" />
              <span className="text-sm font-medium text-white/80">תובנות אוטומטיות</span>
            </motion.div>

            {/* Main Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.1] mb-3 sm:mb-4"
            >
              סיכום חודשי
            </motion.h1>

            {/* Month Label */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-xl sm:text-2xl text-white/80 font-semibold mb-8 sm:mb-10"
            >
              {reviewData.monthLabel}
            </motion.p>

            {/* Quick Stats Row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex items-center justify-center gap-8 sm:gap-16 mb-8 sm:mb-10"
            >
              <div className="text-center">
                <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">{reviewData.stats.tasksCompleted}</p>
                <p className="text-xs sm:text-sm text-white/50 font-medium mt-1">משימות שהושלמו</p>
              </div>
              <div className="w-px h-12 bg-white/20" />
              <div className="text-center">
                <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-emerald-300">{reviewData.stats.taskCompletionRate}%</p>
                <p className="text-xs sm:text-sm text-white/50 font-medium mt-1">שיעור השלמה</p>
              </div>
              <div className="hidden sm:block w-px h-12 bg-white/20" />
              <div className="hidden sm:block text-center">
                <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-amber-300">{reviewData.stats.goalsAchieved}</p>
                <p className="text-xs sm:text-sm text-white/50 font-medium mt-1">יעדים שהושגו</p>
              </div>
            </motion.div>

            {/* Month Navigation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex items-center justify-center gap-3"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={goToPreviousMonth}
                className="p-3 bg-white/10 backdrop-blur-sm rounded-xl text-white hover:bg-white/20 transition-colors"
              >
                <ChevronRight size={20} />
              </motion.button>
              <span className="px-5 py-3 bg-white text-indigo-700 rounded-xl text-sm font-semibold shadow-lg shadow-black/25 min-w-[140px]">
                {reviewData.monthLabel}
              </span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={goToNextMonth}
                disabled={isCurrentMonth}
                className="p-3 bg-white/10 backdrop-blur-sm rounded-xl text-white hover:bg-white/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={20} />
              </motion.button>
            </motion.div>

            {/* Back Link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-6"
            >
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white/80 transition-colors"
              >
                <ArrowLeft size={16} />
                <span>חזרה לדשבורד</span>
              </Link>
            </motion.div>
          </div>
        </motion.section>

        {/* Content */}
        <div className="px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Insights Strip */}
        {insights.length > 0 && (
          <InsightsStrip
            insights={insights}
            delay={0.1}
          />
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={CheckCircle2}
            label="משימות שהושלמו"
            value={reviewData.stats.tasksCompleted}
            subValue={`מתוך ${reviewData.stats.tasksCreated}`}
            color="emerald"
            delay={0}
          />
          <StatCard
            icon={Calendar}
            label="אירועים"
            value={reviewData.stats.eventsAttended}
            subValue={`${reviewData.stats.totalEventsHours} שעות`}
            color="violet"
            delay={0.1}
          />
          <StatCard
            icon={Target}
            label="יעדים שהושגו"
            value={reviewData.stats.goalsAchieved}
            subValue={`מתוך ${reviewData.stats.goalsTotal}`}
            color="indigo"
            delay={0.2}
          />
          <StatCard
            icon={Zap}
            label="שיעור השלמה"
            value={`${reviewData.stats.taskCompletionRate}%`}
            subValue="משימות"
            color="amber"
            delay={0.3}
          />
        </div>

        {/* Insights Section */}
        {reviewData.insights.length > 0 && (
          <PremiumCard delay={0.4}>
            <div className="p-6">
              <h2 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <Award size={20} className="text-indigo-500" />
                תובנות החודש
              </h2>
              <div className="space-y-3">
                {reviewData.insights.map((insight, index) => (
                  <InsightCard key={index} insight={insight} index={index} />
                ))}
              </div>
            </div>
          </PremiumCard>
        )}

        {/* Weekly Breakdown */}
        <PremiumCard delay={0.5}>
          <div className="p-6">
            <h2 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
              <BarChart3 size={20} className="text-violet-500" />
              פילוח שבועי
            </h2>
            <div className="space-y-3">
              {reviewData.weeklyBreakdown.map((week, index) => {
                const maxValue = Math.max(
                  ...reviewData.weeklyBreakdown.map(w => w.tasksCompleted + w.eventsCount)
                )
                const percentage = maxValue > 0
                  ? ((week.tasksCompleted + week.eventsCount) / maxValue) * 100
                  : 0

                return (
                  <motion.div
                    key={week.week}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-center gap-4"
                  >
                    <span className="text-sm font-medium text-neutral-600 w-16">
                      שבוע {week.week}
                    </span>
                    <div className="flex-1 h-8 bg-neutral-100 rounded-lg overflow-hidden relative">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                        className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-lg"
                      />
                      <div className="absolute inset-0 flex items-center px-3 justify-between text-xs font-medium">
                        <span className={percentage > 30 ? 'text-white' : 'text-neutral-600'}>
                          {week.tasksCompleted} משימות
                        </span>
                        <span className={percentage > 70 ? 'text-white' : 'text-neutral-600'}>
                          {week.eventsCount} אירועים
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </PremiumCard>

        {/* Two-column section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Priority Distribution */}
          <PremiumCard delay={0.6}>
            <div className="p-6">
              <h2 className="text-lg font-bold text-neutral-900 mb-4">חלוקת עדיפויות</h2>
              <div className="space-y-3">
                {reviewData.priorityDistribution.map((item, index) => {
                  const total = reviewData.priorityDistribution.reduce((a, b) => a + b.count, 0)
                  const percentage = total > 0 ? (item.count / total) * 100 : 0
                  const colors = {
                    HIGH: { bg: 'bg-red-500', label: 'גבוהה' },
                    MEDIUM: { bg: 'bg-amber-500', label: 'בינונית' },
                    LOW: { bg: 'bg-emerald-500', label: 'נמוכה' },
                  }

                  return (
                    <div key={item.priority} className="flex items-center gap-3">
                      <span className="text-sm text-neutral-600 w-16">{colors[item.priority].label}</span>
                      <div className="flex-1 h-6 bg-neutral-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                          className={`h-full ${colors[item.priority].bg} rounded-full`}
                        />
                      </div>
                      <span className="text-sm font-medium text-neutral-900 w-8">{item.count}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </PremiumCard>

          {/* Top Categories */}
          <PremiumCard delay={0.7}>
            <div className="p-6">
              <h2 className="text-lg font-bold text-neutral-900 mb-4">קטגוריות מובילות</h2>
              {reviewData.topCategories.length === 0 ? (
                <p className="text-neutral-500 text-center py-4">אין נתונים</p>
              ) : (
                <div className="space-y-2">
                  {reviewData.topCategories.map((cat, index) => (
                    <motion.div
                      key={cat.category}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl"
                    >
                      <span className="font-medium text-neutral-900">{cat.category}</span>
                      <span className="text-sm text-violet-600 font-semibold">{cat.count}</span>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </PremiumCard>
        </div>

        {/* Busiest/Calmest Days */}
        {(reviewData.stats.busiestDay || reviewData.stats.calmestDay) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviewData.stats.busiestDay && (
              <PremiumCard delay={0.8}>
                <div className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto bg-red-100 rounded-xl flex items-center justify-center mb-3">
                    <Flame size={24} className="text-red-500" />
                  </div>
                  <h3 className="font-semibold text-neutral-900">היום העמוס ביותר</h3>
                  <p className="text-2xl font-bold text-red-600 mt-2">
                    {formatDateHebrew(reviewData.stats.busiestDay.date)}
                  </p>
                  <p className="text-sm text-neutral-500 mt-1">
                    {reviewData.stats.busiestDay.load} פריטים
                  </p>
                </div>
              </PremiumCard>
            )}

            {reviewData.stats.calmestDay && (
              <PremiumCard delay={0.9}>
                <div className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto bg-emerald-100 rounded-xl flex items-center justify-center mb-3">
                    <Clock size={24} className="text-emerald-500" />
                  </div>
                  <h3 className="font-semibold text-neutral-900">היום הרגוע ביותר</h3>
                  <p className="text-2xl font-bold text-emerald-600 mt-2">
                    {formatDateHebrew(reviewData.stats.calmestDay.date)}
                  </p>
                  <p className="text-sm text-neutral-500 mt-1">
                    {reviewData.stats.calmestDay.load} פריטים
                  </p>
                </div>
              </PremiumCard>
            )}
          </div>
        )}

        {/* Empty state */}
        {reviewData.stats.tasksCreated === 0 && reviewData.stats.eventsAttended === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 mx-auto bg-neutral-100 rounded-2xl flex items-center justify-center mb-4">
              <BarChart3 size={32} className="text-neutral-400" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">אין נתונים לחודש זה</h3>
            <p className="text-neutral-500">
              התחל להוסיף משימות ואירועים כדי לראות את הסיכום החודשי שלך
            </p>
          </motion.div>
        )}
        </div>
      </div>
    </div>
  )
}

// Stat Card Component
interface StatCardProps {
  icon: any
  label: string
  value: string | number
  subValue?: string
  color: 'emerald' | 'violet' | 'indigo' | 'amber'
  delay: number
}

function StatCard({ icon: Icon, label, value, subValue, color, delay }: StatCardProps) {
  const colors = {
    emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600', icon: 'text-emerald-500' },
    violet: { bg: 'bg-violet-100', text: 'text-violet-600', icon: 'text-violet-500' },
    indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600', icon: 'text-indigo-500' },
    amber: { bg: 'bg-amber-100', text: 'text-amber-600', icon: 'text-amber-500' },
  }

  return (
    <PremiumCard delay={delay}>
      <div className="p-4 text-center">
        <div className={`w-10 h-10 mx-auto ${colors[color].bg} rounded-xl flex items-center justify-center mb-2`}>
          <Icon size={20} className={colors[color].icon} />
        </div>
        <p className="text-2xl font-bold text-neutral-900">{value}</p>
        <p className="text-xs text-neutral-500 mt-1">{label}</p>
        {subValue && (
          <p className="text-xs text-neutral-400 mt-0.5">{subValue}</p>
        )}
      </div>
    </PremiumCard>
  )
}

// Insight Card Component
function InsightCard({ insight, index }: { insight: MonthlyInsight; index: number }) {
  const typeColors = {
    positive: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
    negative: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' },
    neutral: { bg: 'bg-neutral-50', border: 'border-neutral-200', text: 'text-neutral-700' },
  }

  const colors = typeColors[insight.type]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 + index * 0.1 }}
      className={`p-4 rounded-xl ${colors.bg} border ${colors.border}`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{insight.icon}</span>
        <div>
          <h4 className={`font-semibold ${colors.text}`}>{insight.title}</h4>
          <p className="text-sm text-neutral-600 mt-0.5">{insight.description}</p>
        </div>
      </div>
    </motion.div>
  )
}
