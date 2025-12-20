import type { Company } from '@/types/company'
import type { CalendarEvent } from '@/types/calendar'
import type { Task } from '@/types/task'
import type { DailyGoal } from '@/types/goal'
import type { AIGeneratedContent } from '@/types/ai-content'
import type { ActivityEvent } from '@/types/activity'
import { addDays, format } from 'date-fns'

// Dedicated demo user - completely isolated from real users
export const DEMO_USER_ID = 'demo-user-12345'

export const DEMO_USER = {
  id: DEMO_USER_ID,
  name: 'שירה כהן',
  email: 'demo@creators-os.com',
  avatar: undefined,
  plan: 'premium' as const,
  accountType: 'creator' as const,
}

// Demo agency user for agency demo mode
export const DEMO_AGENCY_USER = {
  id: 'demo-agency-user-12345',
  name: 'סוכנות דיגיטל פלוס',
  email: 'agency-demo@creators-os.com',
  avatar: undefined,
  plan: 'premium' as const,
  accountType: 'agency' as const,
}

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
    {
      id: 'demo-company-4',
      name: 'FitLife Gym',
      brandType: 'brand',
      status: 'ACTIVE',
      contactName: 'אורי שמש',
      contactEmail: 'ori@fitlife.co.il',
      contactPhone: '053-7778888',
      notes: 'רשת חדרי כושר, קמפיין חברות חדשות. תוכן ספורטיבי ומוטיבציה',
      contract: {
        contractType: 'TEXT',
        contractText: 'חוזה רבעוני Q4 2024',
        contractValidFrom: new Date(2024, 9, 1),
        contractValidUntil: new Date(2024, 11, 31),
      },
      paymentTerms: {
        paymentModel: 'MONTHLY',
        monthlyRetainerAmount: 9500,
        currency: 'ILS',
        paymentCycle: 'monthly',
      },
    },
    {
      id: 'demo-company-5',
      name: 'Cafe Aroma TLV',
      brandType: 'brand',
      status: 'ACTIVE',
      contactName: 'נועה גולן',
      contactEmail: 'noa@cafearoma.co.il',
      contactPhone: '050-1112233',
      notes: 'בית קפה בוטיק בתל אביב. תוכן לייפסטייל וקולינרי. 4 פוסטים בחודש',
      contract: {
        contractType: 'TEXT',
        contractText: 'שיתוף פעולה מתמשך',
        contractValidFrom: new Date(2024, 6, 1),
      },
      paymentTerms: {
        paymentModel: 'MONTHLY',
        monthlyRetainerAmount: 6000,
        currency: 'ILS',
        paymentCycle: 'monthly',
      },
    },
    {
      id: 'demo-company-6',
      name: 'Urban Style',
      brandType: 'brand',
      status: 'ACTIVE',
      contactName: 'יעל כץ',
      contactEmail: 'yael@urbanstyle.com',
      contactPhone: '054-3334455',
      notes: 'מותג אופנת רחוב. בשלב משא ומתן על חוזה שנתי - ליד חם!',
      contract: {
        contractType: 'NONE',
      },
      paymentTerms: {
        paymentModel: 'MONTHLY',
        currency: 'ILS',
      },
    },
    {
      id: 'demo-company-7',
      name: 'Green Planet',
      brandType: 'brand',
      status: 'ARCHIVED',
      contactName: 'תומר אבני',
      contactEmail: 'tomer@greenplanet.co.il',
      contactPhone: '052-6667788',
      notes: 'מוצרים אקולוגיים. הפסקה זמנית - ממשיכים בינואר',
      contract: {
        contractType: 'TEXT',
        contractText: 'חוזה מושהה עד ינואר 2025',
        contractValidFrom: new Date(2024, 3, 1),
      },
      paymentTerms: {
        paymentModel: 'MONTHLY',
        monthlyRetainerAmount: 7000,
        currency: 'ILS',
        paymentCycle: 'monthly',
      },
    },
  ]
}

