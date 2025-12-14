'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'

interface AgencyCardProps {
  children: ReactNode
  className?: string
  delay?: number
  noPadding?: boolean
}

export function AgencyCard({
  children,
  className = '',
  delay = 0,
  noPadding = false,
}: AgencyCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={`
        relative overflow-hidden
        bg-white rounded-2xl
        border border-neutral-100/80
        shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08),0_2px_8px_-2px_rgba(0,0,0,0.04)]
        ${noPadding ? '' : 'p-5 sm:p-6'}
        ${className}
      `}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white via-transparent to-neutral-50/30 pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}

interface AgencyCardHeaderProps {
  icon: LucideIcon
  iconColor: string
  iconBgColor: string
  title: string
  subtitle?: string
  action?: ReactNode
}

export function AgencyCardHeader({
  icon: Icon,
  iconColor,
  iconBgColor,
  title,
  subtitle,
  action,
}: AgencyCardHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl ${iconBgColor} flex items-center justify-center`}>
          <Icon size={18} className={iconColor} strokeWidth={2} />
        </div>
        <div>
          <h2 className="font-semibold text-neutral-900">{title}</h2>
          {subtitle && <p className="text-xs text-neutral-400">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  )
}

interface AgencyRowProps {
  children: ReactNode
  index?: number
  onClick?: () => void
  href?: string
  className?: string
}

export function AgencyRow({
  children,
  index = 0,
  onClick,
  className = '',
}: AgencyRowProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index, duration: 0.3 }}
      onClick={onClick}
      className={`
        group
        bg-neutral-50/80 hover:bg-neutral-100/80
        rounded-xl p-4
        transition-all duration-200
        hover:shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08)]
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  )
}

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
    icon?: LucideIcon
  }
  variant?: 'default' | 'premium'
}

export function AgencyEmptyState({
  icon: Icon,
  title,
  description,
  action,
  variant = 'default',
}: EmptyStateProps) {
  const ActionIcon = action?.icon

  return (
    <div className="text-center py-12 px-6">
      <div className={`
        w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center
        ${variant === 'premium'
          ? 'bg-gradient-to-br from-accent-100 via-violet-100 to-purple-100'
          : 'bg-neutral-100'
        }
      `}>
        <Icon
          size={28}
          className={variant === 'premium' ? 'text-accent-600' : 'text-neutral-400'}
          strokeWidth={1.5}
        />
      </div>

      <h3 className="text-lg font-bold text-neutral-900 mb-2">
        {title}
      </h3>

      <p className="text-neutral-500 max-w-sm mx-auto mb-6 leading-relaxed">
        {description}
      </p>

      {action && (
        <motion.button
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={action.onClick}
          className={`
            inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold
            shadow-lg transition-all duration-200
            ${variant === 'premium'
              ? 'bg-gradient-to-r from-accent-600 to-violet-600 text-white shadow-accent-600/25 hover:shadow-accent-600/40'
              : 'bg-neutral-900 text-white shadow-neutral-900/20 hover:bg-neutral-800'
            }
          `}
        >
          {ActionIcon && <ActionIcon size={18} />}
          {action.label}
        </motion.button>
      )}
    </div>
  )
}

interface StatBadgeProps {
  value: string | number
  label: string
  color?: 'green' | 'blue' | 'purple' | 'orange' | 'neutral'
}

export function StatBadge({ value, label, color = 'neutral' }: StatBadgeProps) {
  const colorClasses = {
    green: 'text-emerald-600 bg-emerald-50',
    blue: 'text-blue-600 bg-blue-50',
    purple: 'text-violet-600 bg-violet-50',
    orange: 'text-orange-600 bg-orange-50',
    neutral: 'text-neutral-700 bg-neutral-100',
  }

  return (
    <div className="text-center">
      <p className="text-xs text-neutral-500 mb-0.5">{label}</p>
      <p className={`text-sm font-semibold ${colorClasses[color].split(' ')[0]}`}>
        {value}
      </p>
    </div>
  )
}
