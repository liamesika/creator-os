'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Users,
  Building2,
  TrendingUp,
  DollarSign,
  ChevronLeft,
  Plus,
  Search,
  BarChart3,
  Loader2,
  UserPlus,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { db } from '@/lib/supabase/database'
import { useAgencyDemoStore } from '@/stores/agencyDemoStore'
import { getAgencyDemoDashboardStats, getAgencyDemoInsights } from '@/lib/agency-demo-data'
import { AgencyCard, AgencyCardHeader, AgencyRow, AgencyEmptyState } from '@/components/app/agency/AgencyCard'
import {
  EarningsTrendChart,
  CreatorComparisonChart,
  CompanyDistributionChart,
  QuickStats,
} from '@/components/app/agency/AgencyAnalytics'
import AnalyticsCard from '@/components/app/AnalyticsCard'
import { InsightsStrip } from '@/components/app/insights/InsightsStrip'
import { useInsights } from '@/hooks/useInsights'
import { formatEarnings, getMonthName } from '@/types/agency'
import type { AgencyDashboardStats, AgencyCreatorStats } from '@/types/agency'

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

export default function AgencyDashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { isAgencyDemo } = useAgencyDemoStore()
  const [stats, setStats] = useState<AgencyDashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState<'month' | 'quarter' | 'year'>('month')
  const { insights: realInsights } = useInsights({ scope: 'agency' })

  // Use demo insights in demo mode
  const insights = isAgencyDemo ? getAgencyDemoInsights() : realInsights

  useEffect(() => {
    // In demo mode, skip account type check
    if (!isAgencyDemo && user?.accountType !== 'agency') {
      router.push('/dashboard')
      return
    }
    loadDashboardStats()
  }, [user, router, isAgencyDemo])

  const loadDashboardStats = async () => {
    // In demo mode, use demo data
    if (isAgencyDemo) {
      setIsLoading(true)
      // Simulate loading delay for realistic UX
      await new Promise(resolve => setTimeout(resolve, 500))
      setStats(getAgencyDemoDashboardStats())
      setIsLoading(false)
      return
    }

    if (!user?.id) return
    try {
      setIsLoading(true)
      const data = await db.getAgencyDashboardStats(user.id)
      setStats(data)
    } catch (error) {
      console.error('Error loading dashboard stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredCreators = stats?.creators.filter(creator =>
    creator.creatorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    creator.creatorEmail.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  const currentMonth = getMonthName(new Date())

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-100 to-violet-100 flex items-center justify-center">
              <Loader2 size={24} className="text-accent-600 animate-spin" />
            </div>
          </div>
          <p className="text-sm text-neutral-500">טוען נתוני סוכנות...</p>
        </motion.div>
      </div>
    )
  }

  // In demo mode, skip account type check
  if (!isAgencyDemo && user?.accountType !== 'agency') {
    return null
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="min-h-screen"
    >
      <div className="fixed inset-0 bg-gradient-to-b from-neutral-50 via-white to-neutral-50/80 pointer-events-none" />

      <div className="relative p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
                דשבורד סוכנות
              </h1>
              <p className="text-neutral-500 text-sm mt-1">
                סקירה כללית של הפעילות והביצועים
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/agency/members">
                <motion.button
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-neutral-900 text-white rounded-xl text-sm font-medium shadow-lg shadow-neutral-900/20 hover:bg-neutral-800 transition-all duration-200"
                >
                  <UserPlus size={16} strokeWidth={2.5} />
                  <span>הוסף יוצר</span>
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Insights Strip */}
        {insights.length > 0 && (
          <motion.div variants={itemVariants} className="mb-8">
            <InsightsStrip
              insights={insights}
              delay={0.15}
            />
          </motion.div>
        )}

        {/* Stats Cards */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={18} className="text-neutral-400" strokeWidth={2} />
            <h2 className="text-sm font-semibold text-neutral-500">סיכום כללי</h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <AnalyticsCard
              icon={DollarSign}
              label={`הכנסות ${currentMonth}`}
              value={formatEarnings(stats?.totalMonthlyEarnings || 0)}
              subValue="חודש נוכחי"
              color="green"
              chart="sparkline"
              delay={0.1}
            />
            <AnalyticsCard
              icon={TrendingUp}
              label="הכנסות שנתיות"
              value={formatEarnings(stats?.totalYearlyEarnings || 0)}
              subValue={new Date().getFullYear().toString()}
              color="purple"
              chart="bar"
              chartValue={75}
              delay={0.15}
            />
            <AnalyticsCard
              icon={Users}
              label="יוצרים"
              value={(stats?.totalCreators || 0).toString()}
              subValue="פעילים"
              color="blue"
              delay={0.2}
            />
            <AnalyticsCard
              icon={Building2}
              label="חברות פעילות"
              value={(stats?.totalActiveCompanies || 0).toString()}
              subValue="בכל היוצרים"
              color="orange"
              delay={0.25}
            />
          </div>
        </motion.div>

        {/* Analytics Section - Only show if there are creators */}
        {stats && stats.creators.length > 0 && (
          <motion.div variants={itemVariants} className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={18} className="text-neutral-400" strokeWidth={2} />
              <h2 className="text-sm font-semibold text-neutral-500">ניתוח ביצועים</h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Earnings Trend */}
              <EarningsTrendChart
                data={generateMockEarningsTrend(stats)}
                delay={0.3}
              />

              {/* Creator Comparison */}
              <CreatorComparisonChart
                data={stats.creators.map(c => ({
                  name: c.creatorName,
                  earnings: c.monthlyEarnings,
                  color: 'accent',
                }))}
                delay={0.35}
              />

              {/* Quick Stats */}
              <QuickStats
                monthlyGrowth={calculateGrowth(stats)}
                avgEarningsPerCreator={
                  stats.totalCreators > 0
                    ? stats.totalMonthlyEarnings / stats.totalCreators
                    : 0
                }
                topPerformer={getTopPerformer(stats)}
                delay={0.4}
              />
            </div>
          </motion.div>
        )}

        {/* Creators List */}
        <motion.div variants={itemVariants}>
          <AgencyCard delay={0.3} noPadding>
            <div className="p-5 sm:p-6">
              {/* Header with search and filters */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                    <Users size={18} className="text-blue-600" strokeWidth={2} />
                  </div>
                  <div>
                    <h2 className="font-semibold text-neutral-900">היוצרים שלי</h2>
                    <p className="text-xs text-neutral-400">{stats?.totalCreators || 0} יוצרים פעילים</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  {/* Search */}
                  <div className="relative">
                    <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="חיפוש יוצר..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full sm:w-64 pl-4 pr-10 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all duration-200"
                    />
                  </div>

                  {/* Date Filter */}
                  <div className="flex items-center gap-1 bg-neutral-100 rounded-xl p-1">
                    {(['month', 'quarter', 'year'] as const).map((filter) => (
                      <motion.button
                        key={filter}
                        onClick={() => setDateFilter(filter)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                          dateFilter === filter
                            ? 'bg-white text-neutral-900 shadow-sm'
                            : 'text-neutral-500 hover:text-neutral-700'
                        }`}
                      >
                        {filter === 'month' ? 'חודש' : filter === 'quarter' ? 'רבעון' : 'שנה'}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Creators Grid/List */}
              {filteredCreators.length === 0 ? (
                <AgencyEmptyState
                  icon={searchQuery ? Search : Users}
                  title={searchQuery ? 'לא נמצאו יוצרים' : 'עוד אין יוצרים בסוכנות'}
                  description={
                    searchQuery
                      ? 'נסה לחפש עם מילות מפתח אחרות'
                      : 'הזמן יוצרים לסוכנות שלך וצפה בכל הנתונים שלהם במקום אחד. ניהול קל, מעקב הכנסות ותמונה מלאה על הביצועים.'
                  }
                  action={
                    !searchQuery
                      ? {
                          label: 'הזמן את היוצר הראשון',
                          onClick: () => router.push('/agency/members'),
                          icon: UserPlus,
                        }
                      : undefined
                  }
                  variant="premium"
                />
              ) : (
                <div className="space-y-3">
                  {filteredCreators.map((creator, index) => (
                    <CreatorCard key={creator.creatorUserId} creator={creator} index={index} />
                  ))}
                </div>
              )}
            </div>
          </AgencyCard>
        </motion.div>
      </div>
    </motion.div>
  )
}

// Helper functions for analytics
function generateMockEarningsTrend(stats: AgencyDashboardStats) {
  const months = []
  const now = new Date()

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

    // Use real data for current month, generate realistic mock for previous months
    const baseEarnings = stats.totalMonthlyEarnings || 10000
    const variance = i === 0 ? 1 : 0.7 + Math.random() * 0.6
    const total = i === 0 ? stats.totalMonthlyEarnings : Math.round(baseEarnings * variance)

    months.push({ month: monthStr, total })
  }

  return months.reverse()
}

function calculateGrowth(stats: AgencyDashboardStats): number {
  // Calculate growth based on yearly vs monthly (annualized)
  if (stats.totalYearlyEarnings === 0) return 0
  const avgMonthly = stats.totalYearlyEarnings / 12
  if (avgMonthly === 0) return 0
  return ((stats.totalMonthlyEarnings - avgMonthly) / avgMonthly) * 100
}

function getTopPerformer(stats: AgencyDashboardStats): string {
  if (stats.creators.length === 0) return ''
  const sorted = [...stats.creators].sort((a, b) => b.monthlyEarnings - a.monthlyEarnings)
  return sorted[0]?.creatorName || ''
}

function CreatorCard({ creator, index }: { creator: AgencyCreatorStats; index: number }) {
  return (
    <Link href={`/agency/creators/${creator.creatorUserId}`}>
      <AgencyRow index={index}>
        <div className="flex items-center justify-between">
          {/* Creator Info */}
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-11 h-11 rounded-xl bg-gradient-to-br from-accent-100 to-violet-100 flex items-center justify-center"
            >
              <span className="text-sm font-bold text-accent-700">
                {creator.creatorName.charAt(0)}
              </span>
            </motion.div>
            <div>
              <p className="font-semibold text-neutral-900">{creator.creatorName}</p>
              <p className="text-xs text-neutral-500">{creator.creatorEmail}</p>
            </div>
          </div>

          {/* Stats - Desktop */}
          <div className="hidden sm:flex items-center gap-6">
            <div className="text-center px-3">
              <p className="text-xs text-neutral-400 mb-0.5">חברות</p>
              <p className="font-semibold text-neutral-900">{creator.companyCount}</p>
            </div>
            <div className="text-center px-3">
              <p className="text-xs text-neutral-400 mb-0.5">הכנסות חודשיות</p>
              <p className="font-semibold text-emerald-600">{formatEarnings(creator.monthlyEarnings)}</p>
            </div>
            <div className="text-center px-3">
              <p className="text-xs text-neutral-400 mb-0.5">הכנסות שנתיות</p>
              <p className="font-semibold text-violet-600">{formatEarnings(creator.yearlyEarnings)}</p>
            </div>
            <motion.div
              whileHover={{ x: -4 }}
              className="flex items-center gap-1 text-accent-600 group-hover:text-accent-700"
            >
              <span className="text-sm font-medium">צפה בפרטים</span>
              <ChevronLeft size={16} />
            </motion.div>
          </div>

          {/* Arrow - Mobile */}
          <div className="sm:hidden">
            <ChevronLeft size={18} className="text-neutral-400 group-hover:text-neutral-600" />
          </div>
        </div>

        {/* Stats - Mobile */}
        <div className="sm:hidden grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-neutral-200/50">
          <div className="text-center">
            <p className="text-[10px] text-neutral-400">חברות</p>
            <p className="text-sm font-semibold text-neutral-900">{creator.companyCount}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-neutral-400">הכנסות חודשיות</p>
            <p className="text-sm font-semibold text-emerald-600">{formatEarnings(creator.monthlyEarnings)}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-neutral-400">הכנסות שנתיות</p>
            <p className="text-sm font-semibold text-violet-600">{formatEarnings(creator.yearlyEarnings)}</p>
          </div>
        </div>
      </AgencyRow>
    </Link>
  )
}
