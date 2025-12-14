'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Check,
  Clock,
  MessageSquare,
  Filter,
  ChevronDown,
  Users,
  Loader2,
  ChevronLeft,
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useAgencyDemoStore } from '@/stores/agencyDemoStore'
import { getAgencyDemoApprovals, AGENCY_DEMO_CREATORS } from '@/lib/agency-demo-data'
import { showDemoActionToast } from '@/components/app/AgencyDemoBanner'
import PremiumCard from '@/components/app/PremiumCard'
import PremiumEmptyState from '@/components/app/PremiumEmptyState'
import BottomSheet from '@/components/ui/BottomSheet'
import type {
  ApprovalItem,
  ApprovalComment,
  ApprovalStatus,
} from '@/types/client-portal'
import {
  APPROVAL_TYPE_CONFIG,
  APPROVAL_STATUS_CONFIG,
} from '@/types/client-portal'

interface CreatorWithApprovals {
  id: string
  name: string
  avatarUrl?: string
  approvals: ApprovalItem[]
}

type FilterStatus = ApprovalStatus | 'all'

const STATUS_FILTERS: { value: FilterStatus; label: string }[] = [
  { value: 'all', label: 'הכל' },
  { value: 'pending', label: 'ממתינים' },
  { value: 'changes_requested', label: 'נדרשים שינויים' },
  { value: 'approved', label: 'אושרו' },
]

