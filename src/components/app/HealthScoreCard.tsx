'use client'

import { motion, useSpring, useTransform } from 'framer-motion'
import { Heart, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Sparkles } from 'lucide-react'
import { getScoreRingColor } from '@/lib/health/computeHealthScore'
import type { HealthStatus } from '@/types/premium'
import { useEffect } from 'react'

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
  const circumference = 2 * Math.PI * 42 // radius = 42 for thicker ring
  const strokeDashoffset = circumference - (score / 100) * circumference

  const trend = previousScore !== undefined ? score - previousScore : 0
  const trendPositive = trend <= 0 // Lower score is better

  // Animated counter for score
  const springValue = useSpring(0, { stiffness: 50, damping: 20 })
  const displayScore = useTransform(springValue, (val) => Math.round(val))

  useEffect(() => {
    const timer = setTimeout(() => {
      springValue.set(score)
    }, (delay + 0.4) * 1000)
    return () => clearTimeout(timer)
  }, [score, springValue, delay])

  const statusConfig = {
    calm: {
      icon: CheckCircle2,
      bgGradient: 'from-emerald-50 via-green-50/80 to-emerald-50/60',
      borderColor: 'border-emerald-200/60',
      ringBg: 'stroke-emerald-100',
      ringFg: 'stroke-emerald-500',
      ringGlow: 'drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]',
      textColor: 'text-emerald-600',
      badgeBg: 'bg-emerald-100/80',
      accentGlow: 'shadow-emerald-500/10',
    },
    busy: {
      icon: AlertTriangle,
      bgGradient: 'from-amber-50 via-yellow-50/80 to-amber-50/60',
      borderColor: 'border-amber-200/60',
      ringBg: 'stroke-amber-100',
      ringFg: 'stroke-amber-500',
      ringGlow: 'drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]',
      textColor: 'text-amber-600',
      badgeBg: 'bg-amber-100/80',
      accentGlow: 'shadow-amber-500/10',
    },
    overloaded: {
      icon: AlertTriangle,
      bgGradient: 'from-red-50 via-rose-50/80 to-red-50/60',
      borderColor: 'border-red-200/60',
      ringBg: 'stroke-red-100',
      ringFg: 'stroke-red-500',
      ringGlow: 'drop-shadow-[0_0_8px_rgba(239,68,68,0.3)]',
      textColor: 'text-red-600',
      badgeBg: 'bg-red-100/80',
      accentGlow: 'shadow-red-500/10',
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
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`relative overflow-hidden bg-gradient-to-br ${config.bgGradient} rounded-2xl border ${config.borderColor} shadow-[0_8px_32px_-8px_rgba(0,0,0,0.12),0_4px_16px_-4px_rgba(0,0,0,0.08)] ${config.accentGlow} p-6 sm:p-7`}
    >
      {/* Premium decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-transparent pointer-events-none" />
      <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br from-white/40 to-transparent blur-2xl pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-gradient-to-tr from-white/30 to-transparent blur-xl pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: delay + 0.2, type: 'spring', stiffness: 200, damping: 15 }}
              className={`w-10 h-10 rounded-xl ${config.badgeBg} flex items-center justify-center shadow-sm`}
            >
              <Heart size={18} className={config.textColor} strokeWidth={2.5} />
            </motion.div>
            <div>
              <h3 className="font-bold text-neutral-900 tracking-tight">מדד בריאות</h3>
              <p className="text-xs text-neutral-500 mt-0.5">סטטוס העומס שלך</p>
            </div>
          </div>

          {showTrend && previousScore !== undefined && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: delay + 0.4 }}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold ${
                trendPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
              }`}
            >
              {trendPositive ? <TrendingDown size={12} strokeWidth={2.5} /> : <TrendingUp size={12} strokeWidth={2.5} />}
              {Math.abs(trend)}
            </motion.div>
          )}
        </div>

        {/* Score Ring - Signature Element */}
        <div className="flex flex-col items-center mb-6">
          <div className={`relative w-36 h-36 sm:w-40 sm:h-40 ${config.ringGlow}`}>
            {/* Outer glow ring */}
            <div className={`absolute inset-0 rounded-full ${config.badgeBg} blur-md opacity-50`} />

            <svg className="w-full h-full -rotate-90 relative z-10" viewBox="0 0 100 100">
              {/* Background ring */}
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                strokeWidth="6"
                className={config.ringBg}
              />
              {/* Animated progress ring */}
              <motion.circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                strokeWidth="6"
                strokeLinecap="round"
                className={config.ringFg}
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.5, delay: delay + 0.3, ease: [0.16, 1, 0.3, 1] }}
              />
            </svg>

            {/* Center score display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
              <motion.span
                className={`text-4xl sm:text-5xl font-bold ${config.textColor} tracking-tighter`}
              >
                {displayScore}
              </motion.span>
              <span className="text-xs text-neutral-500 font-medium mt-1">מתוך 100</span>
            </div>
          </div>

          {/* Status Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: delay + 0.7, type: 'spring', stiffness: 200 }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full ${config.badgeBg} mt-5 shadow-sm`}
          >
            <StatusIcon size={16} className={config.textColor} strokeWidth={2.5} />
            <span className={`font-bold ${config.textColor}`}>{statusLabel}</span>
          </motion.div>
        </div>

        {/* Insights */}
        {insights.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.8 }}
            className="space-y-2"
          >
            {insights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: delay + 0.9 + index * 0.1 }}
                className="flex items-center gap-2.5 px-4 py-2.5 bg-white/70 backdrop-blur-sm rounded-xl text-center justify-center border border-white/50"
              >
                <Sparkles size={14} className={config.textColor} strokeWidth={2} />
                <span className="text-sm font-medium text-neutral-700">{insight}</span>
              </motion.div>
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
