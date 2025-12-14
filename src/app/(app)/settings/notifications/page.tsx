'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Bell,
  Mail,
  Clock,
  Globe,
  Sparkles,
  ChevronLeft,
  Save,
  CheckCircle2,
  Loader2,
  MessageSquare,
  Package,
  FileText,
  Target,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useNotificationStore } from '@/stores/notificationStore'
import type { NotificationPreferences } from '@/types/notification'

const TIMEZONES = [
  { value: 'Asia/Jerusalem', label: 'ישראל (GMT+2/+3)' },
  { value: 'Europe/London', label: 'לונדון (GMT+0/+1)' },
  { value: 'America/New_York', label: 'ניו יורק (GMT-5/-4)' },
  { value: 'America/Los_Angeles', label: 'לוס אנג׳לס (GMT-8/-7)' },
  { value: 'Europe/Paris', label: 'פריז (GMT+1/+2)' },
]

const EMAIL_TIMES = [
  { value: '06:00:00', label: '06:00' },
  { value: '07:00:00', label: '07:00' },
  { value: '07:30:00', label: '07:30' },
  { value: '08:00:00', label: '08:00' },
  { value: '08:30:00', label: '08:30' },
  { value: '09:00:00', label: '09:00' },
  { value: '09:30:00', label: '09:30' },
  { value: '10:00:00', label: '10:00' },
]

