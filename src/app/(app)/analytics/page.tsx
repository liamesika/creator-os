'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, Eye, Mail, Sparkles, RefreshCw } from 'lucide-react'
import { getAnalyticsData, resetAnalytics } from '@/lib/analytics'
import type { AnalyticsData } from '@/lib/analytics'

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)

  const loadData = () => {
    const analytics = getAnalyticsData()
    setData(analytics)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleReset = () => {
    if (confirm('האם לאפס את כל נתוני האנליטיקס?')) {
      resetAnalytics()
      loadData()
    }
  }

  if (!data) return null

  const stats = [
    {
      label: 'הפעלות דמו',
      value: data.demoActivations,
      icon: Sparkles,
      color: 'purple',
    },
    {
      label: 'טפסי יצירת קשר',
      value: data.contactSubmissions,
      icon: Mail,
      color: 'blue',
    },
    {
      label: 'צפיות בתמחור',
      value: data.pricingViews,
      icon: Eye,
      color: 'green',
    },
    {
      label: 'צפיות בתמחור סוכנויות',
      value: data.agencyPricingViews,
      icon: BarChart3,
      color: 'orange',
    },
  ]

  const colorClasses = {
    purple: 'bg-purple-100 text-purple-600',
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-emerald-100 text-emerald-600',
    orange: 'bg-orange-100 text-orange-600',
  }

  return (
    <div className="h-screen flex flex-col bg-neutral-50" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-900">
              אנליטיקס (פנימי)
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              עדכון אחרון:{' '}
              {new Date(data.lastUpdated).toLocaleString('he-IL')}
            </p>
          </div>
          <button
            onClick={handleReset}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            title="איפוס נתונים"
          >
            <RefreshCw size={20} className="text-neutral-600" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="dashboard-card p-6"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${
                    colorClasses[stat.color as keyof typeof colorClasses]
                  } flex items-center justify-center mb-4`}
                >
                  <stat.icon size={24} />
                </div>
                <div className="text-3xl font-bold text-neutral-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-neutral-500">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 p-4 rounded-xl bg-blue-50 border border-blue-200"
          >
            <p className="text-sm text-blue-800">
              <strong>הערה:</strong> נתונים אלו נשמרים בזיכרון המקומי של הדפדפן.
              לניתוח מתקדם יותר, ניתן לשלב עם Supabase או Google Analytics.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
