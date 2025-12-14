'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Bell, Search, LogOut, User, Settings, ChevronDown, Menu, Sparkles, Building2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useDemoModeStore } from '@/stores/demoModeStore'
import Logo from '../Logo'
import MobileMenuSheet from './MobileMenuSheet'

interface AppHeaderProps {
  sidebarCollapsed: boolean
}

export default function AppHeader({ sidebarCollapsed }: AppHeaderProps) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const { isDemo } = useDemoModeStore()
  const [showDropdown, setShowDropdown] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
  }

  const isAgency = user?.accountType === 'agency'

  const HeaderContent = () => (
    <div className="h-full px-4 sm:px-6 flex items-center justify-between">
      {/* Mobile menu button */}
      <button
        onClick={() => setShowMobileMenu(true)}
        className="lg:hidden p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-colors"
      >
        <Menu size={24} />
      </button>

      {/* Mobile logo + Demo/Agency badge */}
      <div className="lg:hidden absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
        <Logo size="sm" />
        {isDemo && (
          <span className="px-2 py-0.5 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-xs font-semibold rounded-full flex items-center gap-1">
            <Sparkles size={10} />
            הדגמה
          </span>
        )}
        {isAgency && !isDemo && (
          <span className="px-2 py-0.5 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 text-xs font-semibold rounded-full flex items-center gap-1">
            <Building2 size={10} />
            סוכנות
          </span>
        )}
      </div>

      {/* Search (desktop) + Demo/Agency badge */}
      <div className="hidden lg:flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search
            size={18}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <input
            type="text"
            placeholder="חיפוש..."
            className="w-full pr-10 pl-4 py-2 bg-neutral-100 border-0 rounded-xl text-sm placeholder-neutral-400 outline-none focus:bg-neutral-200/70 transition-colors"
          />
        </div>
        {isDemo && (
          <span className="px-3 py-1.5 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-sm font-semibold rounded-full flex items-center gap-1.5 whitespace-nowrap">
            <Sparkles size={14} />
            מצב הדגמה
          </span>
        )}
        {isAgency && !isDemo && (
          <span className="px-3 py-1.5 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 text-sm font-semibold rounded-full flex items-center gap-1.5 whitespace-nowrap">
            <Building2 size={14} />
            חשבון סוכנות
          </span>
        )}
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Search button (mobile) */}
        <button className="lg:hidden p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-xl transition-colors">
          <Search size={20} />
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-xl transition-colors"
          >
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent-500 rounded-full" />
          </motion.button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute left-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-neutral-100 overflow-hidden z-50"
              >
                <div className="px-4 py-3 border-b border-neutral-100">
                  <h3 className="font-semibold text-neutral-900">התראות</h3>
                </div>
                <div className="p-4">
                  <div className="empty-state py-6">
                    <div className="empty-state-icon">
                      <Bell size={20} className="text-neutral-400" />
                    </div>
                    <p className="empty-state-title">אין התראות חדשות</p>
                    <p className="empty-state-description">נעדכן אותך כשיהיה משהו חדש</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User menu */}
        <div className="relative" ref={dropdownRef}>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 p-1.5 pr-3 hover:bg-neutral-100 rounded-xl transition-colors"
          >
            <div className="avatar avatar-sm">
              {user?.name ? getInitials(user.name) : 'U'}
            </div>
            <span className="hidden sm:block text-sm font-medium text-neutral-700 max-w-[100px] truncate">
              {user?.name || 'משתמש'}
            </span>
            <ChevronDown
              size={16}
              className={`text-neutral-400 transition-transform ${
                showDropdown ? 'rotate-180' : ''
              }`}
            />
          </motion.button>

          <AnimatePresence>
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-neutral-100 overflow-hidden z-50"
              >
                {/* User info */}
                <div className="px-4 py-3 border-b border-neutral-100">
                  <p className="font-medium text-neutral-900">{user?.name}</p>
                  <p className="text-sm text-neutral-500 truncate">{user?.email}</p>
                </div>

                {/* Menu items */}
                <div className="p-2">
                  <Link href="/settings" className="w-full flex items-center gap-3 px-3 py-2 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-colors">
                    <Settings size={18} />
                    הגדרות
                  </Link>
                </div>

                {/* Logout */}
                <div className="p-2 border-t border-neutral-100">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <LogOut size={18} />
                    התנתקות
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <header className="app-header">
        {/* Desktop header with sidebar offset */}
        <div
          className="hidden lg:block h-full transition-all duration-300"
          style={{ marginRight: sidebarCollapsed ? '72px' : '256px' }}
        >
          <HeaderContent />
        </div>

        {/* Mobile header - full width */}
        <div className="lg:hidden h-full">
          <HeaderContent />
        </div>
      </header>

      {/* Mobile Menu Sheet */}
      <MobileMenuSheet
        isOpen={showMobileMenu}
        onClose={() => setShowMobileMenu(false)}
      />
    </>
  )
}
