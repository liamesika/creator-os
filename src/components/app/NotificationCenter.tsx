'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Check, Trash2, Settings, ChevronLeft, X } from 'lucide-react'
import Link from 'next/link'
import { useNotificationStore } from '@/stores/notificationStore'
import { NOTIFICATION_CONFIG } from '@/types/notification'
import type { Notification } from '@/types/notification'

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getUnreadCount,
  } = useNotificationStore()

  const unreadCount = getUnreadCount()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'עכשיו'
    if (diffMins < 60) return `לפני ${diffMins} דק׳`
    if (diffHours < 24) return `לפני ${diffHours} שעות`
    if (diffDays < 7) return `לפני ${diffDays} ימים`
    return date.toLocaleDateString('he-IL')
  }

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id)
    if (notification.link) {
      setIsOpen(false)
    }
  }

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-xl transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-accent-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </motion.button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-neutral-100 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-neutral-100 flex items-center justify-between">
              <h3 className="font-bold text-neutral-900">התראות</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={markAllAsRead}
                    className="text-xs text-accent-600 hover:text-accent-700 font-medium"
                  >
                    סמן הכל כנקרא
                  </motion.button>
                )}
                <Link
                  href="/settings/notifications"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  <Settings size={16} />
                </Link>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 mx-auto bg-neutral-100 rounded-2xl flex items-center justify-center mb-4">
                    <Bell size={24} className="text-neutral-400" />
                  </div>
                  <p className="text-sm font-medium text-neutral-600">אין התראות חדשות</p>
                  <p className="text-xs text-neutral-400 mt-1">נעדכן אותך כשיהיה משהו חדש</p>
                </div>
              ) : (
                <div className="divide-y divide-neutral-100">
                  {notifications.map((notification, index) => {
                    const config = NOTIFICATION_CONFIG[notification.type]

                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className={`relative group ${!notification.isRead ? 'bg-accent-50/30' : ''}`}
                      >
                        {notification.link ? (
                          <Link
                            href={notification.link}
                            onClick={() => handleNotificationClick(notification)}
                            className="block p-4 hover:bg-neutral-50 transition-colors"
                          >
                            <NotificationContent
                              notification={notification}
                              config={config}
                              formatTimeAgo={formatTimeAgo}
                            />
                          </Link>
                        ) : (
                          <div
                            onClick={() => handleNotificationClick(notification)}
                            className="p-4 hover:bg-neutral-50 transition-colors cursor-pointer"
                          >
                            <NotificationContent
                              notification={notification}
                              config={config}
                              formatTimeAgo={formatTimeAgo}
                            />
                          </div>
                        )}

                        {/* Actions on hover */}
                        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                          {!notification.isRead && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                e.preventDefault()
                                markAsRead(notification.id)
                              }}
                              className="p-1.5 bg-white shadow-sm border border-neutral-100 rounded-lg text-neutral-400 hover:text-emerald-500 transition-colors"
                              title="סמן כנקרא"
                            >
                              <Check size={14} />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              e.preventDefault()
                              deleteNotification(notification.id)
                            }}
                            className="p-1.5 bg-white shadow-sm border border-neutral-100 rounded-lg text-neutral-400 hover:text-red-500 transition-colors"
                            title="מחק"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        {/* Unread indicator */}
                        {!notification.isRead && (
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-accent-500 rounded-full" />
                        )}
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-4 py-3 border-t border-neutral-100 bg-neutral-50/50">
                <Link
                  href="/activity"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-1 text-sm text-accent-600 hover:text-accent-700 font-medium"
                >
                  צפייה בכל הפעילות
                  <ChevronLeft size={16} />
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Notification content component
function NotificationContent({
  notification,
  config,
  formatTimeAgo,
}: {
  notification: Notification
  config: { icon: string; color: string; bgColor: string }
  formatTimeAgo: (date: string) => string
}) {
  return (
    <div className="flex items-start gap-3 pr-4">
      <div className={`w-10 h-10 rounded-xl ${config.bgColor} flex items-center justify-center text-lg flex-shrink-0`}>
        {config.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium text-neutral-900 ${!notification.isRead ? 'font-semibold' : ''}`}>
          {notification.title}
        </p>
        <p className="text-xs text-neutral-500 mt-0.5 line-clamp-2">
          {notification.message}
        </p>
        <p className="text-[10px] text-neutral-400 mt-1">
          {formatTimeAgo(notification.createdAt)}
        </p>
      </div>
    </div>
  )
}
