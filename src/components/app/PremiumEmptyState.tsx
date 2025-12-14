'use client'

import { motion } from 'framer-motion'
import { LucideIcon, Plus, Sparkles } from 'lucide-react'

interface PremiumEmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  subtitle?: string // New: Reassuring subtitle
  actionLabel?: string
  onAction?: () => void
  color?: 'accent' | 'green' | 'blue' | 'orange' | 'purple' | 'violet'
}

export default function PremiumEmptyState({
  icon: Icon,
  title,
  description,
  subtitle,
  actionLabel,
  onAction,
  color = 'accent',
}: PremiumEmptyStateProps) {
  const colorClasses = {
    accent: {
      iconBg: 'bg-gradient-to-br from-accent-100 via-accent-50 to-white',
      iconRing: 'ring-accent-200/50',
      icon: 'text-accent-600',
      button: 'bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-700 hover:to-accent-600 shadow-accent-500/25',
      shape: 'bg-accent-200',
      subtitleColor: 'text-accent-600/70',
    },
    green: {
      iconBg: 'bg-gradient-to-br from-emerald-100 via-emerald-50 to-white',
      iconRing: 'ring-emerald-200/50',
      icon: 'text-emerald-600',
      button: 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 shadow-emerald-500/25',
      shape: 'bg-emerald-200',
      subtitleColor: 'text-emerald-600/70',
    },
    blue: {
      iconBg: 'bg-gradient-to-br from-blue-100 via-blue-50 to-white',
      iconRing: 'ring-blue-200/50',
      icon: 'text-blue-600',
      button: 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-blue-500/25',
      shape: 'bg-blue-200',
      subtitleColor: 'text-blue-600/70',
    },
    orange: {
      iconBg: 'bg-gradient-to-br from-orange-100 via-orange-50 to-white',
      iconRing: 'ring-orange-200/50',
      icon: 'text-orange-600',
      button: 'bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 shadow-orange-500/25',
      shape: 'bg-orange-200',
      subtitleColor: 'text-orange-600/70',
    },
    purple: {
      iconBg: 'bg-gradient-to-br from-violet-100 via-violet-50 to-white',
      iconRing: 'ring-violet-200/50',
      icon: 'text-violet-600',
      button: 'bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600 shadow-violet-500/25',
      shape: 'bg-violet-200',
      subtitleColor: 'text-violet-600/70',
    },
    violet: {
      iconBg: 'bg-gradient-to-br from-violet-100 via-violet-50 to-white',
      iconRing: 'ring-violet-200/50',
      icon: 'text-violet-600',
      button: 'bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600 shadow-violet-500/25',
      shape: 'bg-violet-200',
      subtitleColor: 'text-violet-600/70',
    },
  }

  const classes = colorClasses[color]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex flex-col items-center justify-center py-12 px-8 text-center"
    >
      {/* Premium decorative shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.25, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className={`absolute -top-8 -right-8 w-32 h-32 ${classes.shape} rounded-full blur-2xl`}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.15, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className={`absolute -bottom-6 -left-6 w-24 h-24 ${classes.shape} rounded-full blur-2xl`}
        />
      </div>

      {/* Icon container with glow effect */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ delay: 0.1, duration: 0.5, type: 'spring', stiffness: 200, damping: 15 }}
        className={`relative w-20 h-20 rounded-2xl ${classes.iconBg} ring-1 ${classes.iconRing} flex items-center justify-center mb-6 shadow-lg`}
      >
        {/* Subtle inner glow */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/50 to-transparent" />
        <Icon size={32} className={`relative z-10 ${classes.icon}`} strokeWidth={1.5} />
      </motion.div>

      {/* Title */}
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-lg font-bold text-neutral-900 tracking-tight mb-2"
      >
        {title}
      </motion.h3>

      {/* Description */}
      {description && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="text-sm text-neutral-600 max-w-[240px] leading-relaxed"
        >
          {description}
        </motion.p>
      )}

      {/* Reassuring subtitle - intentional feel */}
      {subtitle && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className={`flex items-center gap-1.5 mt-3 text-xs font-medium ${classes.subtitleColor}`}
        >
          <Sparkles size={12} />
          <span>{subtitle}</span>
        </motion.div>
      )}

      {/* Action button with enhanced styling */}
      {actionLabel && onAction && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={onAction}
          className={`mt-6 inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white rounded-xl shadow-lg ${classes.button} transition-all duration-200`}
        >
          <Plus size={16} strokeWidth={2.5} />
          {actionLabel}
        </motion.button>
      )}
    </motion.div>
  )
}
