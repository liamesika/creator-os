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
  Calendar,
  BarChart3,
  Loader2,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { db } from '@/lib/supabase/database'
import PremiumCard from '@/components/app/PremiumCard'
import AnalyticsCard from '@/components/app/AnalyticsCard'
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
  const [stats, setStats] = useState<AgencyDashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState<'month' | 'quarter' | 'year'>('month')

  useEffect(() => {
    if (user?.accountType !== 'agency') {
      router.push('/dashboard')
      return
    }
    loadDashboardStats()
  }, [user, router])

  const loadDashboardStats = async () => {
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
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={32} className="text-accent-600 animate-spin" />
          <p className="text-sm text-neutral-500 text-center">טוען נתוני סוכנות...</p>
        </div>
      </div>
    )
  }

  if (user?.accountType !== 'agency') {
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
            <div className="text-center sm:text-right">
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
                דשבורד סוכנות
              </h1>
              <p className="text-neutral-500 text-sm mt-1">
                ניהול יוצרים, הכנסות וחברות
              </p>
            </div>

            <div className="flex items-center justify-center gap-2">
              <Link href="/agency/members">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-neutral-900 text-white rounded-xl text-sm font-medium shadow-lg shadow-neutral-900/20 hover:bg-neutral-800 transition-colors"
                >
                  <Plus size={16} strokeWidth={2.5} />
                  <span>הוסף יוצר</span>
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
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

        {/* Creators List */}
        <motion.div variants={itemVariants}>
          <PremiumCard delay={0.3}>
            <div className="p-5 sm:p-6">
              {/* Header with search and filters */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="flex items-center justify-center sm:justify-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                    <Users size={18} className="text-blue-600" strokeWidth={2} />
                  </div>
                  <div className="text-center sm:text-right">
                    <h2 className="font-semibold text-neutral-900">היוצרים שלי</h2>
                    <p className="text-xs text-neutral-400">{stats?.totalCreators || 0} יוצרים פעילים</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  {/* Search */}
                  <div className="relative w-full sm:w-auto">
                    <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="חיפוש יוצר..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full sm:w-64 pl-4 pr-10 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 text-center sm:text-right"
                    />
                  </div>

                  {/* Date Filter */}
                  <div className="flex items-center gap-1 bg-neutral-100 rounded-xl p-1">
                    {(['month', 'quarter', 'year'] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setDateFilter(filter)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                          dateFilter === filter
                            ? 'bg-white text-neutral-900 shadow-sm'
                            : 'text-neutral-500 hover:text-neutral-700'
                        }`}
                      >
                        {filter === 'month' ? 'חודש' : filter === 'quarter' ? 'רבעון' : 'שנה'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Creators Table/Grid */}
              {filteredCreators.length === 0 ? (
                <div className="text-center py-12">
                  <Users size={48} className="text-neutral-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-neutral-900 mb-2 text-center">
                    {searchQuery ? 'לא נמצאו יוצרים' : 'עדיין אין יוצרים'}
                  </h3>
                  <p className="text-neutral-600 mb-6 text-center">
                    {searchQuery
                      ? 'נסה לחפש עם מילות מפתח אחרות'
                      : 'הוסף יוצרים לסוכנות כדי להתחיל לנהל אותם'}
                  </p>
                  {!searchQuery && (
                    <Link
                      href="/agency/members"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-accent-600 text-white rounded-xl font-bold hover:bg-accent-700 transition-colors"
                    >
                      <Plus size={20} />
                      הזמן יוצר
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Table Header - Desktop */}
                  <div className="hidden lg:grid lg:grid-cols-6 gap-4 px-4 py-2 text-xs font-medium text-neutral-500">
                    <div className="text-center">יוצר</div>
                    <div className="text-center">חברות</div>
                    <div className="text-center">הכנסות חודשיות</div>
                    <div className="text-center">הכנסות שנתיות</div>
                    <div className="text-center">חברות פעילות</div>
                    <div className="text-center">פעולות</div>
                  </div>

                  {/* Creator Rows */}
                  {filteredCreators.map((creator, index) => (
                    <CreatorRow key={creator.creatorUserId} creator={creator} index={index} />
                  ))}
                </div>
              )}
            </div>
          </PremiumCard>
        </motion.div>
      </div>
    </motion.div>
  )
}

function CreatorRow({ creator, index }: { creator: AgencyCreatorStats; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index }}
    >
      <Link href={`/agency/creators/${creator.creatorUserId}`}>
        <div className="group bg-neutral-50 hover:bg-neutral-100 rounded-xl p-4 transition-colors cursor-pointer">
          {/* Mobile Layout */}
          <div className="lg:hidden space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-100 to-violet-100 flex items-center justify-center">
                  <span className="text-sm font-bold text-accent-700">
                    {creator.creatorName.charAt(0)}
                  </span>
                </div>
                <div className="text-center">
                  <p className="font-medium text-neutral-900">{creator.creatorName}</p>
                  <p className="text-xs text-neutral-500">{creator.creatorEmail}</p>
                </div>
              </div>
              <ChevronLeft size={18} className="text-neutral-400 group-hover:text-neutral-600" />
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-neutral-500">חברות</p>
                <p className="font-semibold text-neutral-900">{creator.companyCount}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">הכנסות חודשיות</p>
                <p className="font-semibold text-emerald-600">{formatEarnings(creator.monthlyEarnings)}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">הכנסות שנתיות</p>
                <p className="font-semibold text-violet-600">{formatEarnings(creator.yearlyEarnings)}</p>
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:grid lg:grid-cols-6 gap-4 items-center">
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-100 to-violet-100 flex items-center justify-center">
                <span className="text-sm font-bold text-accent-700">
                  {creator.creatorName.charAt(0)}
                </span>
              </div>
              <div className="text-center">
                <p className="font-medium text-neutral-900">{creator.creatorName}</p>
                <p className="text-xs text-neutral-500">{creator.creatorEmail}</p>
              </div>
            </div>
            <div className="text-center">
              <span className="font-semibold text-neutral-900">{creator.companyCount}</span>
            </div>
            <div className="text-center">
              <span className="font-semibold text-emerald-600">{formatEarnings(creator.monthlyEarnings)}</span>
            </div>
            <div className="text-center">
              <span className="font-semibold text-violet-600">{formatEarnings(creator.yearlyEarnings)}</span>
            </div>
            <div className="text-center">
              <span className="font-semibold text-blue-600">{creator.activeCompanyCount}</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <motion.span
                whileHover={{ x: -2 }}
                className="flex items-center gap-1 text-sm text-accent-600 group-hover:text-accent-700"
              >
                צפה בפרטים
                <ChevronLeft size={16} />
              </motion.span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
