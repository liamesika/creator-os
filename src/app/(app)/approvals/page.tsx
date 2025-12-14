'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Check,
  Clock,
  MessageSquare,
  Plus,
  Filter,
  ChevronDown,
  X,
  Send,
  Image,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import PremiumCard from '@/components/app/PremiumCard'
import PremiumEmptyState from '@/components/app/PremiumEmptyState'
import BottomSheet from '@/components/ui/BottomSheet'
import ConfirmationModal from '@/components/ui/ConfirmationModal'
import { useCompaniesStore } from '@/stores/companiesStore'
import type {
  ApprovalItem,
  ApprovalComment,
  ApprovalItemType,
  ApprovalStatus,
  CreateApprovalPayload,
} from '@/types/client-portal'
import {
  APPROVAL_TYPE_CONFIG,
  APPROVAL_STATUS_CONFIG,
} from '@/types/client-portal'

type FilterStatus = ApprovalStatus | 'all'

const STATUS_FILTERS: { value: FilterStatus; label: string }[] = [
  { value: 'all', label: 'הכל' },
  { value: 'pending', label: 'ממתינים' },
  { value: 'approved', label: 'אושרו' },
  { value: 'changes_requested', label: 'נדרשים שינויים' },
  { value: 'draft', label: 'טיוטות' },
]