export default function AgencyApprovalsPage() {
  const { isAgencyDemo } = useAgencyDemoStore()
  const [creators, setCreators] = useState<CreatorWithApprovals[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all')
  const [selectedCreator, setSelectedCreator] = useState<string>('all')
  const [selectedItem, setSelectedItem] = useState<ApprovalItem | null>(null)

  useEffect(() => {
    fetchAgencyApprovals()
  }, [isAgencyDemo])

  const fetchAgencyApprovals = async () => {
    // In demo mode, use demo data
    if (isAgencyDemo) {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 400))

      const demoApprovals = getAgencyDemoApprovals()

      // Group approvals by creator
      const creatorsMap = new Map<string, CreatorWithApprovals>()
      AGENCY_DEMO_CREATORS.forEach(creator => {
        creatorsMap.set(creator.creatorUserId, {
          id: creator.creatorUserId,
          name: creator.creatorName,
          approvals: [],
        })
      })

      demoApprovals.forEach(approval => {
        const creator = creatorsMap.get(approval.creatorId)
        if (creator) {
          creator.approvals.push({
            id: approval.id,
            creatorUserId: approval.creatorId,
            companyId: 'demo-company',
            title: approval.title,
            type: approval.type,
            status: approval.status as ApprovalStatus,
            companyName: approval.companyName,
            createdAt: approval.createdAt.toISOString(),
            updatedAt: approval.createdAt.toISOString(),
            dueOn: approval.dueDate?.toISOString(),
            notes: approval.feedback,
            commentsCount: Math.floor(Math.random() * 5),
          })
        }
      })

      setCreators(Array.from(creatorsMap.values()).filter(c => c.approvals.length > 0))
      setLoading(false)
      return
    }

    try {
      // First get all agency members
      const membersRes = await fetch('/api/agency/members')
      const membersData = await membersRes.json()

      if (!membersData.members) {
        setLoading(false)
        return
      }

      // Fetch approvals for each creator
      const creatorsWithApprovals: CreatorWithApprovals[] = await Promise.all(
        membersData.members.map(async (member: { id: string; name: string; avatarUrl?: string }) => {
          const approvalsRes = await fetch(`/api/approvals?creatorId=${member.id}`)
          const approvalsData = await approvalsRes.json()
          return {
            id: member.id,
            name: member.name,
            avatarUrl: member.avatarUrl,
            approvals: approvalsData.approvals || [],
          }
        })
      )

      setCreators(creatorsWithApprovals)
    } catch (error) {
      console.error('Error fetching agency approvals:', error)
      toast.error('שגיאה בטעינת נתונים')
    } finally {
      setLoading(false)
    }
  }

  const filteredData = useMemo(() => {
    let result = creators

    if (selectedCreator !== 'all') {
      result = result.filter(c => c.id === selectedCreator)
    }

    return result.map(creator => ({
      ...creator,
      approvals: creator.approvals.filter(a =>
        statusFilter === 'all' || a.status === statusFilter
      ),
    })).filter(c => c.approvals.length > 0)
  }, [creators, statusFilter, selectedCreator])

  // Count stats
  const stats = useMemo(() => {
    const allApprovals = creators.flatMap(c => c.approvals)
    return {
      total: allApprovals.length,
      pending: allApprovals.filter(a => a.status === 'pending').length,
      changesRequested: allApprovals.filter(a => a.status === 'changes_requested').length,
      approved: allApprovals.filter(a => a.status === 'approved').length,
    }
  }, [creators])

  const handleStatusChange = async (itemId: string, creatorId: string, newStatus: ApprovalStatus) => {
    // Block in demo mode
    if (isAgencyDemo) {
      showDemoActionToast('עדכון סטטוס אישור')
      return
    }

    try {
      const res = await fetch(`/api/approvals/${itemId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        setCreators(prev => prev.map(creator => {
          if (creator.id !== creatorId) return creator
          return {
            ...creator,
            approvals: creator.approvals.map(item =>
              item.id === itemId ? { ...item, status: newStatus } : item
            ),
          }
        }))
        if (selectedItem?.id === itemId) {
          setSelectedItem(prev => prev ? { ...prev, status: newStatus } : null)
        }
        toast.success('הסטטוס עודכן')
      }
    } catch (error) {
      toast.error('שגיאה בעדכון סטטוס')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50/50 via-white to-indigo-50/50" dir="rtl">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-neutral-200/50 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/agency" className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
              <ChevronLeft size={20} className="text-neutral-500" />
            </Link>
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25">
              <Check size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-neutral-900">אישורים - סוכנות</h1>
              <p className="text-xs text-neutral-500">מעקב אישורי תוכן של כל היוצרים</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            <div className="bg-neutral-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-neutral-900">{stats.total}</p>
              <p className="text-xs text-neutral-500">סה״כ</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
              <p className="text-xs text-amber-600">ממתינים</p>
            </div>
            <div className="bg-red-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-red-600">{stats.changesRequested}</p>
              <p className="text-xs text-red-600">שינויים</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-emerald-600">{stats.approved}</p>
              <p className="text-xs text-emerald-600">אושרו</p>
            </div>
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
              <div key={i} className="h-32 bg-neutral-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredData.length === 0 ? (
          <PremiumEmptyState
            icon={Check}
            title="אין פריטי אישור"
            description="לא נמצאו פריטי אישור לפי הסינון"
            color="violet"
          />
        ) : (
          <div className="space-y-6">
            {filteredData.map(creator => (
              <div key={creator.id}>
                {/* Creator header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-violet-400 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {creator.name.charAt(0)}
                  </div>
                  <h2 className="font-semibold text-neutral-800">{creator.name}</h2>
                  <span className="text-xs text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">
                    {creator.approvals.length} פריטים
                  </span>
                </div>

                {/* Creator's approvals */}
                <div className="space-y-3 pr-4 border-r-2 border-violet-100">
                  {creator.approvals.map((item, index) => (
                    <AgencyApprovalCard
                      key={item.id}
                      item={item}
                      index={index}
                      onClick={() => setSelectedItem(item)}
                      onStatusChange={(status) => handleStatusChange(item.id, creator.id, status)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Item Detail Sheet */}
      <BottomSheet
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title={selectedItem?.title || ''}
      >
        {selectedItem && (
          <AgencyApprovalDetailView
            item={selectedItem}
            onStatusChange={(status) => {
              const creator = creators.find(c => c.approvals.some(a => a.id === selectedItem.id))
              if (creator) {
                handleStatusChange(selectedItem.id, creator.id, status)
              }
            }}
          />
        )}
      </BottomSheet>
    </div>
  )
}

// Approval Card Component for Agency view
function AgencyApprovalCard({
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
  const typeConfig = APPROVAL_TYPE_CONFIG[item.type] || APPROVAL_TYPE_CONFIG.other
  const statusConfig = APPROVAL_STATUS_CONFIG[item.status] || APPROVAL_STATUS_CONFIG.pending

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
    >
      <PremiumCard interactive onClick={onClick}>
        <div className="p-4">
          <div className="flex items-center gap-3">
            {/* Type icon */}
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${
              typeConfig.color === 'blue' ? 'bg-blue-100' :
              typeConfig.color === 'violet' ? 'bg-violet-100' :
              typeConfig.color === 'pink' ? 'bg-pink-100' :
              typeConfig.color === 'neutral' || typeConfig.color === 'gray' ? 'bg-neutral-200' :
              'bg-neutral-100'
            }`}>
              {typeConfig.icon}
            </div>

            <div className="flex-1 min-w-0 text-center">
              {/* Status */}
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
                {statusConfig.label}
              </span>

              {/* Title */}
              <h3 className="font-semibold text-neutral-900 text-sm truncate">{item.title}</h3>

              {/* Company */}
              {item.companyName && (
                <p className="text-xs text-neutral-500">{item.companyName}</p>
              )}
            </div>

            {/* Meta */}
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              {item.commentsCount && item.commentsCount > 0 && (
                <span className="flex items-center gap-1">
                  <MessageSquare size={12} />
                  {item.commentsCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </PremiumCard>
    </motion.div>
  )
}

// Detail View for Agency
function AgencyApprovalDetailView({
  item,
  onStatusChange,
}: {
  item: ApprovalItem
  onStatusChange: (status: ApprovalStatus) => void
}) {
  const [comments, setComments] = useState<ApprovalComment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loadingComments, setLoadingComments] = useState(true)
  const [sendingComment, setSendingComment] = useState(false)

  const typeConfig = APPROVAL_TYPE_CONFIG[item.type] || APPROVAL_TYPE_CONFIG.other
  const statusConfig = APPROVAL_STATUS_CONFIG[item.status] || APPROVAL_STATUS_CONFIG.pending

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
          typeConfig.color === 'neutral' || typeConfig.color === 'gray' ? 'bg-neutral-200' :
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
                    : comment.authorType === 'agency'
                    ? 'bg-violet-50 ml-auto mr-0 max-w-[85%]'
                    : 'bg-neutral-100 ml-auto mr-0 max-w-[85%]'
                }`}
              >
                <p className="font-medium text-xs text-neutral-500 mb-1">
                  {comment.authorName || (
                    comment.authorType === 'client' ? 'לקוח' :
                    comment.authorType === 'agency' ? 'סוכנות' : 'יוצר'
                  )}
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
            {sendingComment ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
          </button>
        </div>
      </div>
    </div>
  )
}
