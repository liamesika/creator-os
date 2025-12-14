'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import {
  User,
  Building2,
  DollarSign,
  Calendar,
  CheckSquare,
  ChevronRight,
  Plus,
  TrendingUp,
  Clock,
  ArrowUpRight,
  Loader2,
  X,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { db } from '@/lib/supabase/database'
import PremiumCard from '@/components/app/PremiumCard'
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

  const [data, setData] = useState<CreatorDetailData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showAddEarningModal, setShowAddEarningModal] = useState(false)

  useEffect(() => {
    if (user?.accountType !== 'agency') {
      router.push('/dashboard')
      return
    }
    if (creatorId) {
      loadCreatorData()
    }
  }, [user, creatorId, router])

  const loadCreatorData = async () => {
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
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={32} className="text-accent-600 animate-spin" />
          <p className="text-sm text-neutral-500 text-center">טוען נתוני יוצר...</p>
        </div>
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
            className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 mb-4"
          >
            <ChevronRight size={16} />
            חזרה לדשבורד
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center justify-center sm:justify-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-100 to-violet-100 flex items-center justify-center">
                <span className="text-2xl font-bold text-accent-700">
                  {data.creator.name.charAt(0)}
                </span>
              </div>
              <div className="text-center sm:text-right">
                <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
                  {data.creator.name}
                </h1>
                <p className="text-neutral-500 text-sm">{data.creator.email}</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowAddEarningModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-colors"
              >
                <Plus size={16} strokeWidth={2.5} />
                <span>הוסף הכנסה</span>
              </motion.button>
            </div>
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
              <PremiumCard delay={0.3}>
                <div className="p-5 sm:p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-violet-50 flex items-center justify-center">
                        <Building2 size={18} className="text-violet-600" strokeWidth={2} />
                      </div>
                      <div className="text-center sm:text-right">
                        <h2 className="font-semibold text-neutral-900">חברות</h2>
                        <p className="text-xs text-neutral-400">{data.companies.length} חברות</p>
                      </div>
                    </div>
                  </div>

                  {data.companies.length === 0 ? (
                    <div className="text-center py-8">
                      <Building2 size={48} className="text-neutral-300 mx-auto mb-4" />
                      <p className="text-neutral-600 text-center">אין חברות רשומות ליוצר זה</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {data.companies.map((company, index) => {
                        const brandPreset = company.brandType ? BRAND_TYPE_PRESETS[company.brandType as keyof typeof BRAND_TYPE_PRESETS] : null
                        const BrandIcon = brandPreset?.icon || Building2

                        return (
                          <motion.div
                            key={company.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * index }}
                            className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${brandPreset?.bgColor || 'bg-neutral-100'}`}>
                                <BrandIcon size={16} className={brandPreset?.color || 'text-neutral-500'} />
                              </div>
                              <div className="text-center sm:text-right">
                                <p className="font-medium text-neutral-900">{company.name}</p>
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
                          </motion.div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </PremiumCard>
            </motion.div>

            {/* Earnings History */}
            <motion.div variants={itemVariants}>
              <PremiumCard delay={0.35}>
                <div className="p-5 sm:p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center">
                        <DollarSign size={18} className="text-emerald-600" strokeWidth={2} />
                      </div>
                      <div className="text-center sm:text-right">
                        <h2 className="font-semibold text-neutral-900">היסטוריית הכנסות</h2>
                        <p className="text-xs text-neutral-400">{data.earnings.length} רשומות</p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowAddEarningModal(true)}
                      className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                    >
                      <Plus size={18} className="text-neutral-500" strokeWidth={2} />
                    </motion.button>
                  </div>

                  {data.earnings.length === 0 ? (
                    <div className="text-center py-8">
                      <DollarSign size={48} className="text-neutral-300 mx-auto mb-4" />
                      <p className="text-neutral-600 mb-4 text-center">עדיין אין רשומות הכנסה</p>
                      <button
                        onClick={() => setShowAddEarningModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors"
                      >
                        <Plus size={16} />
                        הוסף הכנסה ראשונה
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {data.earnings.slice(0, 20).map((entry, index) => (
                        <motion.div
                          key={entry.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.05 * index }}
                          className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl"
                        >
                          <div className="text-center sm:text-right">
                            <p className="font-medium text-neutral-900">
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
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Monthly Breakdown */}
                  {data.monthlyEarningsBreakdown.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-neutral-100">
                      <h3 className="text-sm font-semibold text-neutral-700 mb-4 text-center">
                        סיכום חודשי
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {data.monthlyEarningsBreakdown.slice(0, 6).map((month) => (
                          <div key={month.month} className="p-3 bg-neutral-50 rounded-xl text-center">
                            <p className="text-xs text-neutral-500">
                              {getMonthName(new Date(month.month + '-01'))}
                            </p>
                            <p className="font-semibold text-emerald-600">
                              {formatEarnings(month.total)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </PremiumCard>
            </motion.div>
          </div>

          {/* Right Column - Activity */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <motion.div variants={itemVariants}>
              <PremiumCard delay={0.4}>
                <div className="p-5 sm:p-6">
                  <div className="flex items-center justify-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center">
                      <Clock size={18} className="text-purple-600" strokeWidth={2} />
                    </div>
                    <div className="text-center">
                      <h2 className="font-semibold text-neutral-900">פעילות אחרונה</h2>
                      <p className="text-xs text-neutral-400">עדכונים אחרונים</p>
                    </div>
                  </div>

                  {data.recentActivity.length === 0 ? (
                    <div className="text-center py-8">
                      <Clock size={48} className="text-neutral-300 mx-auto mb-4" />
                      <p className="text-neutral-600 text-center">אין פעילות אחרונה</p>
                    </div>
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
                            className="flex items-start gap-3 p-2.5 hover:bg-neutral-50 rounded-lg transition-colors"
                          >
                            <div className="text-lg flex-shrink-0">{config.icon}</div>
                            <div className="flex-1 min-w-0 text-center sm:text-right">
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
              </PremiumCard>
            </motion.div>

            {/* Quick Actions */}
            <motion.div variants={itemVariants}>
              <PremiumCard delay={0.45}>
                <div className="p-5 sm:p-6">
                  <h3 className="font-semibold text-neutral-900 mb-4 text-center">פעולות מהירות</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setShowAddEarningModal(true)}
                      className="w-full flex items-center justify-center gap-3 p-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl transition-colors"
                    >
                      <DollarSign size={18} />
                      <span className="font-medium">הוסף רשומת הכנסה</span>
                    </button>
                  </div>
                </div>
              </PremiumCard>
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
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-neutral-900 text-center flex-1">
              הוספת רשומת הכנסה
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-neutral-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Amount & Currency */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-neutral-700 mb-1.5 text-center">
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
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 text-center"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5 text-center">
                  מטבע
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 text-center"
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
              <label className="block text-sm font-medium text-neutral-700 mb-1.5 text-center">
                תאריך
              </label>
              <input
                type="date"
                value={earnedOn}
                onChange={(e) => setEarnedOn(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 text-center"
              />
            </div>

            {/* Company */}
            {companies.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5 text-center">
                  חברה (אופציונלי)
                </label>
                <select
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 text-center"
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
              <label className="block text-sm font-medium text-neutral-700 mb-1.5 text-center">
                הערות (אופציונלי)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="פרטים נוספים על ההכנסה..."
                rows={2}
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 resize-none text-center"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
            </button>
          </form>
        </div>
      </motion.div>
    </motion.div>
  )
}
