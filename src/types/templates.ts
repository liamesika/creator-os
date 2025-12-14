/**
 * Templates System Types
 * Premium time-saver feature types
 */

export type TemplateCategory = 'weekly_shoot' | 'product_launch' | 'monthly_campaign' | 'custom'
export type TemplateOwnerType = 'creator' | 'agency'
export type TemplateItemType = 'event' | 'task' | 'goal'

export interface Template {
  id: string
  ownerUserId: string
  ownerType: TemplateOwnerType
  title: string
  description?: string
  category: TemplateCategory
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
  items?: TemplateItem[]
}

export interface TemplateItem {
  id: string
  templateId: string
  itemType: TemplateItemType
  title: string
  notes?: string
  dayOffset: number
  timeOfDay?: string // HH:MM:SS format
  durationMinutes?: number
  eventCategory?: string
  priority?: 'LOW' | 'MEDIUM' | 'HIGH'
  sortOrder: number
  createdAt: Date
}

export interface TemplateApplication {
  id: string
  templateId: string
  appliedByUserId: string
  targetCreatorUserId: string
  startDate: Date
  createdEventIds: string[]
  createdTaskIds: string[]
  createdGoalIds: string[]
  createdAt: Date
}

// API payloads
export interface CreateTemplatePayload {
  title: string
  description?: string
  category: TemplateCategory
  isPublic?: boolean
  items?: CreateTemplateItemPayload[]
}

export interface CreateTemplateItemPayload {
  itemType: TemplateItemType
  title: string
  notes?: string
  dayOffset: number
  timeOfDay?: string
  durationMinutes?: number
  eventCategory?: string
  priority?: 'LOW' | 'MEDIUM' | 'HIGH'
  sortOrder?: number
}

export interface ApplyTemplatePayload {
  templateId: string
  targetCreatorUserId: string
  startDate: string // YYYY-MM-DD
}

export interface ApplyTemplateResult {
  success: boolean
  applicationId: string
  summary: {
    eventsCreated: number
    tasksCreated: number
    goalsCreated: number
  }
  createdEventIds: string[]
  createdTaskIds: string[]
  createdGoalIds: string[]
}

// Category configurations
export interface CategoryConfig {
  id: TemplateCategory
  label: string
  description: string
  icon: string
  color: string
  bgColor: string
}

export const TEMPLATE_CATEGORIES: Record<TemplateCategory, CategoryConfig> = {
  weekly_shoot: {
    id: 'weekly_shoot',
    label: 'צילום שבועי',
    description: 'תבנית לצילומים שבועיים קבועים',
    icon: '📸',
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
  },
  product_launch: {
    id: 'product_launch',
    label: 'השקת מוצר',
    description: 'תבנית להשקות מוצרים וקמפיינים',
    icon: '🚀',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
  },
  monthly_campaign: {
    id: 'monthly_campaign',
    label: 'קמפיין חודשי',
    description: 'תבנית לקמפיינים חודשיים',
    icon: '📅',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
  },
  custom: {
    id: 'custom',
    label: 'מותאם אישית',
    description: 'תבנית מותאמת אישית',
    icon: '✨',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
  },
}

// Helper functions
export function getCategoryConfig(category: TemplateCategory): CategoryConfig {
  return TEMPLATE_CATEGORIES[category]
}

export function formatDayOffset(offset: number): string {
  if (offset === 0) return 'יום ההתחלה'
  if (offset === 1) return 'יום אחד אחרי'
  if (offset === -1) return 'יום אחד לפני'
  if (offset > 0) return `${offset} ימים אחרי`
  return `${Math.abs(offset)} ימים לפני`
}

export function getItemTypeLabel(type: TemplateItemType): string {
  switch (type) {
    case 'event':
      return 'אירוע'
    case 'task':
      return 'משימה'
    case 'goal':
      return 'יעד'
  }
}

export function getItemTypeIcon(type: TemplateItemType): string {
  switch (type) {
    case 'event':
      return '📅'
    case 'task':
      return '✓'
    case 'goal':
      return '🎯'
  }
}
