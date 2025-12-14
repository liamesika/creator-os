/**
 * Company Timeline Types
 * Visual client lifecycle tracking
 */

export type TimelineItemType = 'contract' | 'milestone' | 'deliverable' | 'note' | 'payment' | 'content'

export interface TimelineItem {
  id: string
  creatorUserId: string
  companyId: string
  type: TimelineItemType
  title: string
  details?: string
  eventId?: string
  taskId?: string
  amount?: number
  occurredOn: Date
  createdAt: Date
}

export interface CreateTimelineItemPayload {
  companyId: string
  type: TimelineItemType
  title: string
  details?: string
  eventId?: string
  taskId?: string
  amount?: number
  occurredOn: string // YYYY-MM-DD
}

export interface TimelineItemTypeConfig {
  id: TimelineItemType
  label: string
  icon: string
  color: string
  bgColor: string
}

export const TIMELINE_ITEM_TYPES: Record<TimelineItemType, TimelineItemTypeConfig> = {
  contract: {
    id: 'contract',
    label: 'חוזה',
    icon: '📄',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
  },
  milestone: {
    id: 'milestone',
    label: 'אבן דרך',
    icon: '🎯',
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
  },
  deliverable: {
    id: 'deliverable',
    label: 'תוצר',
    icon: '📦',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
  },
  note: {
    id: 'note',
    label: 'הערה',
    icon: '📝',
    color: 'text-neutral-600',
    bgColor: 'bg-neutral-100',
  },
  payment: {
    id: 'payment',
    label: 'תשלום',
    icon: '💰',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
  },
  content: {
    id: 'content',
    label: 'תוכן',
    icon: '🎬',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
  },
}

export function getTimelineTypeConfig(type: TimelineItemType): TimelineItemTypeConfig {
  return TIMELINE_ITEM_TYPES[type]
}

export function formatTimelineDate(date: Date): string {
  return date.toLocaleDateString('he-IL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
