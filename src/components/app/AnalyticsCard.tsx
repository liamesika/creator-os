'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

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
      bg: 'bg-accent-50',
      icon: 'text-accent-600',
      ring: 'stroke-accent-500',
      bar: 'bg-accent-500',
    },
    green: {
      bg: 'bg-emerald-50',
      icon: 'text-emerald-600',
      ring: 'stroke-emerald-500',
      bar: 'bg-emerald-500',
    },
    blue: {
      bg: 'bg-blue-50',
      icon: 'text-blue-600',
      ring: 'stroke-blue-500',
      bar: 'bg-blue-500',
    },
    orange: {
      bg: 'bg-orange-50',
      icon: 'text-orange-600',
      ring: 'stroke-orange-500',
      bar: 'bg-orange-500',
    },
    purple: {
      bg: 'bg-violet-50',
      icon: 'text-violet-600',
      ring: 'stroke-violet-500',
      bar: 'bg-violet-500',
    },
  }

  const classes = colorClasses[color]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      className="relative bg-white rounded-2xl border border-neutral-100/80 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06)] p-4 sm:p-5 hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.1)] transition-shadow duration-300"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Icon */}
          <div className={`inline-flex p-2.5 rounded-xl ${classes.bg} mb-3`}>
            <Icon size={18} className={classes.icon} strokeWidth={2} />
          </div>

          {/* Label */}
          <p className="text-xs font-medium text-neutral-500 mb-1 truncate">{label}</p>

          {/* Value */}
          <p className="text-2xl font-bold text-neutral-900 tracking-tight">{value}</p>

          {/* Subvalue or trend */}
          {(subValue || trend) && (
            <div className="flex items-center gap-2 mt-1.5">
              {subValue && (
                <span className="text-xs text-neutral-400">{subValue}</span>
              )}
              {trend && (
                <span
                  className={`text-xs font-medium ${
                    trend.positive ? 'text-emerald-600' : 'text-red-500'
                  }`}
                >
                  {trend.positive ? '+' : ''}{trend.value}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Chart visualization */}
        {chart && (
          <div className="flex-shrink-0">
            {chart === 'ring' && (
              <div className="relative w-14 h-14">
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
                    transition={{ duration: 1, delay: delay + 0.3, ease: 'easeOut' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-semibold text-neutral-700">{chartValue}%</span>
                </div>
              </div>
            )}

            {chart === 'bar' && (
              <div className="flex items-end gap-1 h-12">
                {[40, 65, 45, 80, 55, 70, chartValue].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ duration: 0.4, delay: delay + 0.1 * i }}
                    className={`w-1.5 rounded-full ${i === 6 ? classes.bar : 'bg-neutral-200'}`}
                  />
                ))}
              </div>
            )}

            {chart === 'sparkline' && (
              <div className="w-20 h-10">
                <svg className="w-full h-full" viewBox="0 0 80 40" preserveAspectRatio="none">
                  <motion.path
                    d="M0,30 Q10,25 20,28 T40,20 T60,25 T80,15"
                    fill="none"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className={classes.ring}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: delay + 0.2 }}
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