export function getDemoEvents(baseDate: Date = new Date()): Omit<CalendarEvent, 'createdAt' | 'updatedAt'>[] {
  const events: Omit<CalendarEvent, 'createdAt' | 'updatedAt'>[] = []

  // Week of events - more variety
  for (let i = 0; i < 10; i++) {
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
      events.push(
        {
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
        },
        {
          id: `demo-event-${i}-2`,
          category: 'meeting',
          title: 'שיחת זום עם Urban Style',
          date,
          startTime: '15:00',
          endTime: '16:00',
          isAllDay: false,
          companyId: 'demo-company-6',
          reminders: [{ id: 'r3b', minutesBefore: 15, isCustom: false }],
          linkedTasks: [],
        }
      )
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
        },
        {
          id: `demo-event-${i}-3`,
          category: 'vlog-shoot',
          title: 'צילום אימון בחדר כושר',
          date,
          startTime: '07:00',
          endTime: '09:00',
          isAllDay: false,
          companyId: 'demo-company-4',
          reminders: [{ id: 'r4b', minutesBefore: 60, isCustom: false }],
          linkedTasks: [],
        }
      )
    }

    if (i === 4) {
      events.push(
        {
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
        },
        {
          id: `demo-event-${i}-2`,
          category: 'story-shoot',
          title: 'צילום סטורי לקפה',
          date,
          startTime: '16:00',
          endTime: '17:30',
          isAllDay: false,
          companyId: 'demo-company-5',
          reminders: [],
          linkedTasks: [],
        }
      )
    }

    if (i === 5) {
      events.push(
        {
          id: `demo-event-${i}-1`,
          category: 'video-edit',
          title: 'עריכת סרטון FitLife',
          date,
          startTime: '10:00',
          endTime: '14:00',
          isAllDay: false,
          companyId: 'demo-company-4',
          reminders: [],
          linkedTasks: [],
        },
        {
          id: `demo-event-${i}-2`,
          category: 'meeting',
          title: 'פגישת סיכום חודשי',
          date,
          startTime: '16:00',
          endTime: '17:00',
          isAllDay: false,
          companyId: 'demo-company-1',
          reminders: [{ id: 'r5b', minutesBefore: 30, isCustom: false }],
          linkedTasks: [],
        }
      )
    }

    if (i === 6) {
      events.push({
        id: `demo-event-${i}-1`,
        category: 'photo-day',
        title: 'יום צילומים - קולקציה חדשה',
        date,
        startTime: '09:00',
        endTime: '17:00',
        isAllDay: false,
        companyId: 'demo-company-1',
        reminders: [{ id: 'r6', minutesBefore: 1440, isCustom: false }],
        linkedTasks: [],
      })
    }

    if (i === 7) {
      events.push(
        {
          id: `demo-event-${i}-1`,
          category: 'post-upload',
          title: 'העלאת רילס אימון',
          date,
          startTime: '18:00',
          endTime: '19:00',
          isAllDay: false,
          companyId: 'demo-company-4',
          reminders: [],
          linkedTasks: [],
        },
        {
          id: `demo-event-${i}-2`,
          category: 'meeting',
          title: 'הדרכת צוות Green Planet',
          date,
          startTime: '11:00',
          endTime: '12:30',
          isAllDay: false,
          companyId: 'demo-company-7',
          reminders: [{ id: 'r7', minutesBefore: 60, isCustom: false }],
          linkedTasks: [],
        }
      )
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
    {
      id: 'demo-task-6',
      title: 'עריכת 3 רילס לאימון',
      status: 'DOING',
      priority: 'HIGH',
      dueDate: new Date(),
      companyId: 'demo-company-4',
      archived: false,
    },
    {
      id: 'demo-task-7',
      title: 'צילום מנות חדשות',
      status: 'TODO',
      priority: 'MEDIUM',
      dueDate: addDays(new Date(), 2),
      companyId: 'demo-company-5',
      archived: false,
    },
    {
      id: 'demo-task-8',
      title: 'הכנת הצעת מחיר ל-Urban Style',
      status: 'TODO',
      priority: 'HIGH',
      dueDate: addDays(new Date(), 1),
      companyId: 'demo-company-6',
      archived: false,
    },
    {
      id: 'demo-task-9',
      title: 'סיכום ביצועי החודש',
      status: 'TODO',
      priority: 'LOW',
      dueDate: addDays(new Date(), 5),
      companyId: 'demo-company-1',
      archived: false,
    },
    {
      id: 'demo-task-10',
      title: 'תיאום לו״ז צילומים לשבוע הבא',
      status: 'DONE',
      priority: 'MEDIUM',
      dueDate: addDays(new Date(), -1),
      companyId: 'demo-company-4',
      archived: false,
    },
    {
      id: 'demo-task-11',
      title: 'בדיקת אנליטיקס אינסטגרם',
      status: 'TODO',
      priority: 'LOW',
      dueDate: addDays(new Date(), 3),
      archived: false,
    },
    {
      id: 'demo-task-12',
      title: 'יצירת תוכן לסטורי יומי',
      status: 'DOING',
      priority: 'MEDIUM',
      dueDate: new Date(),
      archived: false,
    },
  ]
}

