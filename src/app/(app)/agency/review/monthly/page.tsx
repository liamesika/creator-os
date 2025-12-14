'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Calendar,
  Target,
  Users,
  TrendingUp,
  Award,
  Building2,
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import PremiumCard from '@/components/app/PremiumCard'

interface CreatorMonthlyStats {
  creatorId: string
  creatorName: string
  avatarUrl?: string
  tasksCompleted: number
  tasksCreated: number
  taskCompletionRate: number
  eventsCount: number
  goalsAchieved: number
  goalsTotal: number
}

interface AgencyMonthlyData {
  totalTasksCompleted: number
  totalEventsCount: number
  totalGoalsAchieved: number
  averageCompletionRate: number
  topPerformers: CreatorMonthlyStats[]
  creatorStats: CreatorMonthlyStats[]
}

const MONTHS_HEBREW = [
  'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
]

export default function AgencyMonthlyReviewPage() {
  const today = new Date()
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth())
  const [selectedYear, setSelectedYear] = useState(today.getFullYear())
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<AgencyMonthlyData | null>(null)
  const [expandedCreator, setExpandedCreator] = useState<string | null>(null)

  // Fetch data
  useEffect(() => {
    fetchMonthlyData()
  }, [selectedMonth, selectedYear])

  const fetchMonthlyData = async () => {
    setLoading(true)
    try {
      // In a real implementation, this would fetch from an API
      // For now, we'll generate mock data based on agency creators
      const creatorsRes = await fetch('/api/agency/creators')
      const creatorsData = await creatorsRes.json()

      if (creatorsData.creators) {
        // Generate deterministic stats for each creator
        const creatorStats: CreatorMonthlyStats[] = creatorsData.creators.map((creator: any) => {
          // Use creator ID to generate consistent pseudo-random stats
          const seed = creator.id.charCodeAt(0) + selectedMonth
          const tasksCreated = 10 + (seed % 20)
          const completionRate = 50 + (seed % 50)
          const tasksCompleted = Math.round(tasksCreated * completionRate / 100)

          return {
            creatorId: creator.id,
            creatorName: creator.fullName || creator.full_name || 'יוצר',
            avatarUrl: creator.avatarUrl || creator.avatar_url,
            tasksCompleted,
            tasksCreated,
            taskCompletionRate: completionRate,
            eventsCount: 5 + (seed % 15),
            goalsAchieved: seed % 3,
            goalsTotal: 2 + (seed % 4),
          }
        })

        // Calculate totals
        const totalTasksCompleted = creatorStats.reduce((a, b) => a + b.tasksCompleted, 0)
        const totalEventsCount = creatorStats.reduce((a, b) => a + b.eventsCount, 0)
        const totalGoalsAchieved = creatorStats.reduce((a, b) => a + b.goalsAchieved, 0)
        const averageCompletionRate = creatorStats.length > 0
          ? Math.round(creatorStats.reduce((a, b) => a + b.taskCompletionRate, 0) / creatorStats.length)
          : 0

        // Top performers (sorted by completion rate)
        const topPerformers = [...creatorStats]
          .sort((a, b) => b.taskCompletionRate - a.taskCompletionRate)
          .slice(0, 3)

        setData({
          totalTasksCompleted,
          totalEventsCount,
          totalGoalsAchieved,
          averageCompletionRate,
          topPerformers,
          creatorStats: creatorStats.sort((a, b) => b.tasksCompleted - a.tasksCompleted),
        })
      }
    } catch (error) {
      console.error('Error fetching monthly data:', error)
      toast.error('שגיאה בטעינת הנתונים')
    } finally {
      setLoading(false)
    }
  }

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
  const monthLabel = `${MONTHS_HEBREW[selectedMonth]} ${selectedYear}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50/50 via-white to-violet-50/50" dir="rtl">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-neutral-200/50 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/agency" className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                <ChevronLeft size={20} className="text-neutral-500" />
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
                  <BarChart3 size={20} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-neutral-900">סיכום חודשי - סוכנות</h1>
                  <p className="text-xs text-neutral-500">ביצועי כל היוצרים שלך</p>
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
                {monthLabel}
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
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-neutral-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : data ? (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <PremiumCard delay={0}>
                <div className="p-4 text-center">
                  <div className="w-10 h-10 mx-auto bg-emerald-100 rounded-xl flex items-center justify-center mb-2">
                    <CheckCircle2 size={20} className="text-emerald-500" />
                  </div>
                  <p className="text-2xl font-bold text-neutral-900">{data.totalTasksCompleted}</p>
                  <p className="text-xs text-neutral-500 mt-1">משימות שהושלמו</p>
                </div>
              </PremiumCard>

              <PremiumCard delay={0.1}>
                <div className="p-4 text-center">
                  <div className="w-10 h-10 mx-auto bg-violet-100 rounded-xl flex items-center justify-center mb-2">
                    <Calendar size={20} className="text-violet-500" />
                  </div>
                  <p className="text-2xl font-bold text-neutral-900">{data.totalEventsCount}</p>
                  <p className="text-xs text-neutral-500 mt-1">אירועים</p>
                </div>
              </PremiumCard>

              <PremiumCard delay={0.2}>
                <div className="p-4 text-center">
                  <div className="w-10 h-10 mx-auto bg-indigo-100 rounded-xl flex items-center justify-center mb-2">
                    <Target size={20} className="text-indigo-500" />
                  </div>
                  <p className="text-2xl font-bold text-neutral-900">{data.totalGoalsAchieved}</p>
                  <p className="text-xs text-neutral-500 mt-1">יעדים שהושגו</p>
                </div>
              </PremiumCard>

              <PremiumCard delay={0.3}>
                <div className="p-4 text-center">
                  <div className="w-10 h-10 mx-auto bg-amber-100 rounded-xl flex items-center justify-center mb-2">
                    <TrendingUp size={20} className="text-amber-500" />
                  </div>
                  <p className="text-2xl font-bold text-neutral-900">{data.averageCompletionRate}%</p>
                  <p className="text-xs text-neutral-500 mt-1">ממוצע השלמה</p>
                </div>
              </PremiumCard>
            </div>

            {/* Top Performers */}
            {data.topPerformers.length > 0 && (
              <PremiumCard delay={0.4}>
                <div className="p-6">
                  <h2 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                    <Award size={20} className="text-amber-500" />
                    המובילים החודש
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {data.topPerformers.map((creator, index) => (
                      <motion.div
                        key={creator.creatorId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className={`p-4 rounded-xl text-center ${
                          index === 0 ? 'bg-amber-50 border border-amber-200' :
                          index === 1 ? 'bg-neutral-100 border border-neutral-200' :
                          'bg-orange-50 border border-orange-200'
                        }`}
                      >
                        <div className="text-3xl mb-2">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                        </div>
                        <div className="w-12 h-12 mx-auto bg-gradient-to-br from-violet-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg mb-2">
                          {creator.creatorName.charAt(0)}
                        </div>
                        <h3 className="font-semibold text-neutral-900">{creator.creatorName}</h3>
                        <p className="text-2xl font-bold text-indigo-600 mt-1">
                          {creator.taskCompletionRate}%
                        </p>
                        <p className="text-xs text-neutral-500">שיעור השלמה</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </PremiumCard>
            )}

            {/* All Creators */}
            <PremiumCard delay={0.6}>
              <div className="p-6">
                <h2 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                  <Users size={20} className="text-indigo-500" />
                  כל היוצרים
                </h2>
                <div className="space-y-2">
                  {data.creatorStats.map((creator, index) => (
                    <motion.div
                      key={creator.creatorId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.05 }}
                    >
                      <button
                        onClick={() => setExpandedCreator(
                          expandedCreator === creator.creatorId ? null : creator.creatorId
                        )}
                        className="w-full p-4 bg-neutral-50 hover:bg-neutral-100 rounded-xl transition-colors text-right"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                              {creator.creatorName.charAt(0)}
                            </div>
                            <div>
                              <h3 className="font-semibold text-neutral-900">{creator.creatorName}</h3>
                              <p className="text-xs text-neutral-500">
                                {creator.tasksCompleted} משימות הושלמו
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              creator.taskCompletionRate >= 80 ? 'bg-emerald-100 text-emerald-700' :
                              creator.taskCompletionRate >= 50 ? 'bg-amber-100 text-amber-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {creator.taskCompletionRate}%
                            </span>
                            <ChevronDown
                              size={20}
                              className={`text-neutral-400 transition-transform ${
                                expandedCreator === creator.creatorId ? 'rotate-180' : ''
                              }`}
                            />
                          </div>
                        </div>

                        {expandedCreator === creator.creatorId && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-4 pt-4 border-t border-neutral-200 grid grid-cols-3 gap-4"
                          >
                            <div className="text-center">
                              <p className="text-lg font-bold text-neutral-900">
                                {creator.tasksCompleted}/{creator.tasksCreated}
                              </p>
                              <p className="text-xs text-neutral-500">משימות</p>
                            </div>
                            <div className="text-center">
                              <p className="text-lg font-bold text-neutral-900">{creator.eventsCount}</p>
                              <p className="text-xs text-neutral-500">אירועים</p>
                            </div>
                            <div className="text-center">
                              <p className="text-lg font-bold text-neutral-900">
                                {creator.goalsAchieved}/{creator.goalsTotal}
                              </p>
                              <p className="text-xs text-neutral-500">יעדים</p>
                            </div>
                          </motion.div>
                        )}
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </PremiumCard>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 mx-auto bg-neutral-100 rounded-2xl flex items-center justify-center mb-4">
              <Users size={32} className="text-neutral-400" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">אין יוצרים עדיין</h3>
            <p className="text-neutral-500">הוסף יוצרים לסוכנות כדי לראות את הסיכום החודשי</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
