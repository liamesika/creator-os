import type { Company } from '@/types/company'
import type { CalendarEvent } from '@/types/calendar'
import type { Task } from '@/types/task'
import type { DailyGoal } from '@/types/goal'
import type { AIGeneratedContent } from '@/types/ai-content'
import type { ActivityEvent } from '@/types/activity'
import { addDays, format } from 'date-fns'

const DEMO_USER_ID = 'demo-user'

export function getDemoCompanies(): Omit<Company, 'createdAt' | 'updatedAt'>[] {
  return [
    {
      id: 'demo-company-1',
      name: 'Fashion Nova Israel',
      brandType: 'brand',
      status: 'ACTIVE',
      contactName: 'רונית כהן',
      contactEmail: 'ronit@fashionnova.co.il',
      contactPhone: '052-1234567',
      notes: 'מותג אופנה מוביל, קמפיינים חודשיים. חוזה שנתי, תשלום ₪12,000 לחודש',
      contract: {
        contractType: 'TEXT',
        contractText: 'חוזה שנתי מינואר 2024 עד דצמבר 2024',
        contractValidFrom: new Date(2024, 0, 1),
        contractValidUntil: new Date(2024, 11, 31),
      },
      paymentTerms: {
        paymentModel: 'MONTHLY',
        monthlyRetainerAmount: 12000,
        currency: 'ILS',
        paymentCycle: 'monthly',
      },
    },
    {
      id: 'demo-company-2',
      name: 'TechStart Academy',
      brandType: 'brand',
      status: 'ACTIVE',
      contactName: 'דני לוי',
      contactEmail: 'danny@techstart.co.il',
      contactPhone: '054-9876543',
      notes: 'אקדמיה לסטארט-אפים, תוכן שבועי. פרויקט של 3 חודשים',
      contract: {
        contractType: 'TEXT',
        contractText: 'פרויקט מיוני 2024 עד אוגוסט 2024',
        contractValidFrom: new Date(2024, 5, 1),
        contractValidUntil: new Date(2024, 8, 30),
      },
      paymentTerms: {
        paymentModel: 'PER_PROJECT',
        perProjectAmount: 35000,
        currency: 'ILS',
      },
    },
    {
      id: 'demo-company-3',
      name: 'Glow Cosmetics',
      brandType: 'brand',
      status: 'ACTIVE',
      contactName: 'מיכל ברק',
      contactEmail: 'michal@glowcosmetics.com',
      contactPhone: '050-5551234',
      notes: 'קוסמטיקה טבעית, דגש על סטורי. שיתוף פעולה שוטף',
      contract: {
        contractType: 'TEXT',
        contractText: 'שיתוף פעולה שוטף החל ממרץ 2024',
        contractValidFrom: new Date(2024, 2, 1),
      },
      paymentTerms: {
        paymentModel: 'MONTHLY',
        monthlyRetainerAmount: 8500,
        currency: 'ILS',
        paymentCycle: 'monthly',
      },
    },
  ]
}

