/**
 * Simple Analytics Tracking
 *
 * Tracks key events for founder visibility:
 * - Demo activations
 * - Contact form submissions
 * - Pricing page views
 *
 * Stored in localStorage for now (can be migrated to Supabase later)
 */

export type AnalyticsEvent =
  | 'demo_activated'
  | 'agency_demo_activated'
  | 'contact_submitted'
  | 'pricing_viewed'
  | 'pricing_agencies_viewed'

export interface AnalyticsData {
  demoActivations: number
  agencyDemoActivations: number
  contactSubmissions: number
  pricingViews: number
  agencyPricingViews: number
  lastUpdated: string
}

const STORAGE_KEY = 'creators-os-analytics'

function getAnalytics(): AnalyticsData {
  if (typeof window === 'undefined') {
    return {
      demoActivations: 0,
      agencyDemoActivations: 0,
      contactSubmissions: 0,
      pricingViews: 0,
      agencyPricingViews: 0,
      lastUpdated: new Date().toISOString(),
    }
  }

  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) {
    return {
      demoActivations: 0,
      agencyDemoActivations: 0,
      contactSubmissions: 0,
      pricingViews: 0,
      agencyPricingViews: 0,
      lastUpdated: new Date().toISOString(),
    }
  }

  return JSON.parse(stored)
}

function saveAnalytics(data: AnalyticsData) {
  if (typeof window === 'undefined') return

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function trackEvent(event: AnalyticsEvent) {
  const data = getAnalytics()

  switch (event) {
    case 'demo_activated':
      data.demoActivations++
      console.log('📊 Analytics: Demo activated')
      break
    case 'agency_demo_activated':
      data.agencyDemoActivations++
      console.log('📊 Analytics: Agency demo activated')
      break
    case 'contact_submitted':
      data.contactSubmissions++
      console.log('📊 Analytics: Contact form submitted')
      break
    case 'pricing_viewed':
      data.pricingViews++
      console.log('📊 Analytics: Pricing page viewed')
      break
    case 'pricing_agencies_viewed':
      data.agencyPricingViews++
      console.log('📊 Analytics: Agency pricing viewed')
      break
  }

  data.lastUpdated = new Date().toISOString()
  saveAnalytics(data)
}

export function getAnalyticsData(): AnalyticsData {
  return getAnalytics()
}

export function resetAnalytics() {
  if (typeof window === 'undefined') return

  const data: AnalyticsData = {
    demoActivations: 0,
    agencyDemoActivations: 0,
    contactSubmissions: 0,
    pricingViews: 0,
    agencyPricingViews: 0,
    lastUpdated: new Date().toISOString(),
  }
  saveAnalytics(data)
  console.log('📊 Analytics: Reset')
}

// Dev-only: View analytics via console
if (typeof window !== 'undefined') {
  ;(window as any).__viewAnalytics = () => {
    const data = getAnalyticsData()
    console.table(data)
    return data
  }
  ;(window as any).__resetAnalytics = resetAnalytics
}
