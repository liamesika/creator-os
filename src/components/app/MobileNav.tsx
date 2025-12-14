'use client'

import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  CalendarDays,
  CheckSquare,
  Building2,
  TrendingUp,
  Users,
  ClipboardCheck,
  Sliders,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useAgencyDemoStore } from '@/stores/agencyDemoStore'

// Creator mobile nav items (5 key items for mobile - prioritized)
const creatorNavItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'דשבורד', color: 'accent' },
  { href: '/calendar', icon: CalendarDays, label: 'יומן', color: 'blue' },
  { href: '/companies', icon: Building2, label: 'חברות', color: 'violet' },
  { href: '/approvals', icon: ClipboardCheck, label: 'אישורים', color: 'emerald' },
  { href: '/tasks', icon: CheckSquare, label: 'משימות', color: 'green' },
]

// Agency mobile nav items
const agencyNavItems = [
  { href: '/agency', icon: TrendingUp, label: 'דשבורד', color: 'accent' },
  { href: '/agency/members', icon: Users, label: 'יוצרים', color: 'blue' },
  { href: '/agency/approvals', icon: ClipboardCheck, label: 'אישורים', color: 'emerald' },
  { href: '/agency/control', icon: Sliders, label: 'בקרה', color: 'violet' },
]

const colorClasses: Record<string, { active: string; dot: string }> = {
  accent: { active: 'text-accent-600', dot: 'bg-accent-500' },
  purple: { active: 'text-purple-600', dot: 'bg-purple-500' },
  blue: { active: 'text-blue-600', dot: 'bg-blue-500' },
  violet: { active: 'text-violet-600', dot: 'bg-violet-500' },
  green: { active: 'text-emerald-600', dot: 'bg-emerald-500' },
  emerald: { active: 'text-emerald-600', dot: 'bg-emerald-500' },
  orange: { active: 'text-orange-600', dot: 'bg-orange-500' },
}

export default function MobileNav() {
  const pathname = usePathname()
  const { user } = useAuth()
  const { isAgencyDemo } = useAgencyDemoStore()

  // Select nav items based on account type or agency demo mode
  const isAgency = user?.accountType === 'agency' || isAgencyDemo
  const navItems = isAgency ? agencyNavItems : creatorNavItems

  return (
    <nav className="mobile-nav lg:hidden backdrop-blur-xl bg-white/90 border-t border-neutral-100/80">
      <div className="flex items-center justify-around px-2">
        {navItems.map((item) => {
          // For agency routes, check if current path starts with the nav item path
          const isActive = item.href === '/agency'
            ? pathname === '/agency' || pathname.startsWith('/agency/creators')
            : pathname === item.href || pathname.startsWith(item.href + '/')
          const colors = colorClasses[item.color]

          return (
            <Link key={item.href} href={item.href} className="flex-1">
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={`
                  relative flex flex-col items-center justify-center py-2 px-1 rounded-xl
                  transition-colors duration-200
                  ${isActive ? colors.active : 'text-neutral-400'}
                `}
              >
                {/* Active background */}
                {isActive && (
                  <motion.div
                    layoutId="mobileActiveTab"
                    className="absolute inset-1 bg-neutral-100 rounded-xl"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}

                <div className="relative z-10">
                  <item.icon
                    size={22}
                    strokeWidth={isActive ? 2 : 1.5}
                    className="mb-0.5"
                  />
                </div>

                <span className={`
                  relative z-10 text-[10px] font-medium
                  ${isActive ? '' : 'text-neutral-500'}
                `}>
                  {item.label}
                </span>

                {/* Active dot indicator */}
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`absolute -top-0.5 w-1.5 h-1.5 ${colors.dot} rounded-full`}
                  />
                )}
              </motion.div>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
