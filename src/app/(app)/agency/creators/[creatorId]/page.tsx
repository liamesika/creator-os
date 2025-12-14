'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import {
  Building2,
  DollarSign,
  Calendar,
  ChevronRight,
  Plus,
  TrendingUp,
  Clock,
  Loader2,
  X,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { db } from '@/lib/supabase/database'
import { useAgencyDemoStore } from '@/stores/agencyDemoStore'
import { getAgencyDemoCreatorDetail } from '@/lib/agency-demo-data'
import { showDemoActionToast } from '@/components/app/AgencyDemoBanner'
import { AgencyCard, AgencyCardHeader, AgencyRow, AgencyEmptyState } from '@/components/app/agency/AgencyCard'
import AnalyticsCard from '@/components/app/AnalyticsCard'
import { formatEarnings, getMonthName } from '@/types/agency'
import { BRAND_TYPE_PRESETS, formatCurrency } from '@/types/company'
import { ACTIVITY_CONFIGS } from '@/types/activity'
import { formatRelativeTime } from '@/lib/format-time'
import type { CreatorDetailData, EarningsEntry } from '@/types/agency'
import { toast } from 'sonner'

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

const CURRENCY_OPTIONS_DATA = [
  { value: 'ILS', label: '₪ שקל', symbol: '₪' },
  { value: 'USD', label: '$ דולר', symbol: '$' },
  { value: 'EUR', label: '€ יורו', symbol: '€' },
]

