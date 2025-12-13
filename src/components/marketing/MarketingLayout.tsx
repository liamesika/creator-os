'use client'

import { ReactNode } from 'react'
import MarketingHeader from './MarketingHeader'
import MarketingFooter from './MarketingFooter'

interface MarketingLayoutProps {
  children: ReactNode
}

export default function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <MarketingHeader />
      <main className="pt-16 sm:pt-20">
        {children}
      </main>
      <MarketingFooter />
    </div>
  )
}
