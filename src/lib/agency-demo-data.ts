import { addDays, subDays, format } from 'date-fns'
import type { AgencyDashboardStats, AgencyCreatorStats } from '@/types/agency'
import type { HealthStatus } from '@/types/premium'
import type { AgencyControlData, AgencyCreatorWeekData } from '@/types/premium'
import type { InsightDisplay } from '@/types/insights'

const DEMO_AGENCY_ID = 'demo-agency'

// Extended demo creator interface with additional fields for demo
export interface AgencyDemoCreator {
  creatorUserId: string
  creatorName: string
  creatorEmail: string
  monthlyEarnings: number
  yearlyEarnings: number
  companyCount: number
  activeCompanyCount: number
  agencyId: string
  // Additional fields for demo
  eventsThisMonth: number
  tasksCompletedRate: number
  healthScore: number
  healthStatus: HealthStatus
}

// Demo Creators for Agency
export const AGENCY_DEMO_CREATORS: AgencyDemoCreator[] = [
  {
    agencyId: DEMO_AGENCY_ID,
    creatorUserId: 'demo-creator-1',
    creatorName: 'נועה כהן',
    creatorEmail: 'noa@creators.demo',
    monthlyEarnings: 42500,
    yearlyEarnings: 510000,
    companyCount: 4,
    activeCompanyCount: 4,
    eventsThisMonth: 18,
    tasksCompletedRate: 92,
    healthScore: 87,
    healthStatus: 'excellent' as HealthStatus,
  },
  {
    agencyId: DEMO_AGENCY_ID,
    creatorUserId: 'demo-creator-2',
    creatorName: 'יעל לוי',
    creatorEmail: 'yael@creators.demo',
    monthlyEarnings: 38000,
    yearlyEarnings: 456000,
    companyCount: 3,
    activeCompanyCount: 3,
    eventsThisMonth: 15,
    tasksCompletedRate: 88,
    healthScore: 78,
    healthStatus: 'good' as HealthStatus,
  },
  {
    agencyId: DEMO_AGENCY_ID,
    creatorUserId: 'demo-creator-3',
    creatorName: 'מיכל ברק',
    creatorEmail: 'michal@creators.demo',
    monthlyEarnings: 35000,
    yearlyEarnings: 420000,
    companyCount: 5,
    activeCompanyCount: 5,
    eventsThisMonth: 22,
    tasksCompletedRate: 85,
    healthScore: 72,
    healthStatus: 'good' as HealthStatus,
  },
  {
    agencyId: DEMO_AGENCY_ID,
    creatorUserId: 'demo-creator-4',
    creatorName: 'רונית שמש',
    creatorEmail: 'ronit@creators.demo',
    monthlyEarnings: 28500,
    yearlyEarnings: 342000,
    companyCount: 2,
    activeCompanyCount: 2,
    eventsThisMonth: 12,
    tasksCompletedRate: 95,
    healthScore: 91,
    healthStatus: 'excellent' as HealthStatus,
  },
  {
    agencyId: DEMO_AGENCY_ID,
    creatorUserId: 'demo-creator-5',
    creatorName: 'דנה אברהם',
    creatorEmail: 'dana@creators.demo',
    monthlyEarnings: 31000,
    yearlyEarnings: 372000,
    companyCount: 3,
    activeCompanyCount: 3,
    eventsThisMonth: 14,
    tasksCompletedRate: 78,
    healthScore: 65,
    healthStatus: 'moderate' as HealthStatus,
  },
]

// Demo Dashboard Stats
export function getAgencyDemoDashboardStats(): AgencyDashboardStats {
  // Convert demo creators to match AgencyCreatorStats type
  const creators: AgencyCreatorStats[] = AGENCY_DEMO_CREATORS.map(c => ({
    agencyId: c.agencyId,
    creatorUserId: c.creatorUserId,
    creatorName: c.creatorName,
    creatorEmail: c.creatorEmail,
    companyCount: c.companyCount,
    monthlyEarnings: c.monthlyEarnings,
    yearlyEarnings: c.yearlyEarnings,
    activeCompanyCount: c.activeCompanyCount,
  }))

  return {
    totalMonthlyEarnings: 175000,
    totalYearlyEarnings: 2100000,
    totalCreators: AGENCY_DEMO_CREATORS.length,
    totalActiveCompanies: 12,
    creators,
  }
}