export default function ApprovalsPage() {
  const { companies, getActiveCompanies } = useCompaniesStore()
  const [items, setItems] = useState<ApprovalItem[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all')
  const [companyFilter, setCompanyFilter] = useState<string>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<ApprovalItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchApprovals()
  }, [])

  const fetchApprovals = async () => {
    try {
      const res = await fetch('/api/approvals')
      const data = await res.json()
      if (data.approvals) {
        setItems(data.approvals)
      }
    } catch (error) {
      console.error('Error fetching approvals:', error)
      toast.error('שגיאה בטעינת אישורים')
    } finally {
      setLoading(false)
    }
  }

  const filteredItems = useMemo(() => {
    let result = items
    if (statusFilter !== 'all') {
      result = result.filter(item => item.status === statusFilter)
    }
    if (companyFilter !== 'all') {
      result = result.filter(item => item.companyId === companyFilter)
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [items, statusFilter, companyFilter])

  const handleItemCreated = (item: ApprovalItem) => {
    setItems(prev => [item, ...prev])
    setShowCreateModal(false)
    toast.success('פריט אישור נוצר')
  }

  const handleStatusChange = async (itemId: string, newStatus: ApprovalStatus) => {
    try {
      const res = await fetch(`/api/approvals/${itemId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        setItems(prev => prev.map(item =>
          item.id === itemId ? { ...item, status: newStatus } : item
        ))
        if (selectedItem?.id === itemId) {
          setSelectedItem(prev => prev ? { ...prev, status: newStatus } : null)
        }
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
      const res = await fetch(`/api/approvals/${deleteTarget.id}`, { method: 'DELETE' })
      if (res.ok) {
        setItems(prev => prev.filter(item => item.id !== deleteTarget.id))
        setSelectedItem(null)
        setDeleteTarget(null)
        toast.success('הפריט נמחק')
      }
    } catch (error) {
      toast.error('שגיאה במחיקת פריט')
    } finally {
      setIsDeleting(false)
    }
  }

  const activeCompanies = getActiveCompanies()

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50/50 via-white to-indigo-50/50" dir="rtl">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-neutral-200/50 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25">
                <Check size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-neutral-900">מרכז אישורים</h1>
                <p className="text-xs text-neutral-500">ניהול תכנים לאישור לקוחות</p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium rounded-xl shadow-lg shadow-violet-500/25 flex items-center gap-2"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">פריט חדש</span>
            </motion.button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {STATUS_FILTERS.map(filter => (
              <button
                key={filter.value}
                onClick={() => setStatusFilter(filter.value)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  statusFilter === filter.value
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
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
        ) : filteredItems.length === 0 ? (
          <PremiumEmptyState
            icon={Check}
            title="אין פריטי אישור"
            description="צרו פריט אישור ראשון לשליחה ללקוחות"
            actionLabel="צור פריט אישור"
            onAction={() => setShowCreateModal(true)}
            color="violet"
          />
        ) : (
          <div className="grid gap-4">
            {filteredItems.map((item, index) => (
              <ApprovalCard
                key={item.id}
                item={item}
                index={index}
                onClick={() => setSelectedItem(item)}
                onStatusChange={(status) => handleStatusChange(item.id, status)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateApprovalModal
            companies={activeCompanies}
            onClose={() => setShowCreateModal(false)}
            onCreated={handleItemCreated}
          />
        )}
      </AnimatePresence>

      {/* Item Detail Sheet */}
      <BottomSheet
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title={selectedItem?.title || ''}
      >
        {selectedItem && (
          <ApprovalDetailView
            item={selectedItem}
            onStatusChange={(status) => handleStatusChange(selectedItem.id, status)}
            onDelete={() => setDeleteTarget({ id: selectedItem.id, title: selectedItem.title })}
          />
        )}
      </BottomSheet>

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="מחיקת פריט אישור"
        message={`האם למחוק את הפריט "${deleteTarget?.title || ''}"? פעולה זו אינה ניתנת לביטול.`}
        confirmLabel="מחק"
        cancelLabel="ביטול"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  )
}

// Approval Card Component
function ApprovalCard({
  item,
  index,
  onClick,
  onStatusChange,
}: {
  item: ApprovalItem
  index: number
  onClick: () => void
  onStatusChange: (status: ApprovalStatus) => void
}) {
  const typeConfig = APPROVAL_TYPE_CONFIG[item.type]
  const statusConfig = APPROVAL_STATUS_CONFIG[item.status]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <PremiumCard interactive onClick={onClick}>
        <div className="p-4">
          <div className="flex items-start gap-4">
            {/* Type icon */}
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${
              typeConfig.color === 'blue' ? 'bg-blue-100' :
              typeConfig.color === 'violet' ? 'bg-violet-100' :
              typeConfig.color === 'pink' ? 'bg-pink-100' :
              typeConfig.color === 'neutral' ? 'bg-neutral-200' :
              'bg-neutral-100'
            }`}>
              {typeConfig.icon}
            </div>

            <div className="flex-1 min-w-0 text-center">
              {/* Status badge */}
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
                {statusConfig.label}
              </span>

              {/* Title */}
              <h3 className="font-semibold text-neutral-900 mt-1 truncate">{item.title}</h3>

              {/* Company name */}
              {item.companyName && (
                <p className="text-sm text-neutral-500">{item.companyName}</p>
              )}

              {/* Meta */}
              <div className="flex items-center justify-center gap-4 mt-2 text-xs text-neutral-400">
                {item.dueOn && (
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(item.dueOn).toLocaleDateString('he-IL')}
                  </span>
                )}
                {item.commentsCount && item.commentsCount > 0 && (
                  <span className="flex items-center gap-1">
                    <MessageSquare size={12} />
                    {item.commentsCount}
                  </span>
                )}
              </div>
            </div>

            {/* Quick status actions */}
            <div className="flex flex-col gap-1">
              {item.status === 'draft' && (
                <button
                  onClick={(e) => { e.stopPropagation(); onStatusChange('pending') }}
                  className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                  title="שלח לאישור"
                >
                  <Send size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </PremiumCard>
    </motion.div>
  )
}

// Create Modal Component
function CreateApprovalModal({
  companies,
  onClose,
  onCreated,
}: {
  companies: { id: string; name: string }[]
  onClose: () => void
  onCreated: (item: ApprovalItem) => void
}) {
  const [title, setTitle] = useState('')
  const [type, setType] = useState<ApprovalItemType>('post')
  const [companyId, setCompanyId] = useState(companies[0]?.id || '')
  const [dueOn, setDueOn] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    if (!title.trim() || !companyId) {
      toast.error('יש למלא כותרת ולבחור חברה')
      return
    }

    setSaving(true)
    try {
      const payload: CreateApprovalPayload = {
        companyId,
        title: title.trim(),
        type,
        status: 'draft',
        dueOn: dueOn || undefined,
        notes: notes.trim() || undefined,
      }

      const res = await fetch('/api/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (res.ok && data.approval) {
        onCreated({
          ...data.approval,
          companyName: companies.find(c => c.id === companyId)?.name,
          commentsCount: 0,
        })
      } else {
        toast.error(data.error || 'שגיאה ביצירת פריט')
      }
    } catch (error) {
      toast.error('שגיאה ביצירת פריט')
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
            <h2 className="text-xl font-bold text-neutral-900">פריט אישור חדש</h2>
            <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-lg">
              <X size={20} className="text-neutral-500" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Company */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">חברה *</label>
            <select
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              className="w-full p-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-violet-500 text-center"
            >
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">סוג תוכן</label>
            <div className="grid grid-cols-5 gap-2">
              {(Object.entries(APPROVAL_TYPE_CONFIG) as [ApprovalItemType, typeof APPROVAL_TYPE_CONFIG['post']][]).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => setType(key)}
                  className={`p-2 rounded-xl text-center transition-all ${
                    type === key
                      ? 'ring-2 ring-violet-500 bg-violet-50'
                      : 'bg-neutral-50 hover:bg-neutral-100'
                  }`}
                >
                  <span className="text-lg block">{config.icon}</span>
                  <span className="text-[10px] font-medium">{config.label}</span>
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
              placeholder="לדוגמה: פוסט השקה"
              className="w-full p-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-violet-500 text-center"
            />
          </div>

          {/* Due date */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">תאריך יעד</label>
            <input
              type="date"
              value={dueOn}
              onChange={(e) => setDueOn(e.target.value)}
              className="w-full p-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-violet-500 text-center"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">הערות</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="פרטים נוספים..."
              rows={2}
              className="w-full p-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-violet-500 resize-none text-center"
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || !companyId || saving}
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
                צור פריט אישור
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Detail View Component
function ApprovalDetailView({
  item,
  onStatusChange,
  onDelete,
}: {
  item: ApprovalItem
  onStatusChange: (status: ApprovalStatus) => void
  onDelete: () => void
}) {
  const [comments, setComments] = useState<ApprovalComment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loadingComments, setLoadingComments] = useState(true)
  const [sendingComment, setSendingComment] = useState(false)

  const typeConfig = APPROVAL_TYPE_CONFIG[item.type]
  const statusConfig = APPROVAL_STATUS_CONFIG[item.status]

  useEffect(() => {
    fetchComments()
  }, [item.id])

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/approvals/${item.id}`)
      const data = await res.json()
      if (data.comments) {
        setComments(data.comments)
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setLoadingComments(false)
    }
  }

  const handleSendComment = async () => {
    if (!newComment.trim()) return

    setSendingComment(true)
    try {
      const res = await fetch(`/api/approvals/${item.id}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newComment.trim() }),
      })

      const data = await res.json()
      if (res.ok && data.comment) {
        setComments(prev => [...prev, data.comment])
        setNewComment('')
      }
    } catch (error) {
      toast.error('שגיאה בשליחת תגובה')
    } finally {
      setSendingComment(false)
    }
  }

  return (
    <div className="p-4 space-y-6" dir="rtl">
      {/* Header info */}
      <div className="text-center">
        <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-2xl mb-4 ${
          typeConfig.color === 'blue' ? 'bg-blue-100' :
          typeConfig.color === 'violet' ? 'bg-violet-100' :
          typeConfig.color === 'pink' ? 'bg-pink-100' :
          typeConfig.color === 'neutral' ? 'bg-neutral-200' :
          'bg-neutral-100'
        }`}>
          {typeConfig.icon}
        </div>

        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
          {statusConfig.label}
        </span>

        <h2 className="text-lg font-bold text-neutral-900 mt-2">{item.title}</h2>
        {item.companyName && (
          <p className="text-sm text-neutral-500">{item.companyName}</p>
        )}

        {item.notes && (
          <p className="text-sm text-neutral-600 mt-3 p-3 bg-neutral-50 rounded-xl">
            {item.notes}
          </p>
        )}
      </div>

      {/* Status actions */}
      <div className="grid grid-cols-2 gap-2">
        {item.status === 'draft' && (
          <button
            onClick={() => onStatusChange('pending')}
            className="py-3 bg-amber-500 text-white font-medium rounded-xl flex items-center justify-center gap-2"
          >
            <Send size={16} />
            שלח לאישור
          </button>
        )}
        {item.status === 'pending' && (
          <>
            <button
              onClick={() => onStatusChange('approved')}
              className="py-3 bg-emerald-500 text-white font-medium rounded-xl flex items-center justify-center gap-2"
            >
              <Check size={16} />
              אשר
            </button>
            <button
              onClick={() => onStatusChange('changes_requested')}
              className="py-3 bg-red-500 text-white font-medium rounded-xl flex items-center justify-center gap-2"
            >
              בקש שינויים
            </button>
          </>
        )}
        {item.status === 'changes_requested' && (
          <button
            onClick={() => onStatusChange('pending')}
            className="py-3 bg-amber-500 text-white font-medium rounded-xl flex items-center justify-center gap-2"
          >
            <Send size={16} />
            שלח שוב לאישור
          </button>
        )}
        <button
          onClick={onDelete}
          className="py-3 bg-neutral-100 text-red-600 font-medium rounded-xl hover:bg-red-50 col-span-2"
        >
          מחק פריט
        </button>
      </div>

      {/* Comments */}
      <div>
        <h3 className="text-sm font-semibold text-neutral-700 mb-3 flex items-center gap-2">
          <MessageSquare size={16} className="text-neutral-400" />
          תגובות ({comments.length})
        </h3>

        {loadingComments ? (
          <div className="flex justify-center py-4">
            <Loader2 size={20} className="animate-spin text-neutral-400" />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-sm text-neutral-500 text-center py-4">אין תגובות עדיין</p>
        ) : (
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {comments.map(comment => (
              <div
                key={comment.id}
                className={`p-3 rounded-xl text-sm ${
                  comment.authorType === 'client'
                    ? 'bg-blue-50 mr-auto ml-0 max-w-[85%]'
                    : 'bg-neutral-100 ml-auto mr-0 max-w-[85%]'
                }`}
              >
                <p className="font-medium text-xs text-neutral-500 mb-1">
                  {comment.authorName || (comment.authorType === 'client' ? 'לקוח' : 'יוצר')}
                </p>
                <p className="text-neutral-700">{comment.message}</p>
                <p className="text-[10px] text-neutral-400 mt-1">
                  {new Date(comment.createdAt).toLocaleString('he-IL')}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Add comment */}
        <div className="flex gap-2 mt-4">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="כתוב תגובה..."
            className="flex-1 p-3 border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500"
            onKeyPress={(e) => e.key === 'Enter' && handleSendComment()}
          />
          <button
            onClick={handleSendComment}
            disabled={!newComment.trim() || sendingComment}
            className="p-3 bg-violet-600 text-white rounded-xl disabled:opacity-50"
          >
            {sendingComment ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
      </div>
    </div>
  )
}
