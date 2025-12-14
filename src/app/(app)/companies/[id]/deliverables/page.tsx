'use client'

import { useState, useEffect, useMemo, use } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package,
  ChevronLeft,
  ChevronRight,
  Plus,
  Check,
  X,
  Minus,
  Loader2,
  Trash2,
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import PremiumCard from '@/components/app/PremiumCard'
import PremiumEmptyState from '@/components/app/PremiumEmptyState'
import ConfirmationModal from '@/components/ui/ConfirmationModal'
import type {
  Deliverable,
  DeliverableStatus,
  CreateDeliverablePayload,
} from '@/types/client-portal'
import { DELIVERABLE_STATUS_CONFIG } from '@/types/client-portal'

interface DeliverablesPageProps {
  params: Promise<{ id: string }>
}

export default function CompanyDeliverablesPage({ params }: DeliverablesPageProps) {
  const { id: companyId } = use(params)
  const [deliverables, setDeliverables] = useState<Deliverable[]>([])
  const [company, setCompany] = useState<{ id: string; name: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  const [showAddModal, setShowAddModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchData()
  }, [companyId, currentMonth])

  const fetchData = async () => {
    try {
      // Fetch company info (using the store or direct fetch)
      const companyRes = await fetch(`/api/company-timeline?companyId=${companyId}`)
      // Get company name from somewhere, or just use a placeholder

      // Fetch deliverables for this month
      const delRes = await fetch(`/api/deliverables?companyId=${companyId}&month=${currentMonth}`)
      const delData = await delRes.json()
      if (delData.deliverables) {
        setDeliverables(delData.deliverables)
      }
    } catch (error) {
      console.error('Error fetching deliverables:', error)
      toast.error('שגיאה בטעינת תוצרים')
    } finally {
      setLoading(false)
    }
  }

  const navigateMonth = (direction: number) => {
    const [year, month] = currentMonth.split('-').map(Number)
    const newDate = new Date(year, month - 1 + direction)
    setCurrentMonth(`${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}`)
    setLoading(true)
  }

  const formatMonthDisplay = (monthStr: string) => {
    const [year, month] = monthStr.split('-').map(Number)
    return new Date(year, month - 1).toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })
  }

  const handleDeliverableCreated = (deliverable: Deliverable) => {
    setDeliverables(prev => [deliverable, ...prev])
    setShowAddModal(false)
    toast.success('תוצר נוסף')
  }

  const handleUpdateQuantity = async (id: string, completedQuantity: number) => {
    try {
      const res = await fetch(`/api/deliverables/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completedQuantity }),
      })

      if (res.ok) {
        setDeliverables(prev => prev.map(d =>
          d.id === id ? { ...d, completedQuantity } : d
        ))
      }
    } catch (error) {
      toast.error('שגיאה בעדכון')
    }
  }

  const handleUpdateStatus = async (id: string, status: DeliverableStatus) => {
    try {
      const res = await fetch(`/api/deliverables/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (res.ok) {
        setDeliverables(prev => prev.map(d =>
          d.id === id ? { ...d, status } : d
        ))
        toast.success('הסטטוס עודכן')
      }
    } catch (error) {
      toast.error('שגיאה בעדכון סטטוס')
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return

    setIsDeleting(true)
    try {
      const res = await fetch(`/api/deliverables/${deleteTarget.id}`, { method: 'DELETE' })
      if (res.ok) {
        setDeliverables(prev => prev.filter(d => d.id !== deleteTarget.id))
        toast.success('התוצר נמחק')
        setDeleteTarget(null)
      }
    } catch (error) {
      toast.error('שגיאה במחיקה')
    } finally {
      setIsDeleting(false)
    }
  }

  // Stats
  const stats = useMemo(() => {
    const total = deliverables.reduce((sum, d) => sum + d.quantity, 0)
    const completed = deliverables.reduce((sum, d) => sum + d.completedQuantity, 0)
    return { total, completed, progress: total > 0 ? Math.round((completed / total) * 100) : 0 }
  }, [deliverables])

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50/50 via-white to-indigo-50/50" dir="rtl">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-neutral-200/50 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Link href="/companies" className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                <ChevronLeft size={20} className="text-neutral-500" />
              </Link>
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25">
                <Package size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-neutral-900">תוצרים</h1>
                <p className="text-xs text-neutral-500">מעקב משלוחים חודשיים</p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium rounded-xl shadow-lg shadow-violet-500/25 flex items-center gap-2"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">תוצר חדש</span>
            </motion.button>
          </div>

          {/* Month navigation */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <ChevronRight size={20} className="text-neutral-500" />
            </button>
            <span className="text-lg font-semibold text-neutral-900 min-w-[150px] text-center">
              {formatMonthDisplay(currentMonth)}
            </span>
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <ChevronLeft size={20} className="text-neutral-500" />
            </button>
          </div>

          {/* Progress */}
          {deliverables.length > 0 && (
            <div className="bg-neutral-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-neutral-600">התקדמות חודשית</span>
                <span className="font-bold text-violet-600">
                  {stats.completed}/{stats.total} ({stats.progress}%)
                </span>
              </div>
              <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.progress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-neutral-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : deliverables.length === 0 ? (
          <PremiumEmptyState
            icon={Package}
            title="אין תוצרים לחודש זה"
            description="הוסיפו תוצרים למעקב משלוחים"
            actionLabel="הוסף תוצר"
            onAction={() => setShowAddModal(true)}
            color="violet"
          />
        ) : (
          <div className="space-y-4">
            {deliverables.map((deliverable, index) => (
              <DeliverableCard
                key={deliverable.id}
                deliverable={deliverable}
                index={index}
                onUpdateQuantity={(qty) => handleUpdateQuantity(deliverable.id, qty)}
                onUpdateStatus={(status) => handleUpdateStatus(deliverable.id, status)}
                onDelete={() => setDeleteTarget({ id: deliverable.id, title: deliverable.title })}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showAddModal && (
          <CreateDeliverableModal
            companyId={companyId}
            month={currentMonth}
            onClose={() => setShowAddModal(false)}
            onCreated={handleDeliverableCreated}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="מחיקת תוצר"
        message={`האם למחוק את התוצר "${deleteTarget?.title || ''}"? פעולה זו אינה ניתנת לביטול.`}
        confirmLabel="מחק"
        cancelLabel="ביטול"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  )
}

// Deliverable Card Component
function DeliverableCard({
  deliverable,
  index,
  onUpdateQuantity,
  onUpdateStatus,
  onDelete,
}: {
  deliverable: Deliverable
  index: number
  onUpdateQuantity: (qty: number) => void
  onUpdateStatus: (status: DeliverableStatus) => void
  onDelete: () => void
}) {
  const statusConfig = DELIVERABLE_STATUS_CONFIG[deliverable.status]
  const progress = deliverable.quantity > 0
    ? Math.round((deliverable.completedQuantity / deliverable.quantity) * 100)
    : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <PremiumCard>
        <div className="p-4">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1 text-center">
              {/* Status badge */}
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
                {statusConfig.label}
              </span>

              {/* Title */}
              <h3 className="font-semibold text-neutral-900 mt-1">{deliverable.title}</h3>
            </div>

            {/* Delete */}
            <button
              onClick={onDelete}
              className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1 text-xs text-neutral-500">
              <span>התקדמות</span>
              <span className="font-medium">{deliverable.completedQuantity}/{deliverable.quantity}</span>
            </div>
            <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${
                  progress === 100 ? 'bg-emerald-500' : 'bg-violet-500'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Quantity controls */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => onUpdateQuantity(Math.max(0, deliverable.completedQuantity - 1))}
              disabled={deliverable.completedQuantity === 0}
              className="p-2 bg-neutral-100 rounded-lg hover:bg-neutral-200 disabled:opacity-50 transition-colors"
            >
              <Minus size={16} className="text-neutral-600" />
            </button>

            <div className="text-center">
              <span className="text-2xl font-bold text-neutral-900">{deliverable.completedQuantity}</span>
              <span className="text-neutral-400 mx-1">/</span>
              <span className="text-lg text-neutral-500">{deliverable.quantity}</span>
            </div>

            <button
              onClick={() => onUpdateQuantity(Math.min(deliverable.quantity, deliverable.completedQuantity + 1))}
              disabled={deliverable.completedQuantity >= deliverable.quantity}
              className="p-2 bg-neutral-100 rounded-lg hover:bg-neutral-200 disabled:opacity-50 transition-colors"
            >
              <Plus size={16} className="text-neutral-600" />
            </button>
          </div>

          {/* Status quick actions */}
          <div className="flex gap-2 mt-4">
            {deliverable.status !== 'delivered' && deliverable.completedQuantity >= deliverable.quantity && (
              <button
                onClick={() => onUpdateStatus('delivered')}
                className="flex-1 py-2 bg-emerald-500 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-1"
              >
                <Check size={14} />
                סמן כנמסר
              </button>
            )}
            {deliverable.status === 'planned' && (
              <button
                onClick={() => onUpdateStatus('in_progress')}
                className="flex-1 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg"
              >
                התחל עבודה
              </button>
            )}
          </div>
        </div>
      </PremiumCard>
    </motion.div>
  )
}

// Create Modal Component
function CreateDeliverableModal({
  companyId,
  month,
  onClose,
  onCreated,
}: {
  companyId: string
  month: string
  onClose: () => void
  onCreated: (deliverable: Deliverable) => void
}) {
  const [title, setTitle] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('יש להזין שם לתוצר')
      return
    }

    setSaving(true)
    try {
      const payload: CreateDeliverablePayload = {
        companyId,
        month,
        title: title.trim(),
        quantity,
        status: 'planned',
      }

      const res = await fetch('/api/deliverables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (res.ok && data.deliverable) {
        onCreated(data.deliverable)
      } else {
        toast.error(data.error || 'שגיאה ביצירת תוצר')
      }
    } catch (error) {
      toast.error('שגיאה ביצירת תוצר')
    } finally {
      setSaving(false)
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
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden"
        dir="rtl"
      >
        <div className="p-6 border-b border-neutral-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-neutral-900">תוצר חדש</h2>
            <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-lg">
              <X size={20} className="text-neutral-500" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">שם התוצר *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="לדוגמה: פוסטים, ריל, סטוריז"
              className="w-full p-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-violet-500 text-center"
            />
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">כמות</label>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-3 bg-neutral-100 rounded-xl hover:bg-neutral-200 transition-colors"
              >
                <Minus size={20} className="text-neutral-600" />
              </button>
              <span className="text-3xl font-bold text-neutral-900 min-w-[60px] text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-3 bg-neutral-100 rounded-xl hover:bg-neutral-200 transition-colors"
              >
                <Plus size={20} className="text-neutral-600" />
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || saving}
            className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                יוצר...
              </>
            ) : (
              <>
                <Check size={18} />
                הוסף תוצר
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
