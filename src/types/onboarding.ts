export type OnboardingStep =
  | 'welcome'
  | 'creator-type'
  | 'first-company'
  | 'first-event'
  | 'first-goals'
  | 'complete'

export type CreatorType =
  | 'content-creator'
  | 'influencer'
  | 'freelancer'
  | 'agency'
  | 'other'

export interface OnboardingState {
  currentStep: OnboardingStep
  creatorType?: CreatorType
  hasCompletedOnboarding: boolean
}

export const CREATOR_TYPES: Array<{
  id: CreatorType
  label: string
  description: string
  icon: string
}> = [
  {
    id: 'content-creator',
    label: 'יוצרת תוכן',
    description: 'אינסטגרם, טיקטוק, יוטיוב',
    icon: '📱',
  },
  {
    id: 'influencer',
    label: 'משפיענית',
    description: 'שיתופי פעולה ופרסומות',
    icon: '✨',
  },
  {
    id: 'freelancer',
    label: 'פרילנסרית',
    description: 'שירותי קריאייטיב',
    icon: '💼',
  },
  {
    id: 'agency',
    label: 'סוכנות / אקדמיה',
    description: 'ניהול לקוחות מרובים',
    icon: '🏢',
  },
  {
    id: 'other',
    label: 'אחר',
    description: 'עסק או תפקיד אחר',
    icon: '🎯',
  },
]
