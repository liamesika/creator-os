export type PlanTier = 'free' | 'premium' | 'agency'

export interface PricingPlan {
  id: PlanTier
  name: string
  nameHebrew: string
  description: string
  monthlyPrice: number
  annualPrice: number
  annualDiscount: number // percentage
  currency: string
  features: string[]
  limitations: string[]
  cta: string
  ctaLink: string
  popular: boolean
  showPrice: boolean // for agency tier
}

export interface AgencyPricingConfig {
  title: string
  subtitle: string
  benefits: string[]
  useCases: Array<{
    title: string
    description: string
  }>
  contactEmail: string
}

// Pricing configuration - easy to adjust
export const PRICING_CONFIG: Record<PlanTier, PricingPlan> = {
  free: {
    id: 'free',
    name: 'Free',
    nameHebrew: 'חינם',
    description: 'התחילו בחינם',
    monthlyPrice: 0,
    annualPrice: 0,
    annualDiscount: 0,
    currency: 'ILS',
    features: [
      'עד 3 לקוחות פעילים',
      'עד 10 אירועים בחודש',
      'עד 20 משימות',
      'מטרות יומיות',
      'ציר פעילות בסיסי',
    ],
    limitations: [
      'ללא תבניות לוח שנה',
      'ללא יצירת תוכן AI',
      'ללא סקירה שבועית',
    ],
    cta: 'התחילו חינם',
    ctaLink: '/signup',
    popular: false,
    showPrice: true,
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    nameHebrew: 'פרימיום',
    description: 'עבור יוצרים מקצועיים',
    monthlyPrice: 49,
    annualPrice: 490, // ~17% discount
    annualDiscount: 17,
    currency: 'ILS',
    features: [
      'לקוחות ללא הגבלה',
      'אירועים ללא הגבלה',
      'משימות ללא הגבלה',
      'תבניות לוח שנה מתקדמות',
      'יצירת תוכן AI ללא הגבלה',
      'סקירה שבועית מלאה',
      'ציר פעילות מלא',
      'תמיכה מועדפת',
    ],
    limitations: [],
    cta: 'התחילו Premium',
    ctaLink: '/signup?plan=premium',
    popular: true,
    showPrice: true,
  },
  agency: {
    id: 'agency',
    name: 'Agency',
    nameHebrew: 'סוכנויות',
    description: 'פתרון מותאם לסוכנויות וצוותים',
    monthlyPrice: 0, // Custom pricing
    annualPrice: 0,
    annualDiscount: 0,
    currency: 'ILS',
    features: [
      'כל התכונות של Premium',
      'ניהול מרכזי של כל הלקוחות',
      'תיאום צוות - מי עובד על מה',
      'דשבורד מנהלים לביצועים',
      'תבניות משותפות לצוות',
      'ברנדינג מותאם אישית',
      'תמיכה ייעודית',
      'הדרכה מלאה לצוות',
    ],
    limitations: [],
    cta: 'צרו קשר',
    ctaLink: '/contact?type=agency',
    popular: false,
    showPrice: false, // Custom pricing only
  },
}

export const AGENCY_CONFIG: AgencyPricingConfig = {
  title: 'Creators OS לסוכנויות וצוותים',
  subtitle: 'פתרון מקצה לקצה לניהול סוכנויות תוכן, צוותי קריאייטיב ומחלקות ניהול קהילה',
  benefits: [
    'ניהול מרכזי של כל הלקוחות והפרויקטים',
    'תיאום צוות - מי עובד על מה ומתי',
    'דשבורד מנהלים לעקוב אחרי ביצועים',
    'תבניות משותפות לכל הצוות',
    'ברנדינג מותאם אישית',
    'תמיכה ייעודית',
    'הדרכה מלאה לצוות',
    'אינטגרציות מותאמות אישית',
  ],
  useCases: [
    {
      title: 'סוכנויות ניהול תוכן',
      description: 'נהלו עשרות לקוחות עם צוות של יוצרים',
    },
    {
      title: 'צוותי תוכן פנימיים',
      description: 'תאמו בין מנהלי קהילה, מעצבים ויוצרים',
    },
    {
      title: 'סטודיו קריאייטיב',
      description: 'עקבו אחרי פרויקטים, לוחות זמנים וצוות',
    },
  ],
  contactEmail: 'agencies@creators-os.com',
}

// Helper functions
export function getMonthlyPrice(tier: PlanTier): string {
  const plan = PRICING_CONFIG[tier]
  if (!plan.showPrice) return 'תמחור מותאם'
  if (plan.monthlyPrice === 0) return 'חינם'
  return `₪${plan.monthlyPrice}`
}

export function getAnnualPrice(tier: PlanTier): string {
  const plan = PRICING_CONFIG[tier]
  if (!plan.showPrice) return 'תמחור מותאם'
  if (plan.annualPrice === 0) return 'חינם'
  return `₪${plan.annualPrice}`
}

export function getAnnualSavings(tier: PlanTier): string {
  const plan = PRICING_CONFIG[tier]
  if (plan.annualDiscount === 0) return ''
  return `חסכו ${plan.annualDiscount}%`
}

export function getPlanFeatures(tier: PlanTier): string[] {
  return PRICING_CONFIG[tier].features
}

export function getPlanLimitations(tier: PlanTier): string[] {
  return PRICING_CONFIG[tier].limitations
}