export default function CreatorDetailPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const creatorId = params.creatorId as string
  const { isAgencyDemo } = useAgencyDemoStore()

  const [data, setData] = useState<CreatorDetailData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showAddEarningModal, setShowAddEarningModal] = useState(false)

  useEffect(() => {
    // In demo mode, skip account type check
    if (!isAgencyDemo && user?.accountType !== 'agency') {
      router.push('/dashboard')
      return
    }
    if (creatorId) {
      loadCreatorData()
    }
  }, [user, creatorId, router, isAgencyDemo])

  const loadCreatorData = async () => {
    // In demo mode, use demo data
    if (isAgencyDemo) {
      setIsLoading(true)
      await new Promise(resolve => setTimeout(resolve, 400))

      const demoData = getAgencyDemoCreatorDetail(creatorId)
      if (!demoData) {
        router.push('/agency')
        return
      }

      // Transform demo data to match CreatorDetailData structure
      setData({
        creator: {
          id: demoData.creatorUserId,
          name: demoData.creatorName,
          email: demoData.creatorEmail,
        },
        companies: demoData.companies.map((c: any) => ({
          id: c.id,
          name: c.name,
          status: c.status,
          monthlyRetainer: c.monthlyRetainer,
          currency: 'ILS',
        })),
        earnings: demoData.earningsTrend.map((e: any, i: number) => ({
          id: `demo-earning-${i}`,
          creatorUserId: creatorId,
          amount: e.amount,
          currency: 'ILS',
          earnedOn: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
        monthlyEarningsBreakdown: demoData.earningsTrend.map((e: any, i: number) => ({
          month: `2024-${String(i + 1).padStart(2, '0')}`,
          total: e.amount,
          byCompany: [],
        })),
        recentActivity: [],
      })
      setIsLoading(false)
      return
    }

    if (!user?.id || !creatorId) return
    try {
      setIsLoading(true)
      const creatorData = await db.getCreatorDetailForAgency(user.id, creatorId)
      if (!creatorData) {
        router.push('/agency')
        return
      }
      setData(creatorData)
    } catch (error) {
      console.error('Error loading creator data:', error)
      router.push('/agency')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddEarning = async (entry: Omit<EarningsEntry, 'id' | 'createdAt' | 'updatedAt' | 'creatorUserId'>) => {
    // Block in demo mode
    if (isAgencyDemo) {
      showDemoActionToast('הוספת רשומת הכנסה')
      setShowAddEarningModal(false)
      return
    }

    try {
      await db.createEarningsEntry(creatorId, entry, user?.id)
      toast.success('רשומת הכנסה נוספה בהצלחה')
      setShowAddEarningModal(false)
      loadCreatorData()
    } catch (error) {
      console.error('Error adding earning:', error)
      toast.error('שגיאה בהוספת רשומת הכנסה')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-100 to-violet-100 flex items-center justify-center">
            <Loader2 size={24} className="text-accent-600 animate-spin" />
          </div>
          <p className="text-sm text-neutral-500">טוען נתוני יוצר...</p>
        </motion.div>
      </div>
    )
  }

  if (!data) {
    return null
  }

  const totalMonthlyRetainer = data.companies.reduce(
    (sum, c) => sum + (c.monthlyRetainer || 0),
    0
  )

  const thisMonthEarnings = data.monthlyEarningsBreakdown[0]?.total || 0

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="min-h-screen"
    >
      <div className="fixed inset-0 bg-gradient-to-b from-neutral-50 via-white to-neutral-50/80 pointer-events-none" />

      <div className="relative p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Back Button & Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <Link
            href="/agency"
            className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 mb-4 transition-colors"
          >
            <ChevronRight size={16} />
            חזרה לדשבורד
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-100 to-violet-100 flex items-center justify-center shadow-lg shadow-accent-100/50"
              >
                <span className="text-2xl font-bold text-accent-700">
                  {data.creator.name.charAt(0)}
                </span>
              </motion.div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
                  {data.creator.name}
                </h1>
                <p className="text-neutral-500 text-sm">{data.creator.email}</p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAddEarningModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl text-sm font-medium shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/40 transition-all duration-200"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>הוסף הכנסה</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <AnalyticsCard
            icon={DollarSign}
            label={`הכנסות ${getMonthName(new Date())}`}
            value={formatEarnings(thisMonthEarnings)}
            subValue="חודש נוכחי"
            color="green"
            delay={0.1}
          />
          <AnalyticsCard
            icon={TrendingUp}
            label="ריטיינר חודשי"
            value={formatEarnings(totalMonthlyRetainer)}
            subValue="מכל החברות"
            color="purple"
            delay={0.15}
          />
          <AnalyticsCard
            icon={Building2}
            label="חברות"
            value={data.companies.length.toString()}
            subValue={`${data.companies.filter(c => c.status === 'ACTIVE').length} פעילות`}
            color="blue"
            delay={0.2}
          />
          <AnalyticsCard
            icon={Calendar}
            label="רשומות הכנסה"
            value={data.earnings.length.toString()}
            subValue="סה״כ"
            color="orange"
            delay={0.25}
          />
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Companies & Earnings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Companies */}
            <motion.div variants={itemVariants}>
              <AgencyCard delay={0.3} noPadding>
                <div className="p-5 sm:p-6">
                  <AgencyCardHeader
                    icon={Building2}
                    iconColor="text-violet-600"
                    iconBgColor="bg-gradient-to-br from-violet-100 to-violet-50"
                    title="חברות"
                    subtitle={`${data.companies.length} חברות`}
                  />

                  {data.companies.length === 0 ? (
                    <AgencyEmptyState
                      icon={Building2}
                      title="אין חברות רשומות"
                      description="כאשר היוצר יוסיף חברות לחשבון שלו, תוכל לראות אותן כאן."
                    />
                  ) : (
                    <div className="space-y-3">
                      {data.companies.map((company, index) => {
                        const brandPreset = company.brandType ? BRAND_TYPE_PRESETS[company.brandType as keyof typeof BRAND_TYPE_PRESETS] : null
                        const BrandIcon = brandPreset?.icon || Building2

                        return (
                          <AgencyRow key={company.id} index={index}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`p-2.5 rounded-xl ${brandPreset?.bgColor || 'bg-neutral-100'}`}>
                                  <BrandIcon size={16} className={brandPreset?.color || 'text-neutral-500'} />
                                </div>
                                <div>
                                  <p className="font-semibold text-neutral-900">{company.name}</p>
                                  <p className="text-xs text-neutral-500">
                                    {company.status === 'ACTIVE' ? 'פעילה' : 'בארכיון'}
                                  </p>
                                </div>
                              </div>
                              {company.monthlyRetainer && (
                                <span className="text-sm font-semibold text-emerald-600">
                                  {formatCurrency(company.monthlyRetainer, company.currency || 'ILS')}
                                </span>
                              )}
                            </div>
                          </AgencyRow>
                        )
                      })}
                    </div>
                  )}
                </div>
              </AgencyCard>
            </motion.div>

            {/* Earnings History */}
            <motion.div variants={itemVariants}>
              <AgencyCard delay={0.35} noPadding>
                <div className="p-5 sm:p-6">
                  <AgencyCardHeader
                    icon={DollarSign}
                    iconColor="text-emerald-600"
                    iconBgColor="bg-gradient-to-br from-emerald-100 to-emerald-50"
                    title="היסטוריית הכנסות"
                    subtitle={`${data.earnings.length} רשומות`}
                    action={
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowAddEarningModal(true)}
                        className="p-2 hover:bg-neutral-100 rounded-xl transition-colors"
                      >
                        <Plus size={18} className="text-neutral-500" strokeWidth={2} />
                      </motion.button>
                    }
                  />

                  {data.earnings.length === 0 ? (
                    <AgencyEmptyState
                      icon={DollarSign}
                      title="עדיין אין רשומות הכנסה"
                      description="הוסף רשומות הכנסה כדי לעקוב אחרי הביצועים הפיננסיים של היוצר."
                      action={{
                        label: 'הוסף הכנסה ראשונה',
                        onClick: () => setShowAddEarningModal(true),
                        icon: Plus,
                      }}
                      variant="premium"
                    />
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-hide">
                      {data.earnings.slice(0, 20).map((entry, index) => (
                        <AgencyRow key={entry.id} index={index}>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-neutral-900">
                                {formatEarnings(entry.amount, entry.currency)}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-neutral-500">
                                <span>
                                  {new Date(entry.earnedOn).toLocaleDateString('he-IL', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  })}
                                </span>
                                {entry.companyName && (
                                  <>
                                    <span>•</span>
                                    <span>{entry.companyName}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            {entry.notes && (
                              <span className="text-xs text-neutral-400 max-w-32 truncate">
                                {entry.notes}
                              </span>
                            )}
                          </div>
                        </AgencyRow>
                      ))}
                    </div>
                  )}

                  {/* Monthly Breakdown */}
                  {data.monthlyEarningsBreakdown.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-neutral-100">
                      <h3 className="text-sm font-semibold text-neutral-700 mb-4">
                        סיכום חודשי
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {data.monthlyEarningsBreakdown.slice(0, 6).map((month) => (
                          <motion.div
                            key={month.month}
                            whileHover={{ scale: 1.02 }}
                            className="p-3 bg-gradient-to-br from-neutral-50 to-white rounded-xl border border-neutral-100"
                          >
                            <p className="text-xs text-neutral-500">
                              {getMonthName(new Date(month.month + '-01'))}
                            </p>
                            <p className="font-semibold text-emerald-600">
                              {formatEarnings(month.total)}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </AgencyCard>
            </motion.div>
          </div>

          {/* Right Column - Activity & Quick Actions */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <motion.div variants={itemVariants}>
              <AgencyCard delay={0.4} noPadding>
                <div className="p-5 sm:p-6">
                  <AgencyCardHeader
                    icon={Clock}
                    iconColor="text-purple-600"
                    iconBgColor="bg-gradient-to-br from-purple-100 to-purple-50"
                    title="פעילות אחרונה"
                    subtitle="עדכונים אחרונים"
                  />

                  {data.recentActivity.length === 0 ? (
                    <AgencyEmptyState
                      icon={Clock}
                      title="אין פעילות אחרונה"
                      description="כאשר היוצר יבצע פעולות, הן יופיעו כאן."
                    />
                  ) : (
                    <div className="space-y-2">
                      {data.recentActivity.slice(0, 10).map((event, index) => {
                        const config = ACTIVITY_CONFIGS[event.type as keyof typeof ACTIVITY_CONFIGS]
                        if (!config) return null

                        return (
                          <motion.div
                            key={event.id}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.05 * index }}
                            className="flex items-start gap-3 p-2.5 hover:bg-neutral-50 rounded-xl transition-colors"
                          >
                            <div className="text-lg flex-shrink-0">{config.icon}</div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-neutral-900 truncate">
                                {event.entityName || config.getTitle({ ...event, type: event.type as any, userId: '', createdAt: event.createdAt })}
                              </p>
                              <p className="text-xs text-neutral-400 mt-0.5">
                                {formatRelativeTime(event.createdAt)}
                              </p>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </AgencyCard>
            </motion.div>

            {/* Quick Actions */}
            <motion.div variants={itemVariants}>
              <AgencyCard delay={0.45} noPadding>
                <div className="p-5 sm:p-6">
                  <h3 className="font-semibold text-neutral-900 mb-4">פעולות מהירות</h3>
                  <motion.button
                    onClick={() => setShowAddEarningModal(true)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center gap-3 p-3.5 bg-gradient-to-r from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100 text-emerald-700 rounded-xl transition-all duration-200 border border-emerald-200/50"
                  >
                    <DollarSign size={18} />
                    <span className="font-medium">הוסף רשומת הכנסה</span>
                  </motion.button>
                </div>
              </AgencyCard>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Add Earning Modal */}
      <AnimatePresence>
        {showAddEarningModal && (
          <AddEarningModal
            companies={data.companies}
            onClose={() => setShowAddEarningModal(false)}
            onSubmit={handleAddEarning}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

interface AddEarningModalProps {
  companies: { id: string; name: string }[]
  onClose: () => void
  onSubmit: (entry: Omit<EarningsEntry, 'id' | 'createdAt' | 'updatedAt' | 'creatorUserId'>) => void
}

function AddEarningModal({ companies, onClose, onSubmit }: AddEarningModalProps) {
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('ILS')
  const [earnedOn, setEarnedOn] = useState(new Date().toISOString().split('T')[0])
  const [companyId, setCompanyId] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('נדרש סכום תקין')
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit({
        amount: parseFloat(amount),
        currency,
        earnedOn: new Date(earnedOn),
        companyId: companyId || undefined,
        notes: notes || undefined,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center">
                <DollarSign size={18} className="text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-neutral-900">
                הוספת רשומת הכנסה
              </h2>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 rounded-xl transition-colors"
            >
              <X size={20} className="text-neutral-500" />
            </motion.button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Amount & Currency */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  סכום
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  required
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  מטבע
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200"
                >
                  {CURRENCY_OPTIONS_DATA.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.symbol}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                תאריך
              </label>
              <input
                type="date"
                value={earnedOn}
                onChange={(e) => setEarnedOn(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200"
              />
            </div>

            {/* Company */}
            {companies.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  חברה (אופציונלי)
                </label>
                <select
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200"
                >
                  <option value="">ללא חברה ספציפית</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                הערות (אופציונלי)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="פרטים נוספים על ההכנסה..."
                rows={2}
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none transition-all duration-200"
              />
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl font-semibold shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  שומר...
                </>
              ) : (
                <>
                  <Plus size={18} />
                  הוסף הכנסה
                </>
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </motion.div>
  )
}
