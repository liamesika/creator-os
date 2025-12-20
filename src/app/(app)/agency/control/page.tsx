'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Grid3X3,
  ChevronLeft,
  ChevronRight,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Flame,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Heart,
  Building2,
  RefreshCw,
  Target,
  DollarSign,
  AlertCircle,
  BarChart3,
  Eye,
  X,
  Calendar,
  ArrowLeft,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useAgencyDemoStore } from '@/stores/agencyDemoStore'
import { getAgencyDemoControlData, getAgencyDemoInsights } from '@/lib/agency-demo-data'
import { HealthBadge } from '@/components/app/HealthScoreCard'
import PremiumCard from '@/components/app/PremiumCard'
import { AnimatedCounter, AnimatedPercentage } from '@/components/app/experience'
import type { HealthStatus } from '@/types/premium'
import type { AgencyCreatorWeekData, AgencyControlData, DayLoad } from '@/types/premium'
import type { InsightDisplay } from '@/types/insights'

const DAYS_HEBREW = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳']
const MONTHS_HEBREW = [
  'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
]

const LOAD_THRESHOLDS = {
  light: 3,
  moderate: 6,
  heavy: Infinity,
}

function getLoadStatus(load: number): 'light' | 'moderate' | 'heavy' {
  if (load <= LOAD_THRESHOLDS.light) return 'light'
  if (load <= LOAD_THRESHOLDS.moderate) return 'moderate'
  return 'heavy'
}

function getLoadColors(status: 'light' | 'moderate' | 'heavy') {
  switch (status) {
    case 'light':
      return { bg: 'bg-emerald-100', text: 'text-emerald-700' }
    case 'moderate':
      return { bg: 'bg-amber-100', text: 'text-amber-700' }
    case 'heavy':
      return { bg: 'bg-red-100', text: 'text-red-700' }
  }
}

interface RiskItem {
  creatorId: string
  creatorName: string
  date: string
  dayName: string
  load: number
  reason: string
}

interface CompanyConcentration {
  companyId: string
  companyName: string
  totalTime: number
  percentage: number
}

interface CreatorPerformance {
  creatorId: string
  creatorName: string
  healthScore: number
  healthStatus: HealthStatus
  earningsThisMonth: number
  completionRate: number
  onTimeRate: number
}

