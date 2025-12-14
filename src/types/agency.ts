import { LucideIcon } from 'lucide-react'
import { Users, UserPlus, UserMinus, Building2 } from 'lucide-react'

export type AccountType = 'creator' | 'agency'

export type MembershipRole = 'creator' | 'manager' | 'admin'

export type MembershipStatus = 'active' | 'invited' | 'removed'

export interface AgencyMembership {
  id: string
  agencyId: string
  creatorUserId?: string
  inviteEmail?: string
  role: MembershipRole
  status: MembershipStatus
  createdAt: Date
  updatedAt: Date
}

export interface EarningsEntry {
  id: string
  creatorUserId: string
  companyId?: string
  companyName?: string
  amount: number
  currency: string
  earnedOn: Date
  notes?: string
  createdBy?: string
  createdAt: Date
  updatedAt: Date
}

export interface AgencyCreatorStats {
  agencyId: string
  creatorUserId: string
  creatorName: string
  creatorEmail: string
  companyCount: number
  monthlyEarnings: number
  yearlyEarnings: number
  activeCompanyCount: number
}

export interface AgencyDashboardStats {
  totalMonthlyEarnings: number
  totalYearlyEarnings: number
  totalCreators: number
  totalActiveCompanies: number
  creators: AgencyCreatorStats[]
}

export interface CreatorDetailData {
  creator: {
    id: string
    name: string
    email: string
  }
  companies: Array<{
    id: string
    name: string
    brandType?: string
    status: string
    monthlyRetainer?: number
    currency?: string
  }>
  earnings: EarningsEntry[]
  monthlyEarningsBreakdown: Array<{
    month: string
    total: number
    byCompany: Array<{
      companyId: string
      companyName: string
      amount: number
    }>
  }>
  recentActivity: Array<{
    id: string
    type: string
    entityName?: string
    createdAt: Date
  }>
}

// Role configurations
export interface RoleConfig {
  id: MembershipRole
  label: string
  description: string
  icon: LucideIcon
}

export const ROLE_CONFIGS: Record<MembershipRole, RoleConfig> = {
  creator: {
    id: 'creator',
    label: 'יוצר',
    description: 'יוצר תוכן שמנוהל על ידי הסוכנות',
    icon: Users,
  },
  manager: {
    id: 'manager',
    label: 'מנהל',
    description: 'יכול לנהל יוצרים ולהוסיף רשומות',
    icon: UserPlus,
  },
  admin: {
    id: 'admin',
    label: 'אדמין',
    description: 'הרשאות מלאות',
    icon: Building2,
  },
}

// Status configurations
export interface StatusConfig {
  id: MembershipStatus
  label: string
  color: string
  bgColor: string
}

export const STATUS_CONFIGS: Record<MembershipStatus, StatusConfig> = {
  active: {
    id: 'active',
    label: 'פעיל',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
  },
  invited: {
    id: 'invited',
    label: 'ממתין להזמנה',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
  },
  removed: {
    id: 'removed',
    label: 'הוסר',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
}

// Constants
export const MAX_CREATORS_PER_AGENCY = 40

// Helper functions
export const formatEarnings = (amount: number, currency: string = 'ILS'): string => {
  const symbols: Record<string, string> = {
    ILS: '₪',
    USD: '$',
    EUR: '€',
  }
  const symbol = symbols[currency] || currency
  return `${symbol}${amount.toLocaleString('he-IL')}`
}

export const getMonthName = (date: Date): string => {
  const months = [
    'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
    'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
  ]
  return months[date.getMonth()]
}

export const getYearMonth = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}
