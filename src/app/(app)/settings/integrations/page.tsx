'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Calendar, Check, Copy, ExternalLink, Loader2 } from 'lucide-react'
import { useIntegrationsStore } from '@/stores/integrationsStore'
import { initiateGoogleOAuth } from '@/lib/integrations/google-calendar'
import { toast } from 'sonner'

export default function IntegrationsPage() {
  const searchParams = useSearchParams()
  const {
    googleConnected,
    appleConnected,
    appleFeedUrl,
    connectGoogle,
    disconnectGoogle,
    generateAppleFeed,
    disconnectApple,
    isLoading,
  } = useIntegrationsStore()

  const [showAppleFeed, setShowAppleFeed] = useState(false)

  // Handle OAuth callback
  useEffect(() => {
    const success = searchParams.get('success')
    const error = searchParams.get('error')
    const accessToken = searchParams.get('access_token')
    const refreshToken = searchParams.get('refresh_token')

    if (success === 'google_connected' && accessToken) {
      connectGoogle(accessToken, refreshToken || undefined)
      toast.success('Google Calendar מחובר בהצלחה')

      // Clean up URL
      window.history.replaceState({}, '', '/settings/integrations')
    }

    if (error) {
      const errorMessages: Record<string, string> = {
        oauth_failed: 'ההרשאה נכשלה',
        no_code: 'לא התקבל קוד הרשאה',
        config_error: 'שגיאת תצורה - נא לפנות לתמיכה',
        token_exchange_failed: 'החלפת הטוקן נכשלה',
        unexpected_error: 'שגיאה לא צפויה',
      }
      toast.error(errorMessages[error] || 'שגיאה בחיבור ל-Google Calendar')

      // Clean up URL
      window.history.replaceState({}, '', '/settings/integrations')
    }
  }, [searchParams, connectGoogle])

  const handleGoogleConnect = async () => {
    try {
      const authUrl = initiateGoogleOAuth()

      if (!authUrl) {
        // No client ID configured - use demo mode
        await connectGoogle('demo-access-token', 'demo-refresh-token')
        toast.success('Google Calendar מחובר בהצלחה (מצב הדגמה)')
        return
      }

      // Redirect to Google OAuth
      window.location.href = authUrl
    } catch (error) {
      toast.error('שגיאה בחיבור ל-Google Calendar')
    }
  }

  const handleGoogleDisconnect = async () => {
    if (confirm('האם לנתק את Google Calendar?')) {
      await disconnectGoogle()
      toast.success('Google Calendar נותק')
    }
  }

  const handleAppleGenerate = async () => {
    try {
      const url = await generateAppleFeed()
      setShowAppleFeed(true)
      toast.success('קישור הזנה נוצר בהצלחה')
    } catch (error) {
      toast.error('שגיאה ביצירת קישור הזנה')
    }
  }

  const handleAppleDisconnect = async () => {
    if (confirm('האם לנתק את Apple Calendar?')) {
      await disconnectApple()
      setShowAppleFeed(false)
      toast.success('Apple Calendar נותק')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('הקישור הועתק')
  }

  return (
    <div className="h-screen flex flex-col bg-neutral-50" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 px-4 sm:px-6 lg:px-8 py-4">
        <h1 className="text-xl sm:text-2xl font-bold text-neutral-900">
          אינטגרציות
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          חברו את Creators OS לכלים שאתם משתמשים בהם
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Google Calendar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="dashboard-card p-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center flex-shrink-0">
                <Calendar size={24} className="text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1">Google Calendar</h3>
                <p className="text-sm text-neutral-600 mb-4">
                  סנכרנו אירועים אוטומטית ל-Google Calendar
                </p>

                {googleConnected ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <Check size={16} />
                      <span className="font-medium">מחובר</span>
                    </div>
                    <button
                      onClick={handleGoogleDisconnect}
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      נתק
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleGoogleConnect}
                    disabled={isLoading}
                    className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>מתחבר...</span>
                      </>
                    ) : (
                      <span>חבר Google Calendar</span>
                    )}
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Apple Calendar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="dashboard-card p-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center flex-shrink-0">
                <Calendar size={24} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1">Apple Calendar</h3>
                <p className="text-sm text-neutral-600 mb-4">
                  הירשמו להזנת לוח שנה (ICS) לסנכרון אוטומטי
                </p>

                {appleConnected && appleFeedUrl ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <Check size={16} />
                      <span className="font-medium">הזנה פעילה</span>
                    </div>

                    {showAppleFeed && (
                      <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                        <p className="text-xs text-neutral-500 mb-2">
                          קישור ההזנה שלכם:
                        </p>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 text-xs bg-white px-2 py-1 rounded border border-neutral-200 overflow-x-auto">
                            {appleFeedUrl}
                          </code>
                          <button
                            onClick={() => copyToClipboard(appleFeedUrl)}
                            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                            title="העתק"
                          >
                            <Copy size={14} />
                          </button>
                        </div>
                        <p className="text-xs text-neutral-500 mt-2">
                          <a
                            href="https://support.apple.com/guide/calendar/subscribe-to-calendars-icl1022/mac"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                          >
                            איך להירשם להזנה ב-Apple Calendar
                            <ExternalLink size={12} />
                          </a>
                        </p>
                      </div>
                    )}

                    <button
                      onClick={handleAppleDisconnect}
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      נתק
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleAppleGenerate}
                    disabled={isLoading}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>יוצר הזנה...</span>
                      </>
                    ) : (
                      <span>צור קישור הזנה</span>
                    )}
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="p-4 rounded-xl bg-blue-50 border border-blue-200"
          >
            <p className="text-sm text-blue-800">
              <strong>שימו לב:</strong> אינטגרציות אלו מסנכרנות אירועים מ-Creators
              OS ללוחות השנה החיצוניים. שינויים שתבצעו בלוח החיצוני לא ישתקפו
              חזרה ב-Creators OS.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