export function getDemoEvents(baseDate: Date = new Date()): Omit<CalendarEvent, 'createdAt' | 'updatedAt'>[] {
  const events: Omit<CalendarEvent, 'createdAt' | 'updatedAt'>[] = []

  // Week of events
  for (let i = 0; i < 7; i++) {
    const date = addDays(baseDate, i - 3)

    if (i === 0) {
      events.push({
        id: `demo-event-${i}-1`,
        category: 'story-shoot',
        title: 'צילום קמפיין סתיו',
        date,
        startTime: '10:00',
        endTime: '12:00',
        isAllDay: false,
        companyId: 'demo-company-1',
        reminders: [{ id: 'r1', minutesBefore: 30, isCustom: false }],
        linkedTasks: [],
      })
    }

    if (i === 1) {
      events.push(
        {
          id: `demo-event-${i}-1`,
          category: 'meeting',
          title: 'פגישת תיאום עם TechStart',
          date,
          startTime: '11:00',
          endTime: '12:00',
          isAllDay: false,
          companyId: 'demo-company-2',
          reminders: [{ id: 'r2', minutesBefore: 60, isCustom: false }],
          linkedTasks: [],
        },
        {
          id: `demo-event-${i}-2`,
          category: 'video-edit',
          title: 'עריכת רילס',
          date,
          startTime: '14:00',
          endTime: '16:00',
          isAllDay: false,
          companyId: 'demo-company-1',
          reminders: [],
          linkedTasks: [],
        }
      )
    }

    if (i === 2) {
      events.push({
        id: `demo-event-${i}-1`,
        category: 'vlog-shoot',
        title: 'צילום רילס למוצר חדש',
        date,
        startTime: '09:00',
        endTime: '11:30',
        isAllDay: false,
        companyId: 'demo-company-3',
        reminders: [{ id: 'r3', minutesBefore: 30, isCustom: false }],
        linkedTasks: [],
      })
    }

    if (i === 3) {
      events.push(
        {
          id: `demo-event-${i}-1`,
          category: 'photo-day',
          title: 'צילומי פרודקט',
          date,
          startTime: '10:00',
          endTime: '13:00',
          isAllDay: false,
          companyId: 'demo-company-3',
          reminders: [{ id: 'r4', minutesBefore: 60, isCustom: false }],
          linkedTasks: [],
        },
        {
          id: `demo-event-${i}-2`,
          category: 'post-upload',
          title: 'פרסום תוכן שבועי',
          date,
          startTime: '17:00',
          endTime: '18:00',
          isAllDay: false,
          reminders: [],
          linkedTasks: [],
        }
      )
    }

    if (i === 4) {
      events.push({
        id: `demo-event-${i}-1`,
        category: 'campaign',
        title: 'השקת קמפיין חדש',
        date,
        startTime: '12:00',
        endTime: '13:00',
        isAllDay: false,
        companyId: 'demo-company-2',
        reminders: [{ id: 'r5', minutesBefore: 120, isCustom: false }],
        linkedTasks: [],
      })
    }
  }

  return events
}

export function getDemoTasks(): Omit<Task, 'createdAt' | 'updatedAt'>[] {
  return [
    {
      id: 'demo-task-1',
      title: 'כתיבת קפשן לפוסט Fashion Nova',
      status: 'DONE',
      priority: 'HIGH',
      dueDate: addDays(new Date(), -2),
      companyId: 'demo-company-1',
      archived: false,
    },
    {
      id: 'demo-task-2',
      title: 'הכנת סקריפט לרילס',
      status: 'DOING',
      priority: 'HIGH',
      dueDate: new Date(),
      companyId: 'demo-company-1',
      archived: false,
    },
    {
      id: 'demo-task-3',
      title: 'עדכון תקציב לקמפיין',
      status: 'TODO',
      priority: 'MEDIUM',
      dueDate: addDays(new Date(), 1),
      companyId: 'demo-company-2',
      archived: false,
    },
    {
      id: 'demo-task-4',
      title: 'שליחת דראפט לאישור',
      status: 'TODO',
      priority: 'HIGH',
      dueDate: new Date(),
      companyId: 'demo-company-3',
      archived: false,
    },
    {
      id: 'demo-task-5',
      title: 'בחירת האשטאגים למוצר חדש',
      status: 'DONE',
      priority: 'MEDIUM',
      dueDate: addDays(new Date(), -1),
      companyId: 'demo-company-3',
      archived: false,
    },
  ]
}

export function getDemoGoals(): Omit<DailyGoal, 'createdAt' | 'updatedAt'>[] {
  const today = format(new Date(), 'yyyy-MM-dd')
  const yesterday = format(addDays(new Date(), -1), 'yyyy-MM-dd')

  return [
    {
      id: 'demo-goal-today',
      date: today,
      items: [
        { id: 'g1', title: 'סיום עריכת 2 רילס', status: 'PARTIAL' },
        { id: 'g2', title: 'פגישת תיאום עם לקוח חדש', status: 'DONE' },
        { id: 'g3', title: 'פרסום 5 סטורי', status: 'NOT_DONE' },
      ],
    },
    {
      id: 'demo-goal-yesterday',
      date: yesterday,
      items: [
        { id: 'g4', title: 'צילום תוכן לשבוע הבא', status: 'DONE' },
        { id: 'g5', title: 'כתיבת 3 קפשנים', status: 'DONE' },
        { id: 'g6', title: 'עדכון מחירון ללקוחות', status: 'PARTIAL' },
      ],
      reflection: {
        whatWorked: 'הצלחתי להיות יעילה בצילומים ולסיים הכל בזמן',
        whatBlocked: 'צריכה להקדיש יותר זמן לכתיבה מראש',
      },
    },
  ]
}

