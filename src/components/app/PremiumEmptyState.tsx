'use client'

import { motion } from 'framer-motion'
import { LucideIcon, Plus } from 'lucide-react'

interface PremiumEmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  color?: 'accent' | 'green' | 'blue' | 'orange' | 'purple'
}

export default function PremiumEmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  color = 'accent',
}: PremiumEmptyStateProps) {
  const colorClasses = {
    accent: {
      iconBg: 'bg-gradient-to-br from-accent-100 to-accent-50',
      icon: 'text-accent-500',
      button: 'bg-accent-600 hover:bg-accent-700 shadow-accent-500/20',
      shape: 'bg-accent-100',
    },
    green: {
      iconBg: 'bg-gradient-to-br from-emerald-100 to-emerald-50',
      icon: 'text-emerald-500',
      button: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20',
      shape: 'bg-emerald-100',
    },
    blue: {
      iconBg: 'bg-gradient-to-br from-blue-100 to-blue-50',
      icon: 'text-blue-500',
      button: 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20',
      shape: 'bg-blue-100',
    },
    orange: {
      iconBg: 'bg-gradient-to-br from-orange-100 to-orange-50',
      icon: 'text-orange-500',
      button: 'bg-orange-600 hover:bg-orange-700 shadow-orange-500/20',
      shape: 'bg-orange-100',
    },
    purple: {
      iconBg: 'bg-gradient-to-br from-violet-100 to-violet-50',
      icon: 'text-violet-500',
      button: 'bg-violet-600 hover:bg-violet-700 shadow-violet-500/20',
      shape: 'bg-violet-100',
    },
  }

  const classes = colorClasses[color]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="relative flex flex-col items-center justify-center py-10 px-6 text-center"
    >
      {/* Decorative shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-4 -right-4 w-24 h-24 ${classes.shape} rounded-full opacity-30 blur-xl`} />
        <div className={`absolute -bottom-4 -left-4 w-20 h-20 ${classes.shape} rounded-full opacity-20 blur-xl`} />
      </div>

      {/* Icon container */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className={`relative w-16 h-16 rounded-2xl ${classes.iconBg} flex items-center justify-center mb-5 shadow-sm`}
      >
        <Icon size={28} className={classes.icon} strokeWidth={1.5} />
      </motion.div>

      {/* Title */}
      <motion.h3
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="text-base font-semibold text-neutral-800 mb-1.5"
      >
        {title}
      </motion.h3>

      {/* Description */}
      {description && (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-sm text-neutral-500 max-w-[200px] leading-relaxed"
        >
          {description}
        </motion.p>
      )}

      {/* Action button */}
      {actionLabel && onAction && (
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onAction}
          className={`mt-5 inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white rounded-xl shadow-lg ${classes.button} transition-colors`}
        >
          <Plus size={16} strokeWidth={2.5} />
          {actionLabel}
        </motion.button>
      )}
    </motion.div>
  )
}
