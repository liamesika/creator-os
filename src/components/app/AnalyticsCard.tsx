'use client'

import { motion, useSpring, useTransform } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { useEffect } from 'react'

interface AnalyticsCardProps {
  icon: LucideIcon
  label: string
  value: string
  subValue?: string
  trend?: {
    value: string
    positive: boolean
  }
  color: 'accent' | 'green' | 'blue' | 'orange' | 'purple'
  delay?: number
  chart?: 'ring' | 'bar' | 'sparkline'
  chartValue?: number
}

export default function AnalyticsCard({
  icon: Icon,
  label,
  value,
  subValue,
  trend,
  color,
  delay = 0,
  chart,
  chartValue = 70,
}: AnalyticsCardProps) {
  const colorClasses = {
    accent: {
      bg: 'bg-gradient-to-br from-accent-100 to-accent-50',
      iconGlow: 'shadow-accent-200/50',
      icon: 'text-accent-600',
      ring: 'stroke-accent-500',
      ringGlow: 'drop-shadow-[0_0_4px_rgba(168,85,247,0.3)]',
      bar: 'bg-gradient-to-t from-accent-600 to-accent-400',
      barGlow: 'shadow-accent-400/30',
    },
    green: {
      bg: 'bg-gradient-to-br from-emerald-100 to-emerald-50',
      iconGlow: 'shadow-emerald-200/50',
      icon: 'text-emerald-600',
      ring: 'stroke-emerald-500',
      ringGlow: 'drop-shadow-[0_0_4px_rgba(16,185,129,0.3)]',
      bar: 'bg-gradient-to-t from-emerald-600 to-emerald-400',
      barGlow: 'shadow-emerald-400/30',
    },
    blue: {
      bg: 'bg-gradient-to-br from-blue-100 to-blue-50',
      iconGlow: 'shadow-blue-200/50',
      icon: 'text-blue-600',
      ring: 'stroke-blue-500',
      ringGlow: 'drop-shadow-[0_0_4px_rgba(59,130,246,0.3)]',
      bar: 'bg-gradient-to-t from-blue-600 to-blue-400',
      barGlow: 'shadow-blue-400/30',
    },
    orange: {
      bg: 'bg-gradient-to-br from-orange-100 to-orange-50',
      iconGlow: 'shadow-orange-200/50',
      icon: 'text-orange-600',
      ring: 'stroke-orange-500',
      ringGlow: 'drop-shadow-[0_0_4px_rgba(249,115,22,0.3)]',
      bar: 'bg-gradient-to-t from-orange-600 to-orange-400',
      barGlow: 'shadow-orange-400/30',
    },
    purple: {
      bg: 'bg-gradient-to-br from-violet-100 to-violet-50',
      iconGlow: 'shadow-violet-200/50',
      icon: 'text-violet-600',
      ring: 'stroke-violet-500',
      ringGlow: 'drop-shadow-[0_0_4px_rgba(139,92,246,0.3)]',
      bar: 'bg-gradient-to-t from-violet-600 to-violet-400',
      barGlow: 'shadow-violet-400/30',
    },
  }

  const classes = colorClasses[color]

  // Animated counter for numeric values
  const numericValue = parseFloat(value.replace(/[^0-9.-]/g, ''))
  const isNumeric = !isNaN(numericValue)
  const springValue = useSpring(0, { stiffness: 50, damping: 20 })
  const displayValue = useTransform(springValue, (val) => {
    if (value.includes('₪')) return `₪${Math.round(val).toLocaleString()}`
    if (value.includes('%')) return `${Math.round(val)}%`
    if (value.includes('/')) return value // Keep fractions as-is
    return Math.round(val).toString()
  })

  useEffect(() => {
    if (isNumeric) {
      const timer = setTimeout(() => {
        springValue.set(numericValue)
      }, (delay + 0.2) * 1000)
      return () => clearTimeout(timer)
    }
  }, [numericValue, isNumeric, springValue, delay])

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -2, boxShadow: '0 12px 28px -8px rgba(0,0,0,0.12)' }}
      className="relative bg-white rounded-2xl border border-neutral-100/80 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.08)] p-4 sm:p-5 transition-all duration-300"
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-transparent to-neutral-50/30 rounded-2xl pointer-events-none" />

      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Icon with enhanced styling */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: delay + 0.1, type: 'spring', stiffness: 200 }}
            className={`inline-flex p-2.5 rounded-xl ${classes.bg} mb-3 shadow-sm ${classes.iconGlow}`}
          >
            <Icon size={18} className={classes.icon} strokeWidth={2.5} />
          </motion.div>

          {/* Label */}
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1.5 truncate">{label}</p>

          {/* Value with animated counter */}
          <motion.p className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tighter">
            {isNumeric ? displayValue : value}
          </motion.p>

          {/* Subvalue or trend */}
          {(subValue || trend) && (
            <div className="flex items-center gap-2 mt-2">
              {subValue && (
                <span className="text-xs font-medium text-neutral-400">{subValue}</span>
              )}
              {trend && (
                <motion.span
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: delay + 0.4 }}
                  className={`inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-md ${
                    trend.positive
                      ? 'text-emerald-700 bg-emerald-50'
                      : 'text-red-600 bg-red-50'
                  }`}
                >
                  {trend.positive ? '↑' : '↓'} {trend.value}
                </motion.span>
              )}
            </div>
          )}
        </div>

        {/* Chart visualization with enhanced styling */}
        {chart && (
          <div className="flex-shrink-0">
            {chart === 'ring' && (
              <div className={`relative w-14 h-14 sm:w-16 sm:h-16 ${classes.ringGlow}`}>
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle
                    cx="18"
                    cy="18"
                    r="15"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="text-neutral-100"
                  />
                  <motion.circle
                    cx="18"
                    cy="18"
                    r="15"
                    fill="none"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className={classes.ring}
                    strokeDasharray={`${chartValue} 100`}
                    initial={{ strokeDasharray: '0 100' }}
                    animate={{ strokeDasharray: `${chartValue} 100` }}
                    transition={{ duration: 1.2, delay: delay + 0.3, ease: [0.16, 1, 0.3, 1] }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-neutral-800">{chartValue}%</span>
                </div>
              </div>
            )}

            {chart === 'bar' && (
              <div className="flex items-end gap-1 h-12 sm:h-14">
                {[40, 65, 45, 80, 55, 70, chartValue].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: `${h}%`, opacity: 1 }}
                    transition={{ duration: 0.5, delay: delay + 0.08 * i, ease: [0.16, 1, 0.3, 1] }}
                    className={`w-1.5 sm:w-2 rounded-full ${i === 6 ? `${classes.bar} ${classes.barGlow}` : 'bg-neutral-200'}`}
                  />
                ))}
              </div>
            )}

            {chart === 'sparkline' && (
              <div className="w-20 h-10 sm:w-24 sm:h-12">
                <svg className="w-full h-full" viewBox="0 0 80 40" preserveAspectRatio="none">
                  {/* Subtle fill under the line */}
                  <motion.path
                    d="M0,30 Q10,25 20,28 T40,20 T60,25 T80,15 L80,40 L0,40 Z"
                    fill="url(#sparklineGradient)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.15 }}
                    transition={{ duration: 0.8, delay: delay + 0.5 }}
                  />
                  <defs>
                    <linearGradient id="sparklineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="currentColor" className={classes.icon} />
                      <stop offset="100%" stopColor="transparent" />
                    </linearGradient>
                  </defs>
                  <motion.path
                    d="M0,30 Q10,25 20,28 T40,20 T60,25 T80,15"
                    fill="none"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    className={classes.ring}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.2, delay: delay + 0.2, ease: [0.16, 1, 0.3, 1] }}
                  />
                </svg>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}