// In-app notification preference items
const IN_APP_NOTIFICATION_ITEMS: {
  key: keyof NotificationPreferences
  label: string
  description: string
  icon: typeof Bell
  color: string
  bgColor: string
}[] = [
  {
    key: 'approval_pending',
    label: 'אישורים ממתינים',
    description: 'כשלקוח מחכה לתוכן שלך',
    icon: MessageSquare,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
  },
  {
    key: 'approval_approved',
    label: 'אישורים שאושרו',
    description: 'כשלקוח מאשר תוכן',
    icon: CheckCircle2,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
  },
  {
    key: 'approval_changes',
    label: 'בקשות לשינויים',
    description: 'כשלקוח מבקש שינויים',
    icon: FileText,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
  },
  {
    key: 'deliverable_complete',
    label: 'תוצרים שהושלמו',
    description: 'כשתוצר מסומן כהושלם',
    icon: Package,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    key: 'contract_expiring',
    label: 'חוזים לפקיעה',
    description: 'חוזים שעומדים לפוג בקרוב',
    icon: Clock,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
  {
    key: 'task_due',
    label: 'משימות להיום',
    description: 'תזכורות למשימות',
    icon: CheckCircle2,
    color: 'text-violet-600',
    bgColor: 'bg-violet-100',
  },
  {
    key: 'goal_reminder',
    label: 'מטרות יומיות',
    description: 'תזכורות למטרות',
    icon: Target,
    color: 'text-accent-600',
    bgColor: 'bg-accent-100',
  },
  {
    key: 'agency_invite',
    label: 'הזמנות לסוכנות',
    description: 'הזמנות מסוכנויות',
    icon: Users,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
  },
]

interface NotificationSettings {
  dailyEmailEnabled: boolean
  dailyEmailTime: string
  timezone: string
  includeMotivation: boolean
  weeklySummaryEnabled: boolean
}

export default function NotificationSettingsPage() {
  const [settings, setSettings] = useState<NotificationSettings>({
    dailyEmailEnabled: true,
    dailyEmailTime: '08:30:00',
    timezone: 'Asia/Jerusalem',
    includeMotivation: true,
    weeklySummaryEnabled: true,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // In-app notifications from Zustand store
  const { preferences, updatePreferences } = useNotificationStore()

  // Fetch current settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/notifications/settings')
        if (response.ok) {
          const data = await response.json()
          if (data.settings) {
            setSettings(data.settings)
          }
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [])

  // Update setting
  const updateSetting = <K extends keyof NotificationSettings>(
    key: K,
    value: NotificationSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  // Save settings
  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/notifications/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        toast.success('ההגדרות נשמרו בהצלחה')
        setHasChanges(false)
      } else {
        toast.error('שגיאה בשמירת ההגדרות')
      }
    } catch (error) {
      toast.error('שגיאה בשמירת ההגדרות')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <Loader2 size={32} className="text-violet-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-violet-50" dir="rtl">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-neutral-200/50 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/settings" className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                <ChevronLeft size={20} className="text-neutral-500" />
              </Link>
              <div>
                <h1 className="font-bold text-neutral-900 flex items-center gap-2">
                  <Bell size={20} className="text-violet-600" />
                  הגדרות התראות
                </h1>
                <p className="text-sm text-neutral-500">ניהול התראות ומיילים יומיים</p>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                hasChanges
                  ? 'bg-violet-600 text-white hover:bg-violet-700'
                  : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
              }`}
            >
              {isSaving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              שמור
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* In-App Notifications Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-neutral-200/50 shadow-sm overflow-hidden"
        >
          <div className="p-6 border-b border-neutral-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent-100 flex items-center justify-center">
                <Bell size={20} className="text-accent-600" />
              </div>
              <div>
                <h2 className="font-semibold text-neutral-900">התראות באפליקציה</h2>
                <p className="text-sm text-neutral-500">בחר אילו התראות תקבל בתוך האפליקציה</p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-neutral-100">
            {IN_APP_NOTIFICATION_ITEMS.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.key}
                  className="p-4 flex items-center justify-between hover:bg-neutral-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg ${item.bgColor} flex items-center justify-center`}>
                      <Icon size={16} className={item.color} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-900">{item.label}</p>
                      <p className="text-xs text-neutral-500">{item.description}</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences[item.key]}
                      onChange={(e) => updatePreferences({ [item.key]: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-100 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent-600"></div>
                  </label>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Daily Digest Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-neutral-200/50 shadow-sm overflow-hidden"
        >
          <div className="p-6 border-b border-neutral-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                  <Mail size={20} className="text-violet-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-neutral-900">סיכום יומי במייל</h2>
                  <p className="text-sm text-neutral-500">קבל סיכום של המשימות והאירועים שלך כל בוקר</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.dailyEmailEnabled}
                  onChange={(e) => updateSetting('dailyEmailEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-100 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
              </label>
            </div>
          </div>

          {settings.dailyEmailEnabled && (
            <div className="p-6 space-y-4 bg-neutral-50/50">
              {/* Email time */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock size={18} className="text-neutral-400" />
                  <span className="text-neutral-700">שעת שליחה</span>
                </div>
                <select
                  value={settings.dailyEmailTime}
                  onChange={(e) => updateSetting('dailyEmailTime', e.target.value)}
                  className="px-3 py-2 border border-neutral-200 rounded-lg bg-white text-neutral-900 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                >
                  {EMAIL_TIMES.map(time => (
                    <option key={time.value} value={time.value}>{time.label}</option>
                  ))}
                </select>
              </div>

              {/* Timezone */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe size={18} className="text-neutral-400" />
                  <span className="text-neutral-700">אזור זמן</span>
                </div>
                <select
                  value={settings.timezone}
                  onChange={(e) => updateSetting('timezone', e.target.value)}
                  className="px-3 py-2 border border-neutral-200 rounded-lg bg-white text-neutral-900 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                >
                  {TIMEZONES.map(tz => (
                    <option key={tz.value} value={tz.value}>{tz.label}</option>
                  ))}
                </select>
              </div>

              {/* Include motivation */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sparkles size={18} className="text-neutral-400" />
                  <span className="text-neutral-700">הוסף משפט מוטיבציה</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.includeMotivation}
                    onChange={(e) => updateSetting('includeMotivation', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-100 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                </label>
              </div>
            </div>
          )}
        </motion.div>

        {/* Weekly Summary Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-neutral-200/50 shadow-sm p-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                <CheckCircle2 size={20} className="text-indigo-600" />
              </div>
              <div>
                <h2 className="font-semibold text-neutral-900">סיכום שבועי</h2>
                <p className="text-sm text-neutral-500">קבל סיכום של השבוע שחלף כל יום ראשון</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.weeklySummaryEnabled}
                onChange={(e) => updateSetting('weeklySummaryEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-100 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </motion.div>

        {/* Preview section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-violet-500 to-indigo-500 rounded-2xl p-6 text-white text-center"
        >
          <Mail size={32} className="mx-auto mb-3 opacity-90" />
          <h3 className="font-semibold text-lg mb-2">המייל היומי שלך</h3>
          <p className="text-white/80 text-sm mb-4">
            כל בוקר תקבל סיכום אישי עם מדד הבריאות שלך, האירועים והמשימות ליום
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full text-sm">
            <Clock size={14} />
            {settings.dailyEmailEnabled
              ? `נשלח כל יום ב-${EMAIL_TIMES.find(t => t.value === settings.dailyEmailTime)?.label || '08:30'}`
              : 'מושבת כרגע'}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
