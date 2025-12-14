'use client'

import { useState, useEffect, useMemo, use } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock,
  ChevronLeft,
  ChevronDown,
  Plus,
  Filter,
  Calendar,
  DollarSign,
  Target,
  FileText,
  Package,
  Video,
  Trash2,
  X,
  Check,
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import PremiumCard from '@/components/app/PremiumCard'
import type { TimelineItem, TimelineItemType, CreateTimelineItemPayload } from '@/types/timeline'
import { TIMELINE_ITEM_TYPES, getTimelineTypeConfig, formatTimelineDate } from '@/types/timeline'

interface TimelinePageProps {
  params: Promise<{ id: string }>
}

export default function CompanyTimelinePage({ params }: TimelinePageProps) {
  const { id: companyId } = use(params)
  const [items, setItems] = useState<TimelineItem[]>([])
  const [company, setCompany] = useState<{ id: string; name: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState<TimelineItemType | 'all'>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [addType, setAddType] = useState<TimelineItemType>('milestone')

  useEffect(() => {
    fetchData()
  }, [companyId])

  const fetchData = async () => {
    try {
      // Fetch company info
      const companyRes = await fetch(`/api/companies/${companyId}`)
      const companyData = await companyRes.json()
      if (companyData.company) {
        setCompany(companyData.company)
      }

      // Fetch timeline items
      const timelineRes = await fetch(`/api/company-timeline?companyId=${companyId}`)
      const timelineData = await timelineRes.json()
      if (timelineData.items) {
        setItems(timelineData.items)
      }
    } catch (error) {
      console.error('Error fetching timeline:', error)
      toast.error('שגיאה בטעינת ציר הזמן')
    } finally {
      setLoading(false)
    }
  }

  const filteredItems = useMemo(() => {
    if (selectedType === 'all') return items
    return items.filter(item => item.type === selectedType)
  }, [items, selectedType])

  // Group items by month
  const groupedItems = useMemo(() => {
    const groups: Map<string, TimelineItem[]> = new Map()

    filteredItems.forEach(item => {
      const date = new Date(item.occurredOn)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      if (!groups.has(key)) {
        groups.set(key, [])
      }
      groups.get(key)!.push(item)
    })

    return Array.from(groups.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([key, items]) => {
        const [year, month] = key.split('-').map(Number)
        const monthName = new Date(year, month - 1).toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })
        return { monthKey: key, monthName, items: items.sort((a, b) =>
          new Date(b.occurredOn).getTime() - new Date(a.occurredOn).getTime()
        )}
      })
  }, [filteredItems])

  const handleDelete = async (id: string) => {
    if (!confirm('האם למחוק פריט זה?')) return

    try {
      const res = await fetch(`/api/company-timeline/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setItems(prev => prev.filter(item => item.id !== id))
        toast.success('הפריט נמחק')
      } else {
        toast.error('שגיאה במחיקת הפריט')
      }
    } catch (error) {
      toast.error('שגיאה במחיקת הפריט')
    }
  }

  const handleItemCreated = (item: TimelineItem) => {
    setItems(prev => [item, ...prev])
    setShowAddModal(false)
    toast.success('הפריט נוסף לציר הזמן')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50/50 via-white to-violet-50/50" dir="rtl">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-neutral-200/50 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href={`/companies`} className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                <ChevronLeft size={20} className="text-neutral-500" />
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
                  <Clock size={20} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-neutral-900">ציר זמן</h1>
                  <p className="text-xs text-neutral-500">{company?.name || 'טוען...'}</p>
                </div>
              </div>
            </div>

            {/* Quick add buttons */}
            <div className="flex items-center gap-2">
              {(['milestone', 'deliverable', 'payment', 'note'] as TimelineItemType[]).map(type => {
                const config = getTimelineTypeConfig(type)
                return (
                  <button
                    key={type}
                    onClick={() => { setAddType(type); setShowAddModal(true) }}
                    className={`p-2 rounded-lg transition-colors hover:opacity-80 ${config.bgColor}`}
                    title={`הוסף ${config.label}`}
                  >
                    <span className="text-sm">{config.icon}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedType === 'all'
                ? 'bg-neutral-900 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            הכל
          </button>
          {Object.values(TIMELINE_ITEM_TYPES).map(config => (
            <button
              key={config.id}
              onClick={() => setSelectedType(config.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
                selectedType === config.id
                  ? 'bg-neutral-900 text-white'
                  : `${config.bgColor} ${config.color} hover:opacity-80`
              }`}
            >
              <span>{config.icon}</span>
              {config.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="max-w-4xl mx-auto px-4 pb-8">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-neutral-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 mx-auto bg-neutral-100 rounded-2xl flex items-center justify-center mb-4">
              <Clock size={32} className="text-neutral-400" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              אין פריטים בציר הזמן
            </h3>
            <p className="text-neutral-500 mb-6">
              הוסף אבני דרך, תוצרים ותשלומים
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium rounded-xl shadow-lg"
            >
              <Plus size={18} className="inline ml-2" />
              הוסף פריט ראשון
            </button>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {groupedItems.map(({ monthKey, monthName, items: monthItems }) => (
              <div key={monthKey}>
                {/* Month header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px flex-1 bg-neutral-200" />
                  <span className="text-sm font-medium text-neutral-500 bg-white px-3 py-1 rounded-full border border-neutral-200">
                    {monthName}
                  </span>
                  <div className="h-px flex-1 bg-neutral-200" />
                </div>

                {/* Timeline items */}
                <div className="relative">
                  {/* Vertical line */}
                  <div className="absolute right-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-violet-200 via-indigo-200 to-neutral-200" />

                  <div className="space-y-4">
                    {monthItems.map((item, index) => (
                      <TimelineCard
                        key={item.id}
                        item={item}
                        index={index}
                        onDelete={() => handleDelete(item.id)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddTimelineItemModal
            companyId={companyId}
            initialType={addType}
            onClose={() => setShowAddModal(false)}
            onCreated={handleItemCreated}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// Timeline Card Component
function TimelineCard({
  item,
  index,
  onDelete,
}: {
  item: TimelineItem
  index: number
  onDelete: () => void
}) {
  const config = getTimelineTypeConfig(item.type)

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="relative pr-14"
    >
      {/* Icon dot */}
      <div className={`absolute right-3 w-6 h-6 rounded-full ${config.bgColor} flex items-center justify-center border-2 border-white shadow-sm`}>
        <span className="text-xs">{config.icon}</span>
      </div>

      {/* Card */}
      <PremiumCard>
        <div className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 text-center">
              {/* Type badge */}
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.color}`}>
                {config.label}
              </span>

              {/* Title */}
              <h3 className="font-semibold text-neutral-900 mt-2">{item.title}</h3>

              {/* Details */}
              {item.details && (
                <p className="text-sm text-neutral-600 mt-1">{item.details}</p>
              )}

              {/* Amount */}
              {item.amount && (
                <div className="flex items-center justify-center gap-1 mt-2 text-emerald-600 font-medium">
                  <DollarSign size={14} />
                  <span>{item.amount.toLocaleString()} ₪</span>
                </div>
              )}

              {/* Date */}
              <p className="text-xs text-neutral-400 mt-2">
                {formatTimelineDate(new Date(item.occurredOn))}
              </p>
            </div>

            {/* Delete button */}
            <button
              onClick={onDelete}
              className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </PremiumCard>
    </motion.div>
  )
}

// Add Modal Component
function AddTimelineItemModal({
  companyId,
  initialType,
  onClose,
  onCreated,
}: {
  companyId: string
  initialType: TimelineItemType
  onClose: () => void
  onCreated: (item: TimelineItem) => void
}) {
  const [type, setType] = useState<TimelineItemType>(initialType)
  const [title, setTitle] = useState('')
  const [details, setDetails] = useState('')
  const [amount, setAmount] = useState('')
  const [occurredOn, setOccurredOn] = useState(new Date().toISOString().split('T')[0])
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('יש להזין כותרת')
      return
    }

    setSaving(true)
    try {
      const payload: CreateTimelineItemPayload = {
        companyId,
        type,
        title: title.trim(),
        details: details.trim() || undefined,
        amount: amount ? parseFloat(amount) : undefined,
        occurredOn,
      }

      const res = await fetch('/api/company-timeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (res.ok && data.item) {
        onCreated(data.item)
      } else {
        toast.error(data.error || 'שגיאה בהוספת הפריט')
      }
    } catch (error) {
      toast.error('שגיאה בהוספת הפריט')
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
            <h2 className="text-xl font-bold text-neutral-900">הוסף לציר הזמן</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-neutral-500" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Type selection */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">סוג</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.values(TIMELINE_ITEM_TYPES).map(config => (
                <button
                  key={config.id}
                  onClick={() => setType(config.id)}
                  className={`p-2 rounded-xl text-center transition-all ${
                    type === config.id
                      ? 'ring-2 ring-violet-500 bg-violet-50'
                      : `${config.bgColor} hover:opacity-80`
                  }`}
                >
                  <span className="text-lg block">{config.icon}</span>
                  <span className="text-xs font-medium">{config.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">כותרת *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="לדוגמה: סיום פרויקט ראשון"
              className="w-full p-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent text-center"
            />
          </div>

          {/* Details */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">פרטים</label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="פרטים נוספים..."
              rows={2}
              className="w-full p-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none text-center"
            />
          </div>

          {/* Amount (for payment type) */}
          {type === 'payment' && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">סכום (₪)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full p-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent text-center"
              />
            </div>
          )}

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">תאריך</label>
            <input
              type="date"
              value={occurredOn}
              onChange={(e) => setOccurredOn(e.target.value)}
              className="w-full p-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent text-center"
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || saving}
            className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? 'שומר...' : (
              <>
                <Check size={18} />
                הוסף לציר הזמן
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
