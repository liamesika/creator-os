import { LucideIcon } from 'lucide-react'
import {
  Instagram,
  Camera,
  Video,
  Film,
  FileText,
  Megaphone,
  Users,
  Coffee,
  Sparkles,
} from 'lucide-react'

export type EventCategory =
  | 'story-upload'
  | 'story-shoot'
  | 'photo-day'
  | 'vlog-shoot'
  | 'video-edit'
  | 'post-upload'
  | 'campaign'
  | 'meeting'
  | 'personal'

export interface CategoryPreset {
  id: EventCategory
  label: string
  icon: LucideIcon
  color: string
  bgColor: string
  borderColor: string
  defaultDuration: number // in minutes
  reminderPresets: number[] // minutes before
  suggestedTasks: string[]
}

export const CATEGORY_PRESETS: Record<EventCategory, CategoryPreset> = {
  'story-upload': {
    id: 'story-upload',
    label: 'העלאת סטורי',
    icon: Instagram,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    defaultDuration: 15,
    reminderPresets: [15, 60],
    suggestedTasks: ['טקסט לסטורי', 'בדיקה לפני העלאה'],
  },
  'story-shoot': {
    id: 'story-shoot',
    label: 'צילום סטורי',
    icon: Camera,
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    defaultDuration: 30,
    reminderPresets: [30, 120],
    suggestedTasks: ['הכנת לוקיישן', 'בדיקת תאורה'],
  },
  'photo-day': {
    id: 'photo-day',
    label: 'יום צילום',
    icon: Camera,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    defaultDuration: 480, // 8 hours
    reminderPresets: [1440, 120], // day before, 2 hours before
    suggestedTasks: [
      'בדיקת ציוד יום לפני',
      'תזכורת יציאה שעתיים לפני',
      'בחירת חומרים לעריכה אחרי הצילום',
    ],
  },
  'vlog-shoot': {
    id: 'vlog-shoot',
    label: 'צילום ולוג',
    icon: Video,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    defaultDuration: 120,
    reminderPresets: [60, 1440],
    suggestedTasks: ['הכנת סקריפט', 'בדיקת מיקרופון', 'גיבוי קבצים'],
  },
  'video-edit': {
    id: 'video-edit',
    label: 'עריכת וידאו',
    icon: Film,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    defaultDuration: 180,
    reminderPresets: [30],
    suggestedTasks: ['ארגון קבצי גלם', 'בחירת מוזיקה', 'יצוא סופי'],
  },
  'post-upload': {
    id: 'post-upload',
    label: 'העלאת פוסט',
    icon: FileText,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    defaultDuration: 30,
    reminderPresets: [15, 60],
    suggestedTasks: ['כתיבת קפשן', 'בחירת האשטגים', 'תזמון פרסום'],
  },
  campaign: {
    id: 'campaign',
    label: 'עבודה על קמפיין',
    icon: Megaphone,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    defaultDuration: 120,
    reminderPresets: [60, 1440],
    suggestedTasks: ['קריאת בריף', 'הכנת טיוטות', 'שליחה לאישור'],
  },
  meeting: {
    id: 'meeting',
    label: 'פגישה / שיחת לקוח',
    icon: Users,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    defaultDuration: 60,
    reminderPresets: [15, 60],
    suggestedTasks: ['הכנת נקודות לשיחה', 'סיכום פגישה'],
  },
  personal: {
    id: 'personal',
    label: 'זמן אישי / חופש',
    icon: Coffee,
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    defaultDuration: 60,
    reminderPresets: [],
    suggestedTasks: [],
  },
}

export interface CalendarReminder {
  id: string
  minutesBefore: number
  isCustom: boolean
}

export interface LinkedTask {
  id: string
  title: string
  completed: boolean
  createdAt: Date
}

export interface CalendarEvent {
  id: string
  category: EventCategory
  title: string
  date: Date
  startTime: string // HH:mm format
  endTime: string // HH:mm format
  isAllDay: boolean
  reminders: CalendarReminder[]
  linkedTasks: LinkedTask[]
  notes?: string
  companyId?: string | null
  companyNameSnapshot?: string // Preserves company name if renamed/archived
  createdAt: Date
  updatedAt: Date
}

export type CalendarView = 'month' | 'week' | 'day'

export interface CalendarState {
  events: CalendarEvent[]
  selectedDate: Date
  currentView: CalendarView
  selectedEvent: CalendarEvent | null
}

// Helper functions
export const formatReminderLabel = (minutes: number): string => {
  if (minutes < 60) return `${minutes} דקות לפני`
  if (minutes === 60) return 'שעה לפני'
  if (minutes < 1440) return `${minutes / 60} שעות לפני`
  if (minutes === 1440) return 'יום לפני'
  return `${minutes / 1440} ימים לפני`
}

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15)
}

export const createDefaultReminders = (preset: CategoryPreset): CalendarReminder[] => {
  return preset.reminderPresets.map((minutes) => ({
    id: generateId(),
    minutesBefore: minutes,
    isCustom: false,
  }))
}

export const createLinkedTasks = (preset: CategoryPreset): LinkedTask[] => {
  return preset.suggestedTasks.map((title) => ({
    id: generateId(),
    title,
    completed: false,
    createdAt: new Date(),
  }))
}

export const getTimeFromDate = (date: Date): string => {
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

export const addMinutesToTime = (time: string, minutes: number): string => {
  const [hours, mins] = time.split(':').map(Number)
  const totalMinutes = hours * 60 + mins + minutes
  const newHours = Math.floor(totalMinutes / 60) % 24
  const newMins = totalMinutes % 60
  return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`
}
