'use client'

import { motion } from 'framer-motion'
import { Settings, User, Bell, Palette, Shield, LogOut, Sparkles, RotateCcw, Link2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useDemoModeStore } from '@/stores/demoModeStore'

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const { isDemo, resetDemo, deactivateDemoMode } = useDemoModeStore()

  const handleLogout = async () => {
    await logout()
    router.replace('/login')
  }

  const handleResetDemo = () => {
    resetDemo()
  }

  const handleExitDemo = () => {
    deactivateDemoMode()
    router.push('/login')
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
  }

  const settingsGroups = [
    {
      title: 'חשבון',
      items: [
        { icon: User, label: 'פרטי חשבון', description: 'שם, אימייל, תמונה' },
        { icon: Shield, label: 'אבטחה', description: 'סיסמה, אימות דו-שלבי' },
      ],
    },
    {
      title: 'העדפות',
      items: [
        { icon: Bell, label: 'התראות', description: 'הגדרת התראות ותזכורות' },
        { icon: Palette, label: 'מראה', description: 'ערכת צבעים ועיצוב' },
        { icon: Link2, label: 'אינטגרציות', description: 'חיבור ללוחות שנה חיצוניים', href: '/settings/integrations' },
      ],
    },
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">הגדרות</h1>
        <p className="text-neutral-500">ניהול החשבון והעדפות המערכת</p>
      </motion.div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="dashboard-card mb-6"
      >
        <div className="flex items-center gap-4">
          <div className="avatar avatar-lg">
            {user?.name ? getInitials(user.name) : 'U'}
          </div>
          <div>
            <h2 className="font-semibold text-neutral-900">{user?.name}</h2>
            <p className="text-sm text-neutral-500">{user?.email}</p>
          </div>
          <button className="mr-auto btn-app-ghost">
            עריכה
          </button>
        </div>
      </motion.div>

      {/* Settings Groups */}
      {settingsGroups.map((group, groupIndex) => (
        <motion.div
          key={group.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 + groupIndex * 0.05 }}
          className="mb-6"
        >
          <h3 className="text-sm font-semibold text-neutral-500 mb-3 px-1">
            {group.title}
          </h3>
          <div className="dashboard-card p-0 overflow-hidden">
            {group.items.map((item, itemIndex) => {
              const itemContent = (
                <>
                  <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center">
                    <item.icon size={18} className="text-neutral-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-neutral-900">{item.label}</p>
                    <p className="text-sm text-neutral-500">{item.description}</p>
                  </div>
                  <svg
                    className="w-5 h-5 text-neutral-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </>
              )

              const className = `w-full flex items-center gap-4 p-4 text-right transition-colors ${
                itemIndex !== group.items.length - 1 ? 'border-b border-neutral-100' : ''
              }`

              if ((item as any).href) {
                return (
                  <Link
                    key={item.label}
                    href={(item as any).href}
                    className={className}
                  >
                    {itemContent}
                  </Link>
                )
              }

              return (
                <motion.button
                  key={item.label}
                  whileHover={{ backgroundColor: 'rgb(250, 250, 250)' }}
                  className={className}
                >
                  {itemContent}
                </motion.button>
              )
            })}
          </div>
        </motion.div>
      ))}

      {/* Demo Mode Controls */}
      {isDemo && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mb-6"
        >
          <h3 className="text-sm font-semibold text-neutral-500 mb-3 px-1">
            מצב הדגמה
          </h3>
          <div className="dashboard-card p-0 overflow-hidden">
            <motion.button
              onClick={handleResetDemo}
              whileHover={{ backgroundColor: 'rgb(250, 250, 250)' }}
              className="w-full flex items-center gap-4 p-4 text-right transition-colors border-b border-neutral-100"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <RotateCcw size={18} className="text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-neutral-900">איפוס נתוני הדגמה</p>
                <p className="text-sm text-neutral-500">החזרת כל הנתונים למצב ראשוני</p>
              </div>
            </motion.button>
            <motion.button
              onClick={handleExitDemo}
              whileHover={{ backgroundColor: 'rgb(250, 250, 250)' }}
              className="w-full flex items-center gap-4 p-4 text-right transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                <LogOut size={18} className="text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-neutral-900">יציאה ממצב הדגמה</p>
                <p className="text-sm text-neutral-500">מעבר למסך ההתחברות</p>
              </div>
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Logout */}
      {!isDemo && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 p-4 text-red-600 hover:bg-red-50 rounded-2xl transition-colors"
          >
            <LogOut size={18} />
            <span className="font-medium">התנתקות</span>
          </button>
        </motion.div>
      )}

      {/* Version */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center text-xs text-neutral-400 mt-8"
      >
        Creators OS v0.1.0 Beta
      </motion.p>
    </div>
  )
}