export function getDemoGoals(): Omit<DailyGoal, 'createdAt' | 'updatedAt'>[] {
  const today = format(new Date(), 'yyyy-MM-dd')
  const yesterday = format(addDays(new Date(), -1), 'yyyy-MM-dd')
  const twoDaysAgo = format(addDays(new Date(), -2), 'yyyy-MM-dd')
  const threeDaysAgo = format(addDays(new Date(), -3), 'yyyy-MM-dd')

  return [
    {
      id: 'demo-goal-today',
      date: today,
      items: [
        { id: 'g1', title: 'סיום עריכת 2 רילס', status: 'PARTIAL' },
        { id: 'g2', title: 'פגישת תיאום עם לקוח חדש', status: 'DONE' },
        { id: 'g3', title: 'פרסום 5 סטורי', status: 'NOT_DONE' },
        { id: 'g4', title: 'שליחת הצעת מחיר ל-Urban Style', status: 'NOT_DONE' },
      ],
    },
    {
      id: 'demo-goal-yesterday',
      date: yesterday,
      items: [
        { id: 'g5', title: 'צילום תוכן לשבוע הבא', status: 'DONE' },
        { id: 'g6', title: 'כתיבת 3 קפשנים', status: 'DONE' },
        { id: 'g7', title: 'עדכון מחירון ללקוחות', status: 'PARTIAL' },
      ],
      reflection: {
        whatWorked: 'הצלחתי להיות יעילה בצילומים ולסיים הכל בזמן',
        whatBlocked: 'צריכה להקדיש יותר זמן לכתיבה מראש',
      },
    },
    {
      id: 'demo-goal-2days',
      date: twoDaysAgo,
      items: [
        { id: 'g8', title: 'עריכת וידאו FitLife', status: 'DONE' },
        { id: 'g9', title: 'פגישת זום עם Glow', status: 'DONE' },
        { id: 'g10', title: 'תכנון תוכן לחודש הבא', status: 'DONE' },
      ],
      reflection: {
        whatWorked: 'יום מאוד פרודוקטיבי! הצלחתי לסיים את כל המשימות',
        whatBlocked: 'כלום, יום מעולה',
      },
    },
    {
      id: 'demo-goal-3days',
      date: threeDaysAgo,
      items: [
        { id: 'g11', title: 'צילום קמפיין סתיו', status: 'DONE' },
        { id: 'g12', title: 'שליחת חשבונית ל-TechStart', status: 'DONE' },
        { id: 'g13', title: 'מחקר טרנדים חדשים', status: 'PARTIAL' },
      ],
      reflection: {
        whatWorked: 'הצילומים יצאו מעולים',
        whatBlocked: 'לא הספקתי להשלים את המחקר',
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
    {
      id: 'demo-ai-4',
      userId: DEMO_USER_ID,
      templateId: 'personal-story',
      input: {
        templateId: 'personal-story',
        topic: 'אימון בוקר מוטיבציה',
        tone: 'energetic',
      },
      output:
        '💪 05:30 בבוקר והאימון כבר מאחורי.\n\nאין תירוצים, יש רק תוצאות.\n\nכשהעולם עוד ישן, אני כבר בונה את עצמי.\n\n🔥 מי איתי מחר בבוקר?\n\n#fitlife #אימון #מוטיבציה #חדרכושר #בוקר',
    },
    {
      id: 'demo-ai-5',
      userId: DEMO_USER_ID,
      templateId: 'before-after-reel',
      input: {
        templateId: 'before-after-reel',
        topic: 'יום בחיי יוצרת תוכן',
        tone: 'friendly',
      },
      output:
        '🎬 סקריפט לרילס - יום בחיי יוצרת תוכן\n\n[0-3 שניות]\nHook: "רציתי להראות לכם איך נראה יום עבודה אמיתי שלי..."\n\n[3-8 שניות]\nבוקר: קפה + מיילים + תכנון היום\n\n[8-15 שניות]\nצהריים: צילומים / עריכה / פגישות זום\n\n[15-22 שניות]\nערב: עריכה סופית + פרסום + אינטראקציה\n\n[22-30 שניות]\nסיום: "וזה רק יום אחד... מחר נתחיל מחדש 😅"\n\nCTA: "שמרו לאלה שחושבים שזו עבודה קלה"',
    },
    {
      id: 'demo-ai-6',
      userId: DEMO_USER_ID,
      templateId: 'cta-variations',
      input: {
        templateId: 'cta-variations',
        topic: 'מנת בראנץ\' חדשה בקפה',
        tone: 'friendly',
      },
      output:
        '☕ 5 קריאות לפעולה לבראנץ\':\n\n1. "הזמינו עכשיו ותקבלו קפה במתנה!"\n\n2. "השולחנות מתמלאים - שריינו מקום 📱"\n\n3. "בואו לטעום את הבראנץ\' שכולם מדברים עליו"\n\n4. "רק היום: 20% הנחה לעוקבים!"\n\n5. "תייגו חבר/ה שחייב/ת בראנץ\' 👇"',
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
      createdAt: addDays(now, -7),
    },
    {
      id: 'demo-activity-2',
      userId: DEMO_USER_ID,
      type: 'company_created',
      entityId: 'demo-company-4',
      entityName: 'FitLife Gym',
      createdAt: addDays(now, -6),
    },
    {
      id: 'demo-activity-3',
      userId: DEMO_USER_ID,
      type: 'event_created',
      entityId: 'demo-event-1',
      entityName: 'צילום קמפיין סתיו',
      createdAt: addDays(now, -5),
    },
    {
      id: 'demo-activity-4',
      userId: DEMO_USER_ID,
      type: 'task_created',
      entityId: 'demo-task-1',
      entityName: 'כתיבת קפשן לפוסט',
      createdAt: addDays(now, -4),
    },
    {
      id: 'demo-activity-5',
      userId: DEMO_USER_ID,
      type: 'task_status_changed',
      entityId: 'demo-task-1',
      entityName: 'כתיבת קפשן לפוסט',
      metadata: { newStatus: 'DONE' },
      createdAt: addDays(now, -3),
    },
    {
      id: 'demo-activity-6',
      userId: DEMO_USER_ID,
      type: 'goal_set',
      entityId: 'demo-goal-3days',
      entityName: '3 מטרות',
      metadata: { count: 3 },
      createdAt: addDays(now, -3),
    },
    {
      id: 'demo-activity-7',
      userId: DEMO_USER_ID,
      type: 'ai_generated',
      entityId: 'demo-ai-4',
      entityName: 'instagram-caption',
      metadata: { template: 'instagram-caption' },
      createdAt: addDays(now, -2),
    },
    {
      id: 'demo-activity-8',
      userId: DEMO_USER_ID,
      type: 'event_created',
      entityId: 'demo-event-5-1',
      entityName: 'עריכת סרטון FitLife',
      createdAt: addDays(now, -2),
    },
    {
      id: 'demo-activity-9',
      userId: DEMO_USER_ID,
      type: 'task_created',
      entityId: 'demo-task-6',
      entityName: 'עריכת 3 רילס לאימון',
      createdAt: addDays(now, -1),
    },
    {
      id: 'demo-activity-10',
      userId: DEMO_USER_ID,
      type: 'goal_set',
      entityId: 'demo-goal-yesterday',
      entityName: '3 מטרות',
      metadata: { count: 3 },
      createdAt: addDays(now, -1),
    },
    {
      id: 'demo-activity-11',
      userId: DEMO_USER_ID,
      type: 'ai_generated',
      entityId: 'demo-ai-5',
      entityName: 'reel-script',
      metadata: { template: 'reel-script' },
      createdAt: addDays(now, -1),
    },
    {
      id: 'demo-activity-12',
      userId: DEMO_USER_ID,
      type: 'task_status_changed',
      entityId: 'demo-task-5',
      entityName: 'בחירת האשטאגים למוצר חדש',
      metadata: { newStatus: 'DONE' },
      createdAt: addDays(now, -1),
    },
    {
      id: 'demo-activity-13',
      userId: DEMO_USER_ID,
      type: 'goal_set',
      entityId: 'demo-goal-today',
      entityName: '4 מטרות',
      metadata: { count: 4 },
      createdAt: now,
    },
    {
      id: 'demo-activity-14',
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