// Demo Control Panel Data
export function getAgencyDemoControlData(providedWeekDates?: Date[]): AgencyControlData {
  let weekDates: Date[]

  if (providedWeekDates && providedWeekDates.length === 7) {
    weekDates = providedWeekDates
  } else {
    const today = new Date()
    weekDates = []

    // Get current week dates
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      weekDates.push(date)
    }
  }

  const creators: AgencyCreatorWeekData[] = AGENCY_DEMO_CREATORS.map((creator, idx) => ({
    creatorId: creator.creatorUserId,
    creatorName: creator.creatorName,
    creatorEmail: creator.creatorEmail,
    healthScore: creator.healthScore,
    healthStatus: creator.healthStatus,
    weekData: weekDates.map((date, dayIdx) => {
      // Create varied load per creator per day
      const baseEventsCount = Math.floor(Math.random() * 3) + 1
      const baseTasksCount = Math.floor(Math.random() * 3)
      const isWeekend = dayIdx === 5 || dayIdx === 6
      const eventsCount = isWeekend ? Math.max(0, baseEventsCount - 2) : baseEventsCount
      const tasksCount = isWeekend ? 0 : baseTasksCount
      const totalLoad = eventsCount + tasksCount
      const companies = ['Fashion Nova', 'TechStart', 'Glow Cosmetics', 'FitLife']

      return {
        date: format(date, 'yyyy-MM-dd'),
        eventsCount,
        tasksCount,
        totalLoad,
        isHeavy: totalLoad >= 4,
        topCompanies: companies.slice(0, Math.min(eventsCount, 2)),
        events: Array(eventsCount).fill(null).map((_, i) => ({
          id: `demo-event-${creator.creatorUserId}-${dayIdx}-${i}`,
          title: ['צילום תוכן', 'פגישת לקוח', 'עריכת וידאו', 'השקת קמפיין', 'סטורי יומי'][Math.floor(Math.random() * 5)],
          startTime: ['09:00', '11:00', '14:00', '16:00'][i] || '10:00',
          companyName: companies[Math.floor(Math.random() * companies.length)],
          companyId: `demo-company-${i}`,
        })),
        tasks: Array(tasksCount).fill(null).map((_, i) => ({
          id: `demo-task-${creator.creatorUserId}-${dayIdx}-${i}`,
          title: ['כתיבת קפשן', 'עריכת תמונות', 'אישור תוכן', 'תיאום צילום'][Math.floor(Math.random() * 4)],
          priority: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)] as 'high' | 'medium' | 'low',
          status: 'TODO' as const,
        })),
      }
    }),
  }))

  return {
    creators,
    weekStart: format(weekDates[0], 'yyyy-MM-dd'),
    weekEnd: format(weekDates[6], 'yyyy-MM-dd'),
    overallStats: {
      totalCreators: AGENCY_DEMO_CREATORS.length,
      calmCount: 2,
      busyCount: 2,
      overloadedCount: 1,
      avgScore: 79,
    },
  }
}

// Demo Insights - InsightSeverity: 'info' | 'warning' | 'risk'
export function getAgencyDemoInsights(): InsightDisplay[] {
  return [
    {
      id: 'demo-insight-1',
      severity: 'warning',
      title: 'יוצרת בעומס גבוה',
      message: 'דנה אברהם עם 8 משימות השבוע - שקלו להעביר חלק לנועה',
      icon: '⚠️',
      creatorName: 'דנה אברהם',
    },
    {
      id: 'demo-insight-2',
      severity: 'info',
      title: 'צמיחה בהכנסות',
      message: 'הסוכנות גדלה ב-8% החודש - המשיכו כך!',
      icon: '📈',
    },
    {
      id: 'demo-insight-3',
      severity: 'warning',
      title: '7 אישורים ממתינים',
      message: '3 מהם דחופים - טפלו בהם עד סוף היום',
      icon: '📋',
    },
    {
      id: 'demo-insight-4',
      severity: 'info',
      title: 'יוצרת מצטיינת',
      message: 'רונית שמש עם 95% השלמת משימות - שקלו בונוס',
      icon: '🌟',
      creatorName: 'רונית שמש',
    },
  ]
}

