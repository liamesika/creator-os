'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

type CardTier = 'primary' | 'secondary' | 'tertiary'

interface PremiumCardProps {
  children: ReactNode
  className?: string
  delay?: number
  interactive?: boolean
  onClick?: () => void
  tier?: CardTier
  glow?: 'none' | 'subtle' | 'accent'
}

// Card tier configurations for visual hierarchy
const tierStyles = {
  primary: {
    background: 'bg-gradient-to-br from-white via-white to-neutral-50/80',
    border: 'border border-neutral-200/60',
    shadow: 'shadow-[0_8px_32px_-8px_rgba(0,0,0,0.12),0_4px_16px_-4px_rgba(0,0,0,0.08)]',
    hoverShadow: '0 24px 48px -12px rgba(0, 0, 0, 0.15), 0 12px 24px -8px rgba(0, 0, 0, 0.1)',
    gradient: 'from-white via-transparent to-neutral-100/60',
  },
  secondary: {
    background: 'bg-white',
    border: 'border border-neutral-100/80',
    shadow: 'shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08),0_2px_8px_-2px_rgba(0,0,0,0.04)]',
    hoverShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.1), 0 8px 16px -8px rgba(0, 0, 0, 0.06)',
    gradient: 'from-white via-transparent to-neutral-50/50',
  },
  tertiary: {
    background: 'bg-neutral-50/50',
    border: 'border border-neutral-100/60',
    shadow: 'shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)]',
    hoverShadow: '0 8px 16px -4px rgba(0, 0, 0, 0.06), 0 4px 8px -2px rgba(0, 0, 0, 0.04)',
    gradient: 'from-white/80 via-transparent to-neutral-100/30',
  },
}

const glowStyles = {
  none: '',
  subtle: 'ring-1 ring-neutral-200/50',
  accent: 'ring-1 ring-accent-200/40 shadow-accent-500/5',
}

export default function PremiumCard({
  children,
  className = '',
  delay = 0,
  interactive = false,
  onClick,
  tier = 'secondary',
  glow = 'none',
}: PremiumCardProps) {
  const styles = tierStyles[tier]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={interactive ? {
        y: -4,
        boxShadow: styles.hoverShadow,
      } : undefined}
      onClick={onClick}
      className={`
        relative overflow-hidden
        ${styles.background} rounded-2xl
        ${styles.border}
        ${styles.shadow}
        ${glowStyles[glow]}
        transition-all duration-300 ease-out
        ${interactive ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {/* Gradient overlay for premium depth */}
      <div className={`absolute inset-0 bg-gradient-to-br ${styles.gradient} pointer-events-none`} />
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}
