export type PlanType = 'free' | 'premium'
export type BillingInterval = 'monthly' | 'yearly'

export interface PlanFeatures {
  companies: number | 'unlimited'
  eventsPerMonth: number | 'unlimited'
  activeTasks: number | 'unlimited'
  aiGenerationsPerMonth: number | 'unlimited'
  prioritySupport: boolean
}

export interface PricingPlan {
  id: PlanType
  name: string
  price: {
    monthly: number
    yearly: number
  }
  features: PlanFeatures
  recommended?: boolean
}

export interface Subscription {
  id: string
  userId: string
  plan: PlanType
  interval: BillingInterval
  status: 'active' | 'canceled' | 'past_due'
  currentPeriodEnd: Date
  stripeSubscriptionId?: string
  stripeCustomerId?: string
  createdAt: Date
  updatedAt: Date
}

export const PRICING_PLANS: Record<PlanType, PricingPlan> = {
  free: {
    id: 'free',
    name: 'חינמי',
    price: {
      monthly: 0,
      yearly: 0,
    },
    features: {
      companies: 3,
      eventsPerMonth: 10,
      activeTasks: 20,
      aiGenerationsPerMonth: 10,
      prioritySupport: false,
    },
  },
  premium: {
    id: 'premium',
    name: 'פרימיום',
    price: {
      monthly: 49,
      yearly: 490, // ~41/month
    },
    features: {
      companies: 'unlimited',
      eventsPerMonth: 'unlimited',
      activeTasks: 'unlimited',
      aiGenerationsPerMonth: 'unlimited',
      prioritySupport: true,
    },
    recommended: true,
  },
}
