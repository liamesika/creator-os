'use client'

import { motion } from 'framer-motion'
import { Heart, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Sparkles } from 'lucide-react'
import { getScoreRingColor } from '@/lib/health/computeHealthScore'
import type { HealthStatus } from '@/types/premium'

interface HealthScoreCardProps {
  score: number
  status: HealthStatus
  statusLabel: string
  insights: string[]
  delay?: number
  compact?: boolean
  showTrend?: boolean
  previousScore?: number
}

export default function HealthScoreCard({
  score,
  status,
  statusLabel,
  insights,
  delay = 0,
  compact = false,
  showTrend = false,
  previousScore,
}: HealthScoreCardProps) {
  const ringColor = getScoreRingColor(status)
  const circumference = 2 * Math.PI * 40 // radius = 40
  const strokeDashoffset = circumference - (score / 100) * circumference

  const trend = previousScore !== undefined ? score - previousScore : 0
  const trendPositive = trend <= 0 // Lower score is better

  const statusConfig = {
    calm: {
      icon: CheckCircle2,
      bgGradient: 'from-emerald-50 to-green-50',
      borderColor: 'border-emerald-200/50',
      ringBg: 'stroke-emerald-100',
      ringFg: 'stroke-emerald-500',
      textColor: 'text-emerald-600',
      badgeBg: 'bg-emerald-100',
    },
    busy: {
      icon: AlertTriangle,
      bgGradient: 'from-amber-50 to-yellow-50',
      borderColor: 'border-amber-200/50',
      ringBg: 'stroke-amber-100',
      ringFg: 'stroke-amber-500',
      textColor: 'text-amber-600',
      badgeBg: 'bg-amber-100',
    },
    overloaded: {
      icon: AlertTriangle,
      bgGradient: 'from-red-50 to-rose-50',
      borderColor: 'border-red-200/50',
      ringBg: 'stroke-red-100',
      ringFg: 'stroke-red-500',
      textColor: 'text-red-600',
      badgeBg: 'bg-red-100',
    },
  }

  const config = statusConfig[status]
  const StatusIcon = config.icon

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay, duration: 0.4 }}
        className={`flex items-center gap-3 px-3 py-2 rounded-xl ${config.badgeBg} ${config.borderColor} border`}
      >
        <div className="relative w-10 h-10">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              strokeWidth="8"
              className={config.ringBg}
            />
            <motion.circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              strokeWidth="8"
              strokeLinecap="round"
              className={config.ringFg}
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1, delay: delay + 0.2, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-xs font-bold ${config.textColor}`}>{score}</span>
          </div>
        </div>
        <div className="text-center">
          <p className={`text-xs font-semibold ${config.textColor}`}>{statusLabel}</p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`relative overflow-hidden bg-gradient-to-br ${config.bgGradient} rounded-2xl border ${config.borderColor} shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08)] p-6`}
    >
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg ${config.badgeBg} flex items-center justify-center`}>
              <Heart size={16} className={config.textColor} />
            </div>
            <h3 className="font-semibold text-neutral-900 text-center">מדד בריאות</h3>
          </div>

          {showTrend && previousScore !== undefined && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              trendPositive ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
            }`}>
              {trendPositive ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
              {Math.abs(trend)}
            </div>
          )}
        </div>

        {/* Score Ring */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative w-32 h-32">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                strokeWidth="8"
                className={config.ringBg}
              />
              <motion.circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                strokeWidth="8"
                strokeLinecap="round"
                className={config.ringFg}
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.2, delay: delay + 0.3, ease: 'easeOut' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: delay + 0.5, duration: 0.3 }}
                className={`text-3xl font-bold ${config.textColor}`}
              >
                {score}
              </motion.span>
              <span className="text-xs text-neutral-500">מתוך 100</span>
            </div>
          </div>

          {/* Status Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay + 0.6 }}
            className={`flex items-center gap-2 px-4 py-2 rounded-full ${config.badgeBg} mt-4`}
          >
            <StatusIcon size={16} className={config.textColor} />
            <span className={`font-semibold ${config.textColor}`}>{statusLabel}</span>
          </motion.div>
        </div>

        {/* Insights */}
        {insights.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.7 }}
            className="space-y-2"
          >
            {insights.map((insight, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-2 bg-white/60 rounded-xl text-center justify-center"
              >
                <Sparkles size={14} className={config.textColor} />
                <span className="text-sm text-neutral-700">{insight}</span>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

// Mini badge version for lists
interface HealthBadgeProps {
  score: number
  status: HealthStatus
  size?: 'sm' | 'md'
}

export function HealthBadge({ score, status, size = 'sm' }: HealthBadgeProps) {
  const config = {
    calm: { bg: 'bg-emerald-100', text: 'text-emerald-700', ring: 'ring-emerald-200' },
    busy: { bg: 'bg-amber-100', text: 'text-amber-700', ring: 'ring-amber-200' },
    overloaded: { bg: 'bg-red-100', text: 'text-red-700', ring: 'ring-red-200' },
  }[status]

  const sizeClasses = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm'

  return (
    <div
      className={`${sizeClasses} rounded-full ${config.bg} ${config.text} ring-1 ${config.ring} flex items-center justify-center font-bold`}
    >
      {score}
    </div>
  )
}