export function getDemoAIContent(): Omit<AIGeneratedContent, 'createdAt' | 'updatedAt'>[] {
  return [
    {
      id: 'demo-ai-1',
      userId: DEMO_USER_ID,
      templateId: 'sales-story',
      input: {
        templateId: 'sales-story',
        topic: 'קולקציית סתיו חדשה',
        tone: 'energetic',
        companyId: 'demo-company-1',
      },
      output:
        '🍂 הקולקציה שחיכיתם לה כאן!\n\nהגיע הסתיו והגיע הזמן להתעדכן 💃\n\nכל הסגנונות שאת צריכה, כל הצבעים של העונה.\n\n👉 לחצו על הלינק בביו והיו הראשונות!',
    },
    {
      id: 'demo-ai-2',
      userId: DEMO_USER_ID,
      templateId: 'personal-story',
      input: {
        templateId: 'personal-story',
        topic: 'למה בחרתי ביזמות תוכן',
        tone: 'professional',
      },
      output:
        '💭 למה עזבתי את העבודה התאגידית?\n\nכי הבנתי שיש לי משהו אמיתי לתת.\nמשהו שרק אני יכולה לתת.\n\nוהיום? אני עובדת עם המותגים שאני הכי אוהבת,\nיוצרת את התוכן שאני הכי מאמינה בו,\nובונה את החיים שתמיד חלמתי עליהם.\n\nזה לא תמיד קל, אבל זה תמיד שווה 💪',
    },
    {
      id: 'demo-ai-3',
      userId: DEMO_USER_ID,
      templateId: 'tiktok-hook',
      input: {
        templateId: 'tiktok-hook',
        topic: 'טיפים לקוסמטיקה טבעית',
        tone: 'friendly',
        companyId: 'demo-company-3',
      },
      output:
        'Hook #1: "רגע, אני חייבת לספר לכם מה גיליתי על קוסמטיקה טבעית..."\n\nHook #2: "אם עוד לא עברתם לטבעי, תשבו - זה ישנה לכם הכל"\n\nHook #3: "הדבר הזה שקוסמטיקה טבעית עשתה לעור שלי? אין על זה 😍"',
    },
  ]
}

export function getDemoActivities(): ActivityEvent[] {
  const now = new Date()

  return [
    {
      id: 'demo-activity-1',
      userId: DEMO_USER_ID,
      type: 'company_created',
      entityId: 'demo-company-1',
      entityName: 'Fashion Nova Israel',
      createdAt: addDays(now, -5),
    },
    {
      id: 'demo-activity-2',
      userId: DEMO_USER_ID,
      type: 'event_created',
      entityId: 'demo-event-1',
      entityName: 'צילום קמפיין סתיו',
      createdAt: addDays(now, -4),
    },
    {
      id: 'demo-activity-3',
      userId: DEMO_USER_ID,
      type: 'task_created',
      entityId: 'demo-task-1',
      entityName: 'כתיבת קפשן לפוסט',
      createdAt: addDays(now, -3),
    },
    {
      id: 'demo-activity-4',
      userId: DEMO_USER_ID,
      type: 'task_status_changed',
      entityId: 'demo-task-1',
      entityName: 'כתיבת קפשן לפוסט',
      metadata: { newStatus: 'DONE' },
      createdAt: addDays(now, -2),
    },
    {
      id: 'demo-activity-5',
      userId: DEMO_USER_ID,
      type: 'goal_set',
      entityId: 'demo-goal-today',
      entityName: '3 מטרות',
      metadata: { count: 3 },
      createdAt: addDays(now, -1),
    },
    {
      id: 'demo-activity-6',
      userId: DEMO_USER_ID,
      type: 'ai_generated',
      entityId: 'demo-ai-1',
      entityName: 'sales-story',
      metadata: { template: 'sales-story' },
      createdAt: now,
    },
  ]
}

export const DEMO_DATA = {
  companies: getDemoCompanies(),
  events: getDemoEvents(),
  tasks: getDemoTasks(),
  goals: getDemoGoals(),
  aiContent: getDemoAIContent(),
  activities: getDemoActivities(),
}
