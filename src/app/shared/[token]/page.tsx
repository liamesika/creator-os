'use client'

import { useEffect, useState, use } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3,
  CheckCircle2,
  Calendar,
  Target,
  Share2,
  AlertCircle,
} from 'lucide-react'
import type { SharedReportPayload } from '@/types/shared-reports'

interface SharedPageProps {
  params: Promise<{ token: string }>
}

export default function SharedReportPage({ params }: SharedPageProps) {
  const { token } = use(params)
  const [report, setReport] = useState<SharedReportPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchReport()
  }, [token])

  const fetchReport = async () => {
    try {
      const res = await fetch(`/api/review/monthly/shared/${token}`)
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'שגיאה בטעינת הדוח')
        return
      }

      setReport(data.report.payload)
    } catch (err) {
      setError('שגיאה בטעינת הדוח')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl animate-pulse">
            <BarChart3 size={28} className="text-white" />
          </div>
          <p className="mt-4 text-neutral-500">טוען דוח...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50 flex items-center justify-center p-4" dir="rtl">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto bg-red-100 rounded-2xl flex items-center justify-center mb-4">
            <AlertCircle size={28} className="text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-neutral-900 mb-2">{error}</h1>
          <p className="text-neutral-500">
            הקישור אינו תקף או שפג תוקפו.
          </p>
        </div>
      </div>
    )
  }

  if (!report) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-16 h-16 mx-auto bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mb-4">
              <BarChart3 size={28} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2">{report.title}</h1>
            <p className="text-violet-100">{report.ownerName}</p>
            {report.subtitle && (
              <p className="text-violet-200 text-sm mt-1">{report.subtitle}</p>
            )}
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-3 gap-4"
        >
          {report.stats?.tasksCompleted !== undefined && (
            <StatCard
              icon={CheckCircle2}
              label="משימות שהושלמו"
              value={report.stats.tasksCompleted}
              color="emerald"
            />
          )}
          {report.stats?.eventsCount !== undefined && (
            <StatCard
              icon={Calendar}
              label="אירועים"
              value={report.stats.eventsCount}
              color="violet"
            />
          )}
          {report.stats?.taskCompletionRate !== undefined && (
            <StatCard
              icon={Target}
              label="שיעור השלמה"
              value={`${report.stats.taskCompletionRate}%`}
              color="indigo"
            />
          )}
        </motion.div>

        {/* Highlights */}
        {report.highlights && report.highlights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg border border-neutral-100 p-6"
          >
            <h2 className="text-lg font-bold text-neutral-900 mb-4 text-center">
              הישגים מרכזיים
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {report.highlights.map((highlight, index) => (
                <div key={index} className="text-center">
                  <span className="text-2xl">{highlight.icon}</span>
                  <p className="text-xl font-bold text-neutral-900 mt-1">
                    {highlight.value}
                  </p>
                  <p className="text-xs text-neutral-500">{highlight.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Insights */}
        {report.insights && report.insights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg border border-neutral-100 p-6"
          >
            <h2 className="text-lg font-bold text-neutral-900 mb-4 text-center">
              תובנות
            </h2>
            <div className="space-y-3">
              {report.insights.map((insight, index) => (
                <div
                  key={index}
                  className="p-4 bg-neutral-50 rounded-xl text-center"
                >
                  <span className="text-2xl block mb-2">{insight.icon}</span>
                  <h3 className="font-semibold text-neutral-900">{insight.title}</h3>
                  <p className="text-sm text-neutral-600 mt-1">{insight.description}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center pt-8"
        >
          <p className="text-sm text-neutral-400">
            נוצר ב-Creators OS
          </p>
          <p className="text-xs text-neutral-300 mt-1">
            {new Date(report.generatedAt).toLocaleDateString('he-IL', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </motion.div>
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any
  label: string
  value: string | number
  color: 'emerald' | 'violet' | 'indigo'
}) {
  const colors = {
    emerald: { bg: 'bg-emerald-100', icon: 'text-emerald-500' },
    violet: { bg: 'bg-violet-100', icon: 'text-violet-500' },
    indigo: { bg: 'bg-indigo-100', icon: 'text-indigo-500' },
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-neutral-100 p-4 text-center">
      <div className={`w-10 h-10 mx-auto ${colors[color].bg} rounded-xl flex items-center justify-center mb-2`}>
        <Icon size={20} className={colors[color].icon} />
      </div>
      <p className="text-2xl font-bold text-neutral-900">{value}</p>
      <p className="text-xs text-neutral-500">{label}</p>
    </div>
  )
}
