import { LucideIcon } from 'lucide-react'
import { Building2, Store, User } from 'lucide-react'

export type BrandType = 'company' | 'brand' | 'client'

export type ContractType = 'NONE' | 'FILE' | 'LINK' | 'TEXT'

export type PaymentModel = 'MONTHLY' | 'PER_PURCHASE' | 'PER_PROJECT' | 'HOURLY' | 'OTHER'

export type CompanyStatus = 'ACTIVE' | 'ARCHIVED'

export interface ContractFileMeta {
  name: string
  size: number
  uploadedAt: Date
  data?: string // base64 for local storage
}

export interface ContractInfo {
  contractType: ContractType
  contractFileMeta?: ContractFileMeta
  contractLink?: string
  contractText?: string
  contractValidFrom?: Date
  contractValidUntil?: Date
}

export interface PaymentTerms {
  paymentModel: PaymentModel
  monthlyRetainerAmount?: number
  perPurchaseAmount?: number
  perProjectAmount?: number
  hourlyRate?: number
  currency: string
  paymentCycle?: string
  invoicingNotes?: string
}

export interface Company {
  id: string
  name: string
  brandType?: BrandType
  contactName?: string
  contactEmail?: string
  contactPhone?: string
  notes?: string
  contract: ContractInfo
  paymentTerms: PaymentTerms
  status: CompanyStatus
  createdAt: Date
  updatedAt: Date
}

// Brand type presets
export interface BrandTypePreset {
  id: BrandType
  label: string
  icon: LucideIcon
  color: string
  bgColor: string
}

export const BRAND_TYPE_PRESETS: Record<BrandType, BrandTypePreset> = {
  company: {
    id: 'company',
    label: 'חברה',
    icon: Building2,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  brand: {
    id: 'brand',
    label: 'מותג',
    icon: Store,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  client: {
    id: 'client',
    label: 'לקוח',
    icon: User,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
  },
}

// Payment model labels
export const PAYMENT_MODEL_LABELS: Record<PaymentModel, string> = {
  MONTHLY: 'חודשי',
  PER_PURCHASE: 'לפי רכישה',
  PER_PROJECT: 'לפי פרויקט',
  HOURLY: 'לפי שעה',
  OTHER: 'אחר',
}

export const PAYMENT_CYCLE_OPTIONS = [
  { value: 'monthly', label: 'חודשי' },
  { value: 'bi-monthly', label: 'דו-חודשי' },
  { value: 'quarterly', label: 'רבעוני' },
  { value: 'immediate', label: 'מיידי' },
  { value: 'net30', label: 'שוטף + 30' },
  { value: 'net60', label: 'שוטף + 60' },
]

export const CURRENCY_OPTIONS = [
  { value: 'ILS', label: '₪ שקל', symbol: '₪' },
  { value: 'USD', label: '$ דולר', symbol: '$' },
  { value: 'EUR', label: '€ יורו', symbol: '€' },
]

// Helper functions
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export const getContractStatus = (contract: ContractInfo): 'valid' | 'expiring' | 'expired' | 'none' => {
  if (contract.contractType === 'NONE') return 'none'

  if (!contract.contractValidUntil) return 'valid'

  const now = new Date()
  const validUntil = new Date(contract.contractValidUntil)
  const thirtyDaysFromNow = new Date()
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

  if (validUntil < now) return 'expired'
  if (validUntil < thirtyDaysFromNow) return 'expiring'
  return 'valid'
}

export const getContractStatusLabel = (status: ReturnType<typeof getContractStatus>): string => {
  switch (status) {
    case 'valid': return 'יש חוזה'
    case 'expiring': return 'פג בקרוב'
    case 'expired': return 'פג תוקף'
    case 'none': return 'אין חוזה'
  }
}

export const getContractStatusColor = (status: ReturnType<typeof getContractStatus>): string => {
  switch (status) {
    case 'valid': return 'text-emerald-600 bg-emerald-50'
    case 'expiring': return 'text-amber-600 bg-amber-50'
    case 'expired': return 'text-red-600 bg-red-50'
    case 'none': return 'text-neutral-500 bg-neutral-100'
  }
}

export const formatCurrency = (amount: number, currency: string): string => {
  const currencyOption = CURRENCY_OPTIONS.find(c => c.value === currency)
  const symbol = currencyOption?.symbol || currency
  return `${symbol}${amount.toLocaleString()}`
}

export const createDefaultCompany = (): Omit<Company, 'id' | 'createdAt' | 'updatedAt'> => ({
  name: '',
  status: 'ACTIVE',
  contract: {
    contractType: 'NONE',
  },
  paymentTerms: {
    paymentModel: 'MONTHLY',
    currency: 'ILS',
  },
})
