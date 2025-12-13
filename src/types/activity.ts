export type ActivityType =
  | 'company_created'
  | 'company_updated'
  | 'company_archived'
  | 'company_restored'
  | 'event_created'
  | 'event_updated'
  | 'event_deleted'
  | 'task_created'
  | 'task_status_changed'
  | 'task_archived'
  | 'goal_set'
  | 'goal_item_updated'
  | 'goal_reflection_saved'
  | 'ai_generated'
  | 'upgrade_clicked'
  | 'plan_changed'
  | 'template_applied'
  | 'weekly_review_saved'

export interface ActivityEvent {
  id: string
  userId: string
  type: ActivityType
  entityId?: string
  entityName?: string
  metadata?: Record<string, any>
  createdAt: Date
}

export interface ActivityConfig {
  icon: string
  getTitle: (event: ActivityEvent) => string
  getDescription: (event: ActivityEvent) => string
  getLink?: (event: ActivityEvent) => string | undefined
}

export const ACTIVITY_CONFIGS: Record<ActivityType, ActivityConfig> = {
  company_created: {
    icon: '🏢',
    getTitle: () => 'חברה חדשה נוספה',
    getDescription: (e) => e.entityName || 'חברה חדשה',
    getLink: (e) => e.entityId ? `/companies?id=${e.entityId}` : undefined,
  },
  company_updated: {
    icon: '✏️',
    getTitle: () => 'חברה עודכנה',
    getDescription: (e) => e.entityName || 'עדכון חברה',
    getLink: (e) => e.entityId ? `/companies?id=${e.entityId}` : undefined,
  },
  company_archived: {
    icon: '📦',
    getTitle: () => 'חברה הועברה לארכיון',
    getDescription: (e) => e.entityName || 'חברה בארכיון',
  },
  company_restored: {
    icon: '↩️',
    getTitle: () => 'חברה שוחזרה',
    getDescription: (e) => e.entityName || 'שחזור חברה',
    getLink: (e) => e.entityId ? `/companies?id=${e.entityId}` : undefined,
  },
  event_created: {
    icon: '📅',
    getTitle: () => 'אירוע חדש נוצר',
    getDescription: (e) => e.entityName || 'אירוע חדש',
    getLink: () => '/calendar',
  },
  event_updated: {
    icon: '🔄',
    getTitle: () => 'אירוע עודכן',
    getDescription: (e) => e.entityName || 'עדכון אירוע',
    getLink: () => '/calendar',
  },
  event_deleted: {
    icon: '🗑️',
    getTitle: () => 'אירוע נמחק',
    getDescription: (e) => e.entityName || 'מחיקת אירוע',
  },
  task_created: {
    icon: '✅',
    getTitle: () => 'משימה חדשה נוצרה',
    getDescription: (e) => e.entityName || 'משימה חדשה',
    getLink: () => '/tasks',
  },
  task_status_changed: {
    icon: '🔁',
    getTitle: () => 'סטטוס משימה השתנה',
    getDescription: (e) => {
      const status = e.metadata?.newStatus
      const statusText = status === 'DONE' ? 'בוצעה' : status === 'DOING' ? 'בביצוע' : 'ממתינה'
      return `${e.entityName || 'משימה'} - ${statusText}`
    },
    getLink: () => '/tasks',
  },
  task_archived: {
    icon: '📦',
    getTitle: () => 'משימה הועברה לארכיון',
    getDescription: (e) => e.entityName || 'משימה בארכיון',
  },
  goal_set: {
    icon: '🎯',
    getTitle: () => 'מטרות הוגדרו',
    getDescription: (e) => {
      const count = e.metadata?.count || 1
      return `${count} מטרות ליום`
    },
    getLink: () => '/goals',
  },
  goal_item_updated: {
    icon: '✨',
    getTitle: () => 'מטרה עודכנה',
    getDescription: (e) => {
      const status = e.metadata?.status
      const statusText = status === 'DONE' ? 'הושלמה' : status === 'PARTIAL' ? 'בביצוע' : 'ממתינה'
      return `${e.entityName || 'מטרה'} - ${statusText}`
    },
    getLink: () => '/goals',
  },
  goal_reflection_saved: {
    icon: '💭',
    getTitle: () => 'רפלקציה נשמרה',
    getDescription: () => 'סיכום יום נשמר',
    getLink: () => '/goals',
  },
  ai_generated: {
    icon: '✨',
    getTitle: () => 'תוכן AI נוצר',
    getDescription: (e) => e.metadata?.template || 'תוכן חדש',
    getLink: () => '/ai-content',
  },
  upgrade_clicked: {
    icon: '👑',
    getTitle: () => 'לחיצה על שדרוג',
    getDescription: () => 'עניין בפרימיום',
  },
  plan_changed: {
    icon: '🎉',
    getTitle: () => 'תוכנית שונתה',
    getDescription: (e) => e.metadata?.plan === 'premium' ? 'שודרג לפרימיום!' : 'שונה לחינמי',
  },
  template_applied: {
    icon: '📋',
    getTitle: () => 'תבנית יומן הופעלה',
    getDescription: (e) => e.entityName || 'תבנית',
    getLink: () => '/calendar',
  },
  weekly_review_saved: {
    icon: '📊',
    getTitle: () => 'סיכום שבועי נשמר',
    getDescription: (e) => e.entityName || 'סיכום שבוע',
    getLink: () => '/weekly-review',
  },
}
