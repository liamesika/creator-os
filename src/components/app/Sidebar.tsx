'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  CalendarDays,
  CheckSquare,
  Target,
  Sparkles,
  Settings,
  ChevronRight,
  ChevronLeft,
  PanelLeftClose,
  PanelLeft,
  Building2,
  Users,
  TrendingUp,
} from 'lucide-react'
import Logo from '../Logo'
import { useAuth } from '@/context/AuthContext'

// Creator nav items
const creatorNavItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'דשבורד', color: 'accent' },
  { href: '/calendar', icon: CalendarDays, label: 'יומן', color: 'blue' },
  { href: '/companies', icon: Building2, label: 'חברות', color: 'violet' },
  { href: '/tasks', icon: CheckSquare, label: 'משימות', color: 'green' },
  { href: '/goals', icon: Target, label: 'מטרות', color: 'orange' },
  { href: '/ai', icon: Sparkles, label: 'תוכן AI', color: 'purple' },
]

// Agency nav items
const agencyNavItems = [
  { href: '/agency', icon: TrendingUp, label: 'דשבורד סוכנות', color: 'accent' },
  { href: '/agency/members', icon: Users, label: 'ניהול יוצרים', color: 'blue' },
]

const bottomNavItems = [
  { href: '/settings', icon: Settings, label: 'הגדרות', color: 'neutral' },
]

interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
}

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const { user } = useAuth()

  // Select nav items based on account type
  const isAgency = user?.accountType === 'agency'
  const navItems = isAgency ? agencyNavItems : creatorNavItems

  const getActiveColors = (color: string, isActive: boolean) => {
    if (!isActive) return ''
    const colors: Record<string, string> = {
      accent: 'bg-accent-50 text-accent-700 border-accent-200',
      blue: 'bg-blue-50 text-blue-700 border-blue-200',
      violet: 'bg-violet-50 text-violet-700 border-violet-200',
      green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      orange: 'bg-orange-50 text-orange-700 border-orange-200',
      purple: 'bg-violet-50 text-violet-700 border-violet-200',
      neutral: 'bg-neutral-100 text-neutral-800 border-neutral-200',
    }
    return colors[color] || colors.accent
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 72 : 256 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="sidebar hidden lg:flex flex-col bg-white/80 backdrop-blur-xl"
    >
      {/* Logo area */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-neutral-100/80">
        <AnimatePresence mode="wait">
          {!isCollapsed ? (
            <motion.div
              key="full-logo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Logo size="sm" />
            </motion.div>
          ) : (
            <motion.div
              key="icon-logo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mx-auto"
            >
              <Logo size="sm" showText={false} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto scrollbar-hide">
        {navItems.map((item, index) => {
          // For agency routes, check if current path starts with the nav item path
          const isActive = item.href === '/agency'
            ? pathname === '/agency' || pathname.startsWith('/agency/creators')
            : pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                whileHover={{ x: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  relative flex items-center gap-3 px-3 py-2.5 rounded-xl
                  transition-all duration-200 cursor-pointer
                  ${isCollapsed ? 'justify-center px-2' : ''}
                  ${isActive
                    ? getActiveColors(item.color, true)
                    : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100'
                  }
                `}
              >
                <item.icon
                  size={20}
                  className="flex-shrink-0"
                  strokeWidth={isActive ? 2 : 1.5}
                />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="font-medium text-sm whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Active indicator */}
                {isActive && !isCollapsed && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-current rounded-full"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.div>
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="py-4 px-3 border-t border-neutral-100/80 space-y-1.5">
        {bottomNavItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl
                  transition-all duration-200 cursor-pointer
                  ${isCollapsed ? 'justify-center px-2' : ''}
                  ${isActive
                    ? 'bg-neutral-100 text-neutral-800'
                    : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100'
                  }
                `}
              >
                <item.icon size={20} className="flex-shrink-0" strokeWidth={1.5} />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="font-medium text-sm whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          )
        })}

        {/* Toggle button */}
        <motion.button
          onClick={onToggle}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
            text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100
            transition-all duration-200
            ${isCollapsed ? 'justify-center' : ''}
          `}
        >
          {isCollapsed ? (
            <PanelLeft size={20} strokeWidth={1.5} />
          ) : (
            <>
              <PanelLeftClose size={20} strokeWidth={1.5} />
              <span className="text-sm">כיווץ</span>
            </>
          )}
        </motion.button>
      </div>
    </motion.aside>
  )
}