// Demo Creator Detail
export function getAgencyDemoCreatorDetail(creatorId: string) {
  const creator = AGENCY_DEMO_CREATORS.find(c => c.creatorUserId === creatorId)
  if (!creator) return null

  const today = new Date()

  return {
    ...creator,
    companies: [
      { id: 'demo-comp-1', name: 'Fashion Nova Israel', monthlyRetainer: 12000, status: 'ACTIVE' },
      { id: 'demo-comp-2', name: 'TechStart Academy', monthlyRetainer: 8500, status: 'ACTIVE' },
      { id: 'demo-comp-3', name: 'Glow Cosmetics', monthlyRetainer: 9000, status: 'ACTIVE' },
    ].slice(0, creator.companyCount),
    recentEvents: [
      { id: 'e1', title: 'צילום קמפיין', date: today, status: 'completed' },
      { id: 'e2', title: 'פגישת תיאום', date: addDays(today, 1), status: 'upcoming' },
      { id: 'e3', title: 'עריכת וידאו', date: addDays(today, 2), status: 'upcoming' },
    ],
    recentTasks: [
      { id: 't1', title: 'כתיבת קפשן', status: 'DONE', priority: 'HIGH' },
      { id: 't2', title: 'אישור תוכן', status: 'DOING', priority: 'MEDIUM' },
      { id: 't3', title: 'עדכון לקוח', status: 'TODO', priority: 'LOW' },
    ],
    earningsTrend: [
      { month: 'ינו', amount: creator.monthlyEarnings * 0.85 },
      { month: 'פבר', amount: creator.monthlyEarnings * 0.88 },
      { month: 'מרץ', amount: creator.monthlyEarnings * 0.92 },
      { month: 'אפר', amount: creator.monthlyEarnings * 0.95 },
      { month: 'מאי', amount: creator.monthlyEarnings * 0.98 },
      { month: 'יוני', amount: creator.monthlyEarnings },
    ],
  }
}

// Demo Members
export function getAgencyDemoMembers() {
  return AGENCY_DEMO_CREATORS.map(creator => ({
    id: `demo-membership-${creator.creatorUserId}`,
    agencyId: DEMO_AGENCY_ID,
    creatorUserId: creator.creatorUserId,
    status: 'active' as const,
    role: 'creator' as const,
    joinedAt: new Date('2024-01-15'),
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    inviteEmail: undefined,
    creator: {
      id: creator.creatorUserId,
      name: creator.creatorName,
      email: creator.creatorEmail,
    },
  }))
}

// Demo Approvals - Using ApprovalItemType: 'post' | 'reel' | 'story' | 'tiktok' | 'other'
export function getAgencyDemoApprovals() {
  return [
    {
      id: 'demo-approval-1',
      title: 'רילס Fashion Nova - קולקציית קיץ',
      creatorId: 'demo-creator-1',
      creatorName: 'נועה כהן',
      companyName: 'Fashion Nova Israel',
      status: 'pending',
      createdAt: subDays(new Date(), 1),
      dueDate: addDays(new Date(), 2),
      type: 'reel' as const,
    },
    {
      id: 'demo-approval-2',
      title: 'פוסט TechStart - השקת קורס',
      creatorId: 'demo-creator-2',
      creatorName: 'יעל לוי',
      companyName: 'TechStart Academy',
      status: 'pending',
      createdAt: subDays(new Date(), 2),
      dueDate: addDays(new Date(), 1),
      type: 'post' as const,
    },
    {
      id: 'demo-approval-3',
      title: 'סטורי Glow - מוצר חדש',
      creatorId: 'demo-creator-3',
      creatorName: 'מיכל ברק',
      companyName: 'Glow Cosmetics',
      status: 'approved',
      createdAt: subDays(new Date(), 3),
      type: 'story' as const,
    },
    {
      id: 'demo-approval-4',
      title: 'טיקטוק FitLife',
      creatorId: 'demo-creator-4',
      creatorName: 'רונית שמש',
      companyName: 'FitLife Gym',
      status: 'pending',
      createdAt: new Date(),
      dueDate: addDays(new Date(), 3),
      type: 'tiktok' as const,
    },
    {
      id: 'demo-approval-5',
      title: 'פוסט Fashion Nova נוסף',
      creatorId: 'demo-creator-1',
      creatorName: 'נועה כהן',
      companyName: 'Fashion Nova Israel',
      status: 'changes_requested',
      createdAt: subDays(new Date(), 4),
      type: 'post' as const,
      feedback: 'צריך להחליף את התמונה השלישית',
    },
  ]
}
