/**
 * Client Portal Types
 * Shareable, branded, read-only client-facing layer
 */

export interface ClientPortal {
  id: string
  creatorUserId: string
  companyId: string
  token: string
  isEnabled: boolean
  brandName?: string | null
  brandColor?: string | null
  createdAt: string
}

export interface CreatePortalPayload {
  companyId: string
  brandName?: string
  brandColor?: string
}

export interface PortalPublicPayload {
  companyName: string
  brandName?: string
  brandColor?: string
  deliverables: {
    title: string
    quantity: number
    completedQuantity: number
    status: 'planned' | 'in_progress' | 'delivered'
  }[]
  approvals: {
    id: string
    title: string
    type: ApprovalItemType
    status: ApprovalStatus
    dueOn?: string
    commentsCount: number
  }[]
  upcomingEvents: {
    title: string
    date: string
    startTime?: string
  }[]
  month: string
}

export function generatePortalToken(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let token = ''
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
}

// Approval Types
export type ApprovalItemType = 'post' | 'reel' | 'story' | 'tiktok' | 'other'
export type ApprovalStatus = 'draft' | 'pending' | 'approved' | 'changes_requested'

export interface ApprovalItem {
  id: string
  creatorUserId: string
  companyId: string
  relatedEventId?: string | null
  relatedTaskId?: string | null
  title: string
  type: ApprovalItemType
  status: ApprovalStatus
  dueOn?: string | null
  assetUrl?: string | null
  notes?: string | null
  createdAt: string
  updatedAt: string
  // Joined data
  companyName?: string
  commentsCount?: number
}

export interface CreateApprovalPayload {
  companyId: string
  title: string
  type: ApprovalItemType
  status?: ApprovalStatus
  dueOn?: string
  assetUrl?: string
  notes?: string
  relatedEventId?: string
  relatedTaskId?: string
}

export interface ApprovalComment {
  id: string
  approvalItemId: string
  authorType: 'creator' | 'client' | 'agency'
  authorName?: string | null
  message: string
  createdAt: string
}

export interface CreateCommentPayload {
  message: string
  authorType?: 'creator' | 'client' | 'agency'
  authorName?: string
}

// Deliverables Types
export type DeliverableStatus = 'planned' | 'in_progress' | 'delivered'

export interface Deliverable {
  id: string
  creatorUserId: string
  companyId: string
  month: string // 'YYYY-MM'
  title: string
  quantity: number
  completedQuantity: number
  status: DeliverableStatus
  linkedApprovalItemId?: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateDeliverablePayload {
  companyId: string
  month: string
  title: string
  quantity?: number
  status?: DeliverableStatus
  linkedApprovalItemId?: string
}

// UI Config
export const APPROVAL_TYPE_CONFIG: Record<ApprovalItemType, { label: string; icon: string; color: string }> = {
  post: { label: 'פוסט', icon: '📱', color: 'blue' },
  reel: { label: 'ריל', icon: '🎬', color: 'violet' },
  story: { label: 'סטורי', icon: '📸', color: 'pink' },
  tiktok: { label: 'טיקטוק', icon: '🎵', color: 'neutral' },
  other: { label: 'אחר', icon: '📄', color: 'gray' },
}

export const APPROVAL_STATUS_CONFIG: Record<ApprovalStatus, { label: string; color: string; bgColor: string }> = {
  draft: { label: 'טיוטה', color: 'text-neutral-600', bgColor: 'bg-neutral-100' },
  pending: { label: 'ממתין לאישור', color: 'text-amber-600', bgColor: 'bg-amber-50' },
  approved: { label: 'אושר', color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
  changes_requested: { label: 'נדרשים שינויים', color: 'text-red-600', bgColor: 'bg-red-50' },
}

export const DELIVERABLE_STATUS_CONFIG: Record<DeliverableStatus, { label: string; color: string; bgColor: string }> = {
  planned: { label: 'מתוכנן', color: 'text-neutral-600', bgColor: 'bg-neutral-100' },
  in_progress: { label: 'בעבודה', color: 'text-blue-600', bgColor: 'bg-blue-50' },
  delivered: { label: 'נמסר', color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
}
