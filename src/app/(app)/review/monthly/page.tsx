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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50/50 via-white to-violet-50/50" dir="rtl">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-neutral-200/50 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                <ChevronLeft size={20} className="text-neutral-500" />
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
                  <BarChart3 size={20} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-neutral-900">סיכום חודשי</h1>
                  <p className="text-xs text-neutral-500">תובנות אוטומטיות על הביצועים שלך</p>
                </div>
              </div>
            </div>

            {/* Month navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={goToPreviousMonth}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <ChevronRight size={20} className="text-neutral-500" />
              </button>
              <span className="font-semibold text-neutral-900 min-w-[120px] text-center">
                {reviewData.monthLabel}
              </span>
              <button
                onClick={goToNextMonth}
                disabled={isCurrentMonth}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={20} className="text-neutral-500" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
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
