export type PlanTier = 'trial' | 'basic' | 'premium' | 'agency'

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
  trial: {
    id: 'trial',
    name: 'Trial',
    nameHebrew: 'ניסיון',
    description: '14 ימים חינם',
    monthlyPrice: 0,
    annualPrice: 0,
    annualDiscount: 0,
    currency: 'ILS',
    features: [
      'גישה מלאה לכל התכונות',
      '14 ימים ללא התחייבות',
      'ללא צורך בכרטיס אשראי',
    ],
    limitations: [
      'מוגבל ל-14 ימים',
    ],
    cta: 'התחילו ניסיון חינם',
    ctaLink: '/signup',
    popular: false,
    showPrice: true,
  },
  basic: {
    id: 'basic',
    name: 'Basic',
    nameHebrew: 'בסיסי',
    description: 'עבור יוצרים מתחילים',
    monthlyPrice: 39,
    annualPrice: 390, // ~17% discount
    annualDiscount: 17,
    currency: 'ILS',
    features: [
      'עד 5 לקוחות פעילים',
      'עד 20 אירועים בחודש',
      'עד 50 משימות',
      'מטרות יומיות',
      'ציר פעילות בסיסי',
      'תבניות לוח שנה בסיסיות',
    ],
    limitations: [
      'ללא יצירת תוכן AI',
      'ללא פורטל לקוחות',
      'ללא מעקב תוצרים',
    ],
    cta: 'התחילו Basic',
    ctaLink: 'https://wa.me/972587878676?text=היי%2C%20אשמח%20להצטרף%20לתוכנית%20Basic',
    popular: false,
    showPrice: true,
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    nameHebrew: 'פרימיום',
    description: 'עבור יוצרים מקצועיים',
    monthlyPrice: 99,
    annualPrice: 990, // ~17% discount
    annualDiscount: 17,
    currency: 'ILS',
    features: [
      'לקוחות ללא הגבלה',
      'אירועים ללא הגבלה',
      'משימות ללא הגבלה',
      'תבניות לוח שנה מתקדמות',
      'יצירת תוכן AI ללא הגבלה',
      'פורטל לקוחות לאישורים',
      'מעקב תוצרים חודשיים',
      'מרכז התראות מלא',
      'סקירה חודשית מפורטת',
      'תמיכה מועדפת',
    ],
    limitations: [],
    cta: 'התחילו Premium',
    ctaLink: 'https://wa.me/972587878676?text=היי%2C%20אשמח%20להצטרף%20לתוכנית%20Premium',
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
  if (tier === 'trial') return '14 ימים חינם'
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