export default function AgencyControlPageV2() {
  const [weekOffset, setWeekOffset] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [controlData, setControlData] = useState<AgencyControlData | null>(null)
  const [insights, setInsights] = useState<InsightDisplay[]>([])
  const [selectedDay, setSelectedDay] = useState<{ date: string; creator: AgencyCreatorWeekData; dayData: DayLoad } | null>(null)
  const { user } = useAuth()
  const { isAgencyDemo } = useAgencyDemoStore()

  // Calculate week dates - memoized to prevent infinite re-renders
  const weekDates = useMemo(() => {
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay() + weekOffset * 7)
    startOfWeek.setHours(0, 0, 0, 0)

    const dates: Date[] = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      dates.push(date)
    }
    return dates
  }, [weekOffset])

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)

      // In demo mode, use demo data directly
      if (isAgencyDemo) {
        await new Promise(resolve => setTimeout(resolve, 400))
        setControlData(getAgencyDemoControlData(weekDates))
        setInsights(getAgencyDemoInsights())
        setIsLoading(false)
        return
      }

      try {
        const startDate = weekDates[0].toISOString().split('T')[0]
        const endDate = weekDates[6].toISOString().split('T')[0]

        const [controlRes, insightsRes] = await Promise.all([
          fetch(`/api/agency/control?start=${startDate}&end=${endDate}`),
          fetch('/api/insights?scope=agency'),
        ])

        if (controlRes.ok) {
          const data = await controlRes.json()
          setControlData(data)
        } else {
          setControlData(generateDemoData(weekDates))
        }

        if (insightsRes.ok) {
          const insightsData = await insightsRes.json()
          setInsights(insightsData.insights || [])
        }
      } catch (error) {
        setControlData(generateDemoData(weekDates))
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [weekOffset, isAgencyDemo])

  // Compute risk radar
  const riskItems = useMemo((): RiskItem[] => {
    if (!controlData) return []

    const risks: RiskItem[] = []
    controlData.creators.forEach(creator => {
      creator.weekData.forEach((day, index) => {
        if (day.isHeavy || day.totalLoad >= 7) {
          risks.push({
            creatorId: creator.creatorId,
            creatorName: creator.creatorName,
            date: day.date,
            dayName: DAYS_HEBREW[index],
            load: day.totalLoad,
            reason: day.totalLoad >= 10 ? 'עומס קיצוני' : 'יום עמוס',
          })
        }
      })
    })

    return risks.sort((a, b) => b.load - a.load).slice(0, 5)
  }, [controlData])

  // Compute creator performance
  const creatorPerformance = useMemo((): CreatorPerformance[] => {
    if (!controlData) return []

    return controlData.creators.map(creator => {
      // Simulated data for demo
      const seed = creator.creatorId.charCodeAt(creator.creatorId.length - 1)
      return {
        creatorId: creator.creatorId,
        creatorName: creator.creatorName,
        healthScore: creator.healthScore,
        healthStatus: creator.healthStatus,
        earningsThisMonth: 5000 + (seed * 100) % 15000,
        completionRate: 60 + (seed % 40),
        onTimeRate: 70 + (seed % 30),
      }
    })
  }, [controlData])

  // Compute company concentration
  const companyConcentration = useMemo((): CompanyConcentration[] => {
    // Demo data
    return [
      { companyId: '1', companyName: 'חברת אלפא', totalTime: 45, percentage: 35 },
      { companyId: '2', companyName: 'בטא מדיה', totalTime: 30, percentage: 23 },
      { companyId: '3', companyName: 'גמא סטודיו', totalTime: 20, percentage: 16 },
    ]
  }, [controlData])

  // In demo mode, skip account type check
  if (!isAgencyDemo && user?.accountType !== 'agency') {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <AlertTriangle size={48} className="text-amber-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-neutral-900 mb-2">גישה מוגבלת</h1>
          <p className="text-neutral-600">עמוד זה זמין רק לחשבונות סוכנות</p>
        </div>
      </div>
    )
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <div className="min-h-screen" dir="rtl">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-b from-neutral-50 via-white to-neutral-50/80 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">
        {/* HERO SECTION - Control Center Command */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="relative overflow-hidden py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 mb-6"
        >
          {/* Gradient background - violet theme */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700" />

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
              className="absolute -bottom-24 -left-24 w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-gradient-to-tr from-indigo-400/20 via-violet-400/10 to-transparent blur-2xl"
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
              <Zap size={14} className="text-amber-300" />
              <span className="text-sm font-medium text-white/80">ניהול מתקדם</span>
            </motion.div>

            {/* Main Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.1] mb-3 sm:mb-4"
            >
              מרכז בקרה
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-base sm:text-lg text-white/60 mb-8 sm:mb-10"
            >
              תמונת מצב שבועית של כל היוצרים בסוכנות
            </motion.p>

            {/* Quick Stats Row */}
            {controlData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex items-center justify-center gap-8 sm:gap-16 mb-8 sm:mb-10"
              >
                <div className="text-center">
                  <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">{controlData.overallStats.totalCreators}</p>
                  <p className="text-xs sm:text-sm text-white/50 font-medium mt-1">יוצרים</p>
                </div>
                <div className="w-px h-12 bg-white/20" />
                <div className="text-center">
                  <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-emerald-300">{controlData.overallStats.calmCount}</p>
                  <p className="text-xs sm:text-sm text-white/50 font-medium mt-1">רגועים</p>
                </div>
                <div className="hidden sm:block w-px h-12 bg-white/20" />
                <div className="hidden sm:block text-center">
                  <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-amber-300">{controlData.overallStats.busyCount}</p>
                  <p className="text-xs sm:text-sm text-white/50 font-medium mt-1">עסוקים</p>
                </div>
                <div className="hidden sm:block w-px h-12 bg-white/20" />
                <div className="hidden sm:block text-center">
                  <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-red-300">{controlData.overallStats.overloadedCount}</p>
                  <p className="text-xs sm:text-sm text-white/50 font-medium mt-1">עמוסים</p>
                </div>
              </motion.div>
            )}

            {/* Week Navigation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex items-center justify-center gap-3"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setWeekOffset(prev => prev - 1)}
                className="p-3 bg-white/10 backdrop-blur-sm rounded-xl text-white hover:bg-white/20 transition-colors"
              >
                <ChevronRight size={20} />
              </motion.button>
              <button
                onClick={() => setWeekOffset(0)}
                className={`px-5 py-3 rounded-xl text-sm font-semibold transition-all ${
                  weekOffset === 0
                    ? 'bg-white text-violet-700 shadow-lg shadow-black/25'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                השבוע הנוכחי
              </button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setWeekOffset(prev => prev + 1)}
                className="p-3 bg-white/10 backdrop-blur-sm rounded-xl text-white hover:bg-white/20 transition-colors"
              >
                <ChevronLeft size={20} />
              </motion.button>
            </motion.div>

            {/* Back to Agency Link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-6"
            >
              <Link
                href="/agency"
                className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white/80 transition-colors"
              >
                <ArrowLeft size={16} />
                <span>חזרה לדשבורד</span>
              </Link>
            </motion.div>
          </div>
        </motion.section>

        {/* Rest of content */}
        <div className="px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Agency Insights Strip */}
        {insights.length > 0 && (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {insights.map((insight, index) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex-shrink-0 p-3 rounded-xl border ${
                  insight.severity === 'risk'
                    ? 'bg-red-50 border-red-200'
                    : insight.severity === 'warning'
                    ? 'bg-amber-50 border-amber-200'
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-center gap-2 text-center">
                  <span className="text-lg">{insight.icon}</span>
                  <div>
                    <p className={`text-sm font-medium ${
                      insight.severity === 'risk'
                        ? 'text-red-700'
                        : insight.severity === 'warning'
                        ? 'text-amber-700'
                        : 'text-blue-700'
                    }`}>
                      {insight.message}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Risk Radar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Risk Radar */}
          <PremiumCard delay={0.4}>
            <div className="p-4">
              <div className="flex items-center justify-center gap-2 mb-3">
                <AlertCircle size={18} className="text-red-500" />
                <h3 className="font-semibold text-neutral-900">רדאר סיכונים</h3>
              </div>
              {riskItems.length === 0 ? (
                <div className="text-center py-4">
                  <CheckCircle2 size={24} className="text-emerald-500 mx-auto mb-2" />
                  <p className="text-sm text-neutral-500">אין סיכונים השבוע</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {riskItems.map((risk, index) => (
                    <motion.button
                      key={`${risk.creatorId}-${risk.date}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.05 }}
                      onClick={() => {
                        const creator = controlData?.creators.find(c => c.creatorId === risk.creatorId)
                        const dayData = creator?.weekData.find(d => d.date === risk.date)
                        if (creator && dayData) {
                          setSelectedDay({ date: risk.date, creator, dayData })
                        }
                      }}
                      className="w-full p-2 bg-red-50 hover:bg-red-100 rounded-lg transition-colors text-center"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-red-700">{risk.creatorName}</span>
                        <span className="text-xs text-red-600">יום {risk.dayName} • {risk.load} פריטים</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          </PremiumCard>
        </div>

        {/* Creator Performance Panel - Card Based */}
        <div>
          <div className="flex items-center justify-center gap-2 mb-4">
            <BarChart3 size={20} className="text-violet-500" />
            <h3 className="font-bold text-neutral-900">ביצועי יוצרים</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {creatorPerformance.map((creator, index) => (
              <motion.div
                key={creator.creatorId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.05 }}
              >
                <PremiumCard interactive>
                  <Link href={`/agency/creators/${creator.creatorId}`} className="block p-4">
                    <div className="text-center mb-3">
                      <div className="w-12 h-12 mx-auto bg-gradient-to-br from-violet-400 to-indigo-500 rounded-full flex items-center justify-center text-white text-lg font-bold mb-2">
                        {creator.creatorName.charAt(0)}
                      </div>
                      <h4 className="font-semibold text-neutral-900">{creator.creatorName}</h4>
                      <div className="mt-1">
                        <HealthBadge score={creator.healthScore} status={creator.healthStatus} size="sm" />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-emerald-50 rounded-xl p-2">
                        <DollarSign size={14} className="text-emerald-500 mx-auto mb-1" />
                        <p className="text-sm font-bold text-emerald-700">
                          ₪{(creator.earningsThisMonth / 1000).toFixed(0)}K
                        </p>
                        <p className="text-[10px] text-emerald-600">הכנסות</p>
                      </div>

                      <div className={`rounded-xl p-2 ${
                        creator.completionRate >= 80 ? 'bg-emerald-50' :
                        creator.completionRate >= 50 ? 'bg-amber-50' : 'bg-red-50'
                      }`}>
                        <Target size={14} className={`mx-auto mb-1 ${
                          creator.completionRate >= 80 ? 'text-emerald-500' :
                          creator.completionRate >= 50 ? 'text-amber-500' : 'text-red-500'
                        }`} />
                        <p className={`text-sm font-bold ${
                          creator.completionRate >= 80 ? 'text-emerald-700' :
                          creator.completionRate >= 50 ? 'text-amber-700' : 'text-red-700'
                        }`}>
                          {creator.completionRate}%
                        </p>
                        <p className={`text-[10px] ${
                          creator.completionRate >= 80 ? 'text-emerald-600' :
                          creator.completionRate >= 50 ? 'text-amber-600' : 'text-red-600'
                        }`}>השלמה</p>
                      </div>

                      <div className={`rounded-xl p-2 ${
                        creator.onTimeRate >= 80 ? 'bg-emerald-50' :
                        creator.onTimeRate >= 60 ? 'bg-amber-50' : 'bg-red-50'
                      }`}>
                        <Clock size={14} className={`mx-auto mb-1 ${
                          creator.onTimeRate >= 80 ? 'text-emerald-500' :
                          creator.onTimeRate >= 60 ? 'text-amber-500' : 'text-red-500'
                        }`} />
                        <p className={`text-sm font-bold ${
                          creator.onTimeRate >= 80 ? 'text-emerald-700' :
                          creator.onTimeRate >= 60 ? 'text-amber-700' : 'text-red-700'
                        }`}>
                          {creator.onTimeRate}%
                        </p>
                        <p className={`text-[10px] ${
                          creator.onTimeRate >= 80 ? 'text-emerald-600' :
                          creator.onTimeRate >= 60 ? 'text-amber-600' : 'text-red-600'
                        }`}>בזמן</p>
                      </div>
                    </div>
                  </Link>
                </PremiumCard>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Company Concentration */}
        <PremiumCard delay={0.7}>
          <div className="p-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Building2 size={20} className="text-indigo-500" />
              <h3 className="font-bold text-neutral-900">ריכוז לקוחות</h3>
            </div>
            <p className="text-sm text-neutral-500 text-center mb-4">
              החברות שצורכות הכי הרבה זמן בסוכנות
            </p>
            <div className="space-y-3">
              {companyConcentration.map((company, index) => (
                <motion.div
                  key={company.companyId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-neutral-900">{company.companyName}</span>
                      <span className="text-sm text-neutral-500">{company.percentage}%</span>
                    </div>
                    <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${company.percentage}%` }}
                        transition={{ delay: 0.9 + index * 0.1, duration: 0.5 }}
                        className={`h-full rounded-full ${
                          company.percentage >= 40 ? 'bg-amber-500' : 'bg-indigo-500'
                        }`}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </PremiumCard>

        {/* Weekly Grid */}
        <div className="bg-white rounded-2xl border border-neutral-200/50 overflow-hidden">
          <div className="p-4 border-b border-neutral-200 bg-neutral-50">
            <h3 className="font-semibold text-neutral-900 text-center">תצוגת שבוע</h3>
            <p className="text-xs text-neutral-500 text-center mt-1">
              {MONTHS_HEBREW[weekDates[0].getMonth()]} {weekDates[0].getFullYear()}
            </p>
          </div>

          {/* Column headers */}
          <div className="grid grid-cols-8 border-b border-neutral-200">
            <div className="p-4 bg-neutral-50 font-medium text-neutral-700 text-center">יוצר</div>
            {weekDates.map((date, i) => {
              const isToday = date.getTime() === today.getTime()
              return (
                <div
                  key={i}
                  className={`p-4 text-center font-medium ${
                    isToday ? 'bg-violet-50 text-violet-700' : 'bg-neutral-50 text-neutral-700'
                  }`}
                >
                  <div className="text-xs text-neutral-400">{DAYS_HEBREW[i]}</div>
                  <div className={isToday ? 'font-bold' : ''}>{date.getDate()}</div>
                </div>
              )
            })}
          </div>

          {/* Creator rows */}
          {isLoading ? (
            <div className="p-8 text-center">
              <RefreshCw size={24} className="text-neutral-400 mx-auto mb-2 animate-spin" />
              <p className="text-neutral-500">טוען נתונים...</p>
            </div>
          ) : controlData && controlData.creators.length > 0 ? (
            controlData.creators.map((creator, creatorIndex) => (
              <motion.div
                key={creator.creatorId}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: creatorIndex * 0.05 }}
                className="grid grid-cols-8 border-b border-neutral-100 last:border-b-0 hover:bg-neutral-50/50 transition-colors"
              >
                <div className="p-4 flex items-center justify-center gap-3">
                  <HealthBadge score={creator.healthScore} status={creator.healthStatus} size="sm" />
                  <Link
                    href={`/agency/creators/${creator.creatorId}`}
                    className="font-medium text-neutral-900 hover:text-violet-600 transition-colors text-sm"
                  >
                    {creator.creatorName}
                  </Link>
                </div>

                {creator.weekData.map((day, dayIndex) => {
                  const loadStatus = getLoadStatus(day.totalLoad)
                  const colors = getLoadColors(loadStatus)
                  const isToday = weekDates[dayIndex].getTime() === today.getTime()

                  return (
                    <button
                      key={day.date}
                      onClick={() => setSelectedDay({ date: day.date, creator, dayData: day })}
                      className={`p-2 flex items-center justify-center ${
                        isToday ? 'bg-violet-50/30' : ''
                      } hover:bg-neutral-100 transition-colors`}
                    >
                      {day.totalLoad > 0 ? (
                        <div
                          className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center`}
                          title={`${day.eventsCount} אירועים, ${day.tasksCount} משימות`}
                        >
                          {day.isHeavy ? (
                            <Flame size={16} className={colors.text} />
                          ) : (
                            <span className={`text-sm font-bold ${colors.text}`}>
                              {day.totalLoad}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center">
                          <Sparkles size={14} className="text-neutral-300" />
                        </div>
                      )}
                    </button>
                  )
                })}
              </motion.div>
            ))
          ) : (
            <div className="p-8 text-center">
              <Users size={32} className="text-neutral-300 mx-auto mb-3" />
              <p className="text-neutral-500 font-medium">אין יוצרים בסוכנות</p>
              <Link
                href="/agency/members"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
              >
                ניהול חברי צוות
              </Link>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center">
              <span className="text-xs font-bold text-emerald-700">3</span>
            </div>
            <span className="text-neutral-600">קל (1-3)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center">
              <span className="text-xs font-bold text-amber-700">5</span>
            </div>
            <span className="text-neutral-600">בינוני (4-6)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-red-100 flex items-center justify-center">
              <Flame size={12} className="text-red-700" />
            </div>
            <span className="text-neutral-600">עמוס (7+)</span>
          </div>
        </div>
        </div>
      </div>

      {/* Day Detail Modal */}
      <AnimatePresence>
        {selectedDay && (
          <DayDetailModal
            date={selectedDay.date}
            creator={selectedDay.creator}
            dayData={selectedDay.dayData}
            onClose={() => setSelectedDay(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// Day Detail Modal
function DayDetailModal({
  date,
  creator,
  dayData,
  onClose,
}: {
  date: string
  creator: AgencyCreatorWeekData
  dayData: DayLoad
  onClose: () => void
}) {
  const dateObj = new Date(date)
  const dayName = dateObj.toLocaleDateString('he-IL', { weekday: 'long' })
  const formattedDate = dateObj.toLocaleDateString('he-IL', { day: 'numeric', month: 'long' })

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden"
        dir="rtl"
      >
        <div className="p-6 border-b border-neutral-100 bg-gradient-to-r from-violet-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <h2 className="text-xl font-bold text-neutral-900">{creator.creatorName}</h2>
              <p className="text-sm text-neutral-500">{dayName}, {formattedDate}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/50 rounded-lg transition-colors"
            >
              <X size={20} className="text-neutral-500" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Load summary */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-violet-50 rounded-xl">
              <Calendar size={20} className="text-violet-500 mx-auto mb-1" />
              <p className="text-xl font-bold text-violet-700">{dayData.eventsCount}</p>
              <p className="text-xs text-violet-600">אירועים</p>
            </div>
            <div className="p-3 bg-indigo-50 rounded-xl">
              <Target size={20} className="text-indigo-500 mx-auto mb-1" />
              <p className="text-xl font-bold text-indigo-700">{dayData.tasksCount}</p>
              <p className="text-xs text-indigo-600">משימות</p>
            </div>
            <div className={`p-3 rounded-xl ${dayData.isHeavy ? 'bg-red-50' : 'bg-emerald-50'}`}>
              {dayData.isHeavy ? (
                <Flame size={20} className="text-red-500 mx-auto mb-1" />
              ) : (
                <CheckCircle2 size={20} className="text-emerald-500 mx-auto mb-1" />
              )}
              <p className={`text-xl font-bold ${dayData.isHeavy ? 'text-red-700' : 'text-emerald-700'}`}>
                {dayData.totalLoad}
              </p>
              <p className={`text-xs ${dayData.isHeavy ? 'text-red-600' : 'text-emerald-600'}`}>
                סה״כ
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-neutral-100 space-y-2">
            <Link
              href={`/agency/creators/${creator.creatorId}`}
              className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg flex items-center justify-center gap-2"
            >
              <Eye size={18} />
              צפה בפרופיל היוצר
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Demo data generator
function generateDemoData(weekDates: Date[]): AgencyControlData {
  const creators: AgencyCreatorWeekData[] = [
    { name: 'נועה כהן', email: 'noa@example.com', baseLoad: 4 },
    { name: 'יוסי לוי', email: 'yossi@example.com', baseLoad: 7 },
    { name: 'מיכל אברהם', email: 'michal@example.com', baseLoad: 2 },
    { name: 'דני פרץ', email: 'dani@example.com', baseLoad: 5 },
    { name: 'שרה גולד', email: 'sara@example.com', baseLoad: 8 },
  ].map((c, i) => {
    const weekData: DayLoad[] = weekDates.map(date => {
      const variance = Math.floor(Math.random() * 4) - 2
      const totalLoad = Math.max(0, c.baseLoad + variance)
      const eventsCount = Math.floor(totalLoad * 0.4)
      const tasksCount = totalLoad - eventsCount

      return {
        date: date.toISOString().split('T')[0],
        eventsCount,
        tasksCount,
        totalLoad,
        isHeavy: totalLoad > 6,
        events: [],
        tasks: [],
        topCompanies: [],
      }
    })

    const avgLoad = weekData.reduce((sum, d) => sum + d.totalLoad, 0) / 7
    const healthScore = Math.max(0, Math.min(100, Math.round(avgLoad * 10)))
    const healthStatus: HealthStatus =
      healthScore <= 35 ? 'calm' : healthScore <= 70 ? 'busy' : 'overloaded'

    return {
      creatorId: `creator-${i + 1}`,
      creatorName: c.name,
      creatorEmail: c.email,
      healthScore,
      healthStatus,
      weekData,
    }
  })

  const calmCount = creators.filter(c => c.healthStatus === 'calm').length
  const busyCount = creators.filter(c => c.healthStatus === 'busy').length
  const overloadedCount = creators.filter(c => c.healthStatus === 'overloaded').length
  const avgScore = Math.round(creators.reduce((sum, c) => sum + c.healthScore, 0) / creators.length)

  return {
    weekStart: weekDates[0].toISOString().split('T')[0],
    weekEnd: weekDates[6].toISOString().split('T')[0],
    creators,
    overallStats: {
      totalCreators: creators.length,
      calmCount,
      busyCount,
      overloadedCount,
      avgScore,
    },
  }
}
