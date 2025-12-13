import type { EventCategory } from './calendar'

export type TemplateScope = 'DAY' | 'WEEK'

export interface TemplateItem {
  category: EventCategory
  title: string
  startTime: string // HH:mm format
  durationMinutes: number
  reminders: number[] // minutes before
  linkedTasks: string[] // task titles
}

export interface CalendarTemplate {
  id: string
  name: string
  scope: TemplateScope
  description: string
  icon: string
  items: TemplateItem[]
  isGlobal: boolean
}

export const CALENDAR_TEMPLATES: CalendarTemplate[] = [
  {
    id: 'shoot-day',
    name: 'יום צילום',
    scope: 'DAY',
    description: 'יום עבודה מלא עם לקוח: צילום, עריכה והעלאה',
    icon: '📸',
    isGlobal: true,
    items: [
      {
        category: 'story-shoot',
        title: 'צילום סטורי',
        startTime: '09:00',
        durationMinutes: 90,
        reminders: [30, 60],
        linkedTasks: ['הכנת ציוד', 'בדיקת תאורה'],
      },
      {
        category: 'vlog-shoot',
        title: 'צילום רילס',
        startTime: '11:00',
        durationMinutes: 120,
        reminders: [30],
        linkedTasks: ['הכנת סקריפט', 'בחירת מיקום'],
      },
      {
        category: 'video-edit',
        title: 'עריכה',
        startTime: '14:00',
        durationMinutes: 120,
        reminders: [15],
        linkedTasks: ['עריכת סטורי', 'עריכת רילס', 'הוספת כתוביות'],
      },
      {
        category: 'post-upload',
        title: 'העלאה ופרסום',
        startTime: '17:00',
        durationMinutes: 60,
        reminders: [30],
        linkedTasks: ['כתיבת קפשן', 'בחירת האשטאגים', 'תזמון פרסום'],
      },
    ],
  },
  {
    id: 'regular-workday',
    name: 'יום עבודה רגיל',
    scope: 'DAY',
    description: 'יום עבודה שגרתי: פגישות, תוכן ומשימות',
    icon: '💼',
    isGlobal: true,
    items: [
      {
        category: 'meeting',
        title: 'פגישת תיאום עם לקוח',
        startTime: '10:00',
        durationMinutes: 60,
        reminders: [30, 60],
        linkedTasks: ['הכנת סיכום', 'עדכון הצעת מחיר'],
      },
      {
        category: 'photo-day',
        title: 'יצירת תוכן',
        startTime: '12:00',
        durationMinutes: 90,
        reminders: [15],
        linkedTasks: ['כתיבת פוסט', 'עיצוב גרפי', 'הכנת קרוסלה'],
      },
      {
        category: 'personal',
        title: 'תכנון שבוע הבא',
        startTime: '15:00',
        durationMinutes: 60,
        reminders: [30],
        linkedTasks: ['סקירת משימות', 'תיאום פגישות', 'הכנת לו״ז תוכן'],
      },
      {
        category: 'personal',
        title: 'עבודה אדמיניסטרטיבית',
        startTime: '16:30',
        durationMinutes: 60,
        reminders: [],
        linkedTasks: ['חשבוניות', 'מיילים', 'עדכון מסמכים'],
      },
    ],
  },
  {
    id: 'content-day',
    name: 'יום תוכן',
    scope: 'DAY',
    description: 'יום ייצור תוכן אינטנסיבי',
    icon: '✨',
    isGlobal: true,
    items: [
      {
        category: 'story-shoot',
        title: 'סטורי בוקר',
        startTime: '08:00',
        durationMinutes: 45,
        reminders: [15],
        linkedTasks: ['צילום', 'עריכה', 'פרסום'],
      },
      {
        category: 'vlog-shoot',
        title: 'רילס 1',
        startTime: '09:30',
        durationMinutes: 90,
        reminders: [30],
        linkedTasks: ['הכנת סקריפט', 'צילום', 'עריכה'],
      },
      {
        category: 'vlog-shoot',
        title: 'רילס 2',
        startTime: '11:30',
        durationMinutes: 90,
        reminders: [30],
        linkedTasks: ['הכנת סקריפט', 'צילום', 'עריכה'],
      },
      {
        category: 'photo-day',
        title: 'פוסט פיד',
        startTime: '13:30',
        durationMinutes: 60,
        reminders: [15],
        linkedTasks: ['עיצוב', 'כתיבת קפשן', 'פרסום'],
      },
      {
        category: 'story-upload',
        title: 'סטורי ערב',
        startTime: '19:00',
        durationMinutes: 45,
        reminders: [30],
        linkedTasks: ['צילום', 'עריכה', 'פרסום'],
      },
    ],
  },
  {
    id: 'full-work-week',
    name: 'שבוע עבודה מלא',
    scope: 'WEEK',
    description: 'תכנון שבוע שלם עם כל סוגי העבודה',
    icon: '📅',
    isGlobal: true,
    items: [
      // Monday
      {
        category: 'personal',
        title: 'תכנון שבוע - יום ראשון',
        startTime: '09:00',
        durationMinutes: 60,
        reminders: [30],
        linkedTasks: ['סקירת מטרות', 'תיעדוף משימות'],
      },
      {
        category: 'meeting',
        title: 'פגישת לקוח - יום ראשון',
        startTime: '11:00',
        durationMinutes: 60,
        reminders: [60, 30],
        linkedTasks: ['הכנת מצגת', 'סיכום פגישה'],
      },
      // Tuesday
      {
        category: 'story-shoot',
        title: 'צילום תוכן - יום שני',
        startTime: '10:00',
        durationMinutes: 120,
        reminders: [60, 30],
        linkedTasks: ['הכנת ציוד', 'צילום', 'עריכה'],
      },
      {
        category: 'video-edit',
        title: 'עריכה ופרסום - יום שני',
        startTime: '14:00',
        durationMinutes: 90,
        reminders: [15],
        linkedTasks: ['עריכה', 'כתיבת קפשן', 'פרסום'],
      },
      // Wednesday
      {
        category: 'vlog-shoot',
        title: 'רילס - יום רביעי',
        startTime: '10:00',
        durationMinutes: 150,
        reminders: [60, 30],
        linkedTasks: ['סקריפט', 'צילום', 'עריכה', 'פרסום'],
      },
      // Thursday
      {
        category: 'meeting',
        title: 'מפגש סטטוס - יום חמישי',
        startTime: '10:00',
        durationMinutes: 45,
        reminders: [30],
        linkedTasks: ['הכנת דו״ח', 'סיכום'],
      },
      {
        category: 'photo-day',
        title: 'תוכן שבועי - יום חמישי',
        startTime: '12:00',
        durationMinutes: 120,
        reminders: [30],
        linkedTasks: ['יצירה', 'עריכה', 'פרסום'],
      },
      // Friday
      {
        category: 'personal',
        title: 'סגירת שבוע - יום שישי',
        startTime: '09:00',
        durationMinutes: 90,
        reminders: [30],
        linkedTasks: ['חשבוניות', 'דיווחים', 'סיכום שבוע'],
      },
    ],
  },
]
