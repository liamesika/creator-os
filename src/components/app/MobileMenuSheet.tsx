'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import BottomSheet from '@/components/ui/BottomSheet'
import Logo from '@/components/Logo'
import {
  LayoutDashboard,
  Calendar,
  CheckSquare,
  Target,
  Building2,
  Sparkles,
  Settings,
  User,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface MobileMenuSheetProps {
  isOpen: boolean
  onClose: () => void
}

export default function MobileMenuSheet({
  isOpen,
  onClose,
}: MobileMenuSheetProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()

  const navItems = [
    { href: '/dashboard', label: 'דשבורד', icon: LayoutDashboard },
    { href: '/calendar', label: 'לוח שנה', icon: Calendar },
    { href: '/tasks', label: 'משימות', icon: CheckSquare },
    { href: '/goals', label: 'מטרות', icon: Target },
    { href: '/companies', label: 'חברות', icon: Building2 },
    { href: '/ai', label: 'AI', icon: Sparkles },
  ]

  const handleNavigate = (href: string) => {
    router.push(href)
    onClose()
  }

  const handleLogout = () => {
    logout()
    router.push('/login')
    onClose()
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} fullHeight>
      <div className="flex flex-col h-full">
        {/* Header with Logo */}
        <div className="p-6 border-b border-neutral-100">
          <Logo size="lg" />
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <div className="avatar avatar-lg">
              {user?.name ? getInitials(user.name) : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-neutral-900 truncate">{user?.name}</p>
              <p className="text-sm text-neutral-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <button
                key={item.href}
                onClick={() => handleNavigate(item.href)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-right transition-all',
                  isActive
                    ? 'bg-accent-50 text-accent-700 font-bold'
                    : 'text-neutral-700 hover:bg-neutral-100 font-medium'
                )}
              >
                <Icon
                  size={22}
                  className={isActive ? 'text-accent-600' : 'text-neutral-500'}
                />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-neutral-100 space-y-2">
          <button
            onClick={() => handleNavigate('/settings')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-700 hover:bg-neutral-100 transition-all text-right font-medium"
          >
            <Settings size={22} className="text-neutral-500" />
            <span>הגדרות</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all text-right font-medium"
          >
            <LogOut size={22} />
            <span>התנתקות</span>
          </button>
        </div>
      </div>
    </BottomSheet>
  )
}
