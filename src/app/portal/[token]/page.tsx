'use client'

import { useState, useEffect, use } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Check,
  Clock,
  MessageSquare,
  Send,
  Package,
  Calendar,
  ChevronDown,
  Loader2,
  CheckCircle,
  AlertCircle,
  User,
  Sparkles,
} from 'lucide-react'
import type { PortalPublicPayload, ApprovalStatus } from '@/types/client-portal'
import { APPROVAL_TYPE_CONFIG, APPROVAL_STATUS_CONFIG } from '@/types/client-portal'

interface PortalPageProps {
  params: Promise<{ token: string }>
}

export default function ClientPortalPage({ params }: PortalPageProps) {
  const { token } = use(params)
  const [portalData, setPortalData] = useState<PortalPublicPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedApproval, setSelectedApproval] = useState<string | null>(null)
  const [clientName, setClientName] = useState('')

  useEffect(() => {
    fetchPortalData()
  }, [token])

  const fetchPortalData = async () => {
    try {
      const res = await fetch(`/api/client-portal/${token}`)
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'הפורטל לא זמין')
        return
      }

      setPortalData(data)
    } catch (err) {
      setError('שגיאה בטעינת הפורטל')
    } finally {
      setLoading(false)
    }
  }

  const handleApprovalAction = async (approvalId: string, status: ApprovalStatus, comment?: string) => {
    try {
      const res = await fetch(`/api/client-portal/${token}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approvalItemId: approvalId,
          status,
          comment,
          authorName: clientName || undefined,
        }),
      })

      if (res.ok) {
        // Update local state
        setPortalData(prev => prev ? {
          ...prev,
          approvals: prev.approvals.map(a =>
            a.id === approvalId ? { ...a, status } : a
          ),
        } : null)
        setSelectedApproval(null)
      }
    } catch (err) {
      console.error('Error updating approval:', err)
    }
  }

  const brandColor = portalData?.brandColor || '#7c3aed'

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-violet-600" />
      </div>
    )
  }

  if (error || !portalData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4" dir="rtl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 mx-auto bg-red-100 rounded-2xl flex items-center justify-center mb-4">
            <AlertCircle size={32} className="text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-neutral-900 mb-2">הפורטל לא זמין</h1>
          <p className="text-neutral-500">{error || 'הקישור אינו תקף או שהפורטל כובה'}</p>
        </motion.div>
      </div>
    )
  }

  const pendingApprovals = portalData.approvals.filter(a => a.status === 'pending')
  const deliveredCount = portalData.deliverables.reduce((sum, d) => sum + d.completedQuantity, 0)
  const totalDeliverables = portalData.deliverables.reduce((sum, d) => sum + d.quantity, 0)

  return (
    <div className="min-h-screen" dir="rtl">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-b from-neutral-50 via-white to-neutral-50/80 pointer-events-none" />

      <div className="relative max-w-2xl mx-auto">
        {/* HERO SECTION - Client Portal */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="relative overflow-hidden py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 mb-6"
        >
          {/* Dynamic gradient background based on brand color */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${brandColor} 0%, ${brandColor}dd 50%, ${brandColor}bb 100%)`,
            }}
          />

          {/* Abstract decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.2 }}
              className="absolute -top-32 -right-32 w-80 h-80 sm:w-[400px] sm:h-[400px] rounded-full bg-gradient-to-br from-white/15 via-white/5 to-transparent blur-3xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.4 }}
              className="absolute -bottom-24 -left-24 w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-gradient-to-tr from-white/10 via-white/5 to-transparent blur-2xl"
            />
            {/* Grid overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px]" />
          </div>

          <div className="relative z-10 text-center">
            {/* Brand Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-2xl sm:rounded-3xl bg-white/20 backdrop-blur-sm shadow-lg shadow-black/10 flex items-center justify-center mb-6"
            >
              <User size={36} className="text-white sm:w-12 sm:h-12" strokeWidth={1.5} />
            </motion.div>

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm mb-4"
            >
              <Sparkles size={14} className="text-white/70" />
              <span className="text-sm font-medium text-white/80">פורטל לקוח</span>
            </motion.div>

            {/* Brand Name - Large Typography */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.1] mb-2"
            >
              {portalData.brandName || portalData.companyName}
            </motion.h1>

            {/* Month */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-lg sm:text-xl text-white/70 mb-8 sm:mb-10"
            >
              {portalData.month}
            </motion.p>

            {/* Quick Stats Row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex items-center justify-center gap-6 sm:gap-12"
            >
              <div className="text-center">
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">{pendingApprovals.length}</p>
                <p className="text-xs sm:text-sm text-white/50 font-medium mt-1">ממתינים לאישור</p>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="text-center">
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">{deliveredCount}/{totalDeliverables}</p>
                <p className="text-xs sm:text-sm text-white/50 font-medium mt-1">תוצרים</p>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="text-center">
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">{portalData.upcomingEvents.length}</p>
                <p className="text-xs sm:text-sm text-white/50 font-medium mt-1">אירועים</p>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Content */}
        <div className="px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Client Name Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-4"
        >
          <label className="block text-sm font-medium text-neutral-700 mb-2 text-center">השם שלך (לתגובות)</label>
          <input
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="הזן את שמך..."
            className="w-full p-3 border border-neutral-200 rounded-xl text-center focus:ring-2 focus:ring-violet-500"
          />
        </motion.div>

        {/* Pending Approvals */}
        {pendingApprovals.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2 justify-center">
              <Check size={20} className="text-amber-500" />
              ממתינים לאישורך
            </h2>

            <div className="space-y-3">
              {pendingApprovals.map((approval, index) => (
                <ApprovalCard
                  key={approval.id}
                  approval={approval}
                  index={index}
                  brandColor={brandColor}
                  isSelected={selectedApproval === approval.id}
                  onSelect={() => setSelectedApproval(selectedApproval === approval.id ? null : approval.id)}
                  onApprove={(comment) => handleApprovalAction(approval.id, 'approved', comment)}
                  onRequestChanges={(comment) => handleApprovalAction(approval.id, 'changes_requested', comment)}
                  clientName={clientName}
                  token={token}
                />
              ))}
            </div>
          </motion.section>
        )}

        {/* All Approvals Status */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-lg font-bold text-neutral-900 mb-4 text-center">סטטוס אישורים</h2>

          <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
            {portalData.approvals.map((approval, index) => {
              const typeConfig = APPROVAL_TYPE_CONFIG[approval.type]
              const statusConfig = APPROVAL_STATUS_CONFIG[approval.status]

              return (
                <div
                  key={approval.id}
                  className={`p-4 flex items-center gap-3 ${index > 0 ? 'border-t border-neutral-100' : ''}`}
                >
                  <span className="text-xl">{typeConfig.icon}</span>
                  <div className="flex-1 text-center">
                    <p className="font-medium text-neutral-900">{approval.title}</p>
                    {approval.dueOn && (
                      <p className="text-xs text-neutral-500">עד {new Date(approval.dueOn).toLocaleDateString('he-IL')}</p>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
                    {statusConfig.label}
                  </span>
                </div>
              )
            })}
          </div>
        </motion.section>

        {/* Deliverables Progress */}
        {portalData.deliverables.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <h2 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2 justify-center">
              <Package size={20} style={{ color: brandColor }} />
              התקדמות תוצרים
            </h2>

            <div className="space-y-3">
              {portalData.deliverables.map(deliverable => {
                const progress = deliverable.quantity > 0
                  ? Math.round((deliverable.completedQuantity / deliverable.quantity) * 100)
                  : 0

                return (
                  <div
                    key={deliverable.title}
                    className="bg-white rounded-xl shadow-sm border border-neutral-100 p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-neutral-900">{deliverable.title}</span>
                      <span className="text-sm text-neutral-500">
                        {deliverable.completedQuantity}/{deliverable.quantity}
                      </span>
                    </div>
                    <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: progress === 100 ? '#10b981' : brandColor }}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.section>
        )}

        {/* Upcoming Events */}
        {portalData.upcomingEvents.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <h2 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2 justify-center">
              <Calendar size={20} style={{ color: brandColor }} />
              אירועים קרובים
            </h2>

            <div className="space-y-3">
              {portalData.upcomingEvents.map((event, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-sm border border-neutral-100 p-4 text-center"
                >
                  <p className="font-medium text-neutral-900">{event.title}</p>
                  <p className="text-sm text-neutral-500">
                    {new Date(event.date).toLocaleDateString('he-IL')}
                    {event.startTime && ` | ${event.startTime}`}
                  </p>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Footer */}
        <div className="py-6 text-center text-xs text-neutral-400">
          Powered by Creators OS
        </div>
        </div>
      </div>
    </div>
  )
}

// Approval Card with actions
function ApprovalCard({
  approval,
  index,
  brandColor,
  isSelected,
  onSelect,
  onApprove,
  onRequestChanges,
  clientName,
  token,
}: {
  approval: {
    id: string
    title: string
    type: string
    status: ApprovalStatus
    dueOn?: string
    commentsCount: number
  }
  index: number
  brandColor: string
  isSelected: boolean
  onSelect: () => void
  onApprove: (comment?: string) => void
  onRequestChanges: (comment?: string) => void
  clientName: string
  token: string
}) {
  const [comment, setComment] = useState('')
  const [comments, setComments] = useState<Array<{ authorName?: string; message: string; createdAt: string }>>([])
  const [loadingComments, setLoadingComments] = useState(false)
  const [sendingComment, setSendingComment] = useState(false)
  const typeConfig = APPROVAL_TYPE_CONFIG[approval.type as keyof typeof APPROVAL_TYPE_CONFIG]

  useEffect(() => {
    if (isSelected && comments.length === 0) {
      fetchComments()
    }
  }, [isSelected])

  const fetchComments = async () => {
    setLoadingComments(true)
    try {
      const res = await fetch(`/api/client-portal/${token}`)
      // Note: In a real implementation, we'd have a dedicated comments endpoint
      // For now, comments are fetched via the approval detail endpoint
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setLoadingComments(false)
    }
  }

  const handleSendComment = async () => {
    if (!comment.trim()) return

    setSendingComment(true)
    try {
      const res = await fetch(`/api/client-portal/${token}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approvalItemId: approval.id,
          message: comment.trim(),
          authorName: clientName || undefined,
        }),
      })

      if (res.ok) {
        setComments(prev => [...prev, {
          authorName: clientName || 'לקוח',
          message: comment.trim(),
          createdAt: new Date().toISOString(),
        }])
        setComment('')
      }
    } catch (error) {
      console.error('Error sending comment:', error)
    } finally {
      setSendingComment(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden"
    >
      <button
        onClick={onSelect}
        className="w-full p-4 flex items-center gap-3"
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
          style={{ backgroundColor: `${brandColor}15` }}
        >
          {typeConfig?.icon || '📄'}
        </div>
        <div className="flex-1 text-center">
          <p className="font-semibold text-neutral-900">{approval.title}</p>
          {approval.dueOn && (
            <p className="text-xs text-neutral-500">עד {new Date(approval.dueOn).toLocaleDateString('he-IL')}</p>
          )}
        </div>
        <ChevronDown
          size={20}
          className={`text-neutral-400 transition-transform ${isSelected ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-neutral-100"
          >
            <div className="p-4 space-y-4">
              {/* Comments */}
              {comments.length > 0 && (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {comments.map((c, i) => (
                    <div key={i} className="p-2 bg-neutral-50 rounded-lg text-sm">
                      <p className="text-xs text-neutral-500 mb-1">{c.authorName || 'לקוח'}</p>
                      <p className="text-neutral-700">{c.message}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Comment input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="הוסף תגובה..."
                  className="flex-1 p-2 border border-neutral-200 rounded-lg text-sm"
                />
                <button
                  onClick={handleSendComment}
                  disabled={!comment.trim() || sendingComment}
                  className="p-2 rounded-lg disabled:opacity-50"
                  style={{ backgroundColor: brandColor, color: 'white' }}
                >
                  {sendingComment ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => onApprove(comment || undefined)}
                  className="flex-1 py-3 bg-emerald-500 text-white font-medium rounded-xl flex items-center justify-center gap-2"
                >
                  <CheckCircle size={18} />
                  אישור
                </button>
                <button
                  onClick={() => onRequestChanges(comment || undefined)}
                  className="flex-1 py-3 bg-red-500 text-white font-medium rounded-xl flex items-center justify-center gap-2"
                >
                  <AlertCircle size={18} />
                  בקשת שינויים
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
