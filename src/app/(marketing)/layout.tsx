import { ReactNode } from 'react'
import MarketingLayout from '@/components/marketing/MarketingLayout'

export default function MarketingRouteLayout({
  children,
}: {
  children: ReactNode
}) {
  return <MarketingLayout>{children}</MarketingLayout>
}
