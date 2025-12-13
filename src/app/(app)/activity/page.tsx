'use client'

import { useEffect } from 'react'
import { useActivityStore } from '@/stores/activityStore'
import { useAuth } from '@/context/AuthContext'
import { ACTIVITY_CONFIGS } from '@/types/activity'
import { formatRelativeTime, groupActivitiesByDay } from '@/lib/format-time'
import MobileNav from '@/components/app/MobileNav'
import Link from 'next/link'
import { Clock, Sparkles, ChevronRight } from 'lucide-react'

export default function ActivityPage() {
  const { user } = useAuth()
  const { events, isLoading, fetchEvents } = useActivityStore()

  useEffect(() => {
    if (user?.id) {
      fetchEvents()
    }
  }, [user?.id, fetchEvents])

  const groupedEvents = groupActivitiesByDay(events)

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-neutral-200">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900">
            <ChevronRight size={20} />
          </Link>
          <h1 className="text-lg font-bold text-neutral-900">פעילות</h1>
          <div className="w-6" />
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 pt-6 pb-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">היסטוריית פעילות</h1>
          <p className="text-neutral-600">כל הפעולות והשינויים שלך במערכת</p>
        </div>

        {/* Activity Timeline */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-neutral-400" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">אין פעילות עדיין</h3>
            <p className="text-neutral-600 mb-6">
              התחילי לעבוד במערכת וכל הפעולות שלך יופיעו כאן
            </p>
            <div className="flex flex-col gap-2 w-full max-w-xs">
              <Link
                href="/companies"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                הוסיפי חברה
              </Link>
              <Link
                href="/calendar"
                className="px-4 py-2 bg-neutral-200 text-neutral-900 rounded-lg hover:bg-neutral-300 transition-colors"
              >
                צרי אירוע
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {groupedEvents.map((group) => (
              <div key={group.label}>
                <h2 className="text-sm font-semibold text-neutral-500 mb-4 px-2">
                  {group.label}
                </h2>
                <div className="space-y-2">
                  {group.items.map((event) => {
                    const config = ACTIVITY_CONFIGS[event.type]
                    const link = config.getLink?.(event)

                    const ActivityContent = (
                      <div className="flex items-start gap-3 p-4 bg-white rounded-xl hover:shadow-sm transition-shadow">
                        <div className="text-2xl flex-shrink-0">{config.icon}</div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-neutral-900 mb-0.5">
                            {config.getTitle(event)}
                          </h3>
                          <p className="text-sm text-neutral-600 truncate">
                            {config.getDescription(event)}
                          </p>
                          <p className="text-xs text-neutral-400 mt-1">
                            {formatRelativeTime(event.createdAt)}
                          </p>
                        </div>
                      </div>
                    )

                    return link ? (
                      <Link key={event.id} href={link}>
                        {ActivityContent}
                      </Link>
                    ) : (
                      <div key={event.id}>{ActivityContent}</div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <MobileNav />
    </div>
  )
}
