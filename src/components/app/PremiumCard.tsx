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
  glow?: 'none' | 'subtle' | 'accent' | 'emerald' | 'blue'
  noPadding?: boolean
}

// Card tier configurations for visual hierarchy - STRONG DIFFERENTIATION
const tierStyles = {
  primary: {
    // Primary: Maximum presence - feels important and elevated
    background: 'bg-gradient-to-br from-white via-white to-neutral-50/90',
    border: 'border border-neutral-200/70',
    shadow: 'shadow-[0_12px_40px_-8px_rgba(0,0,0,0.15),0_6px_20px_-6px_rgba(0,0,0,0.1),0_0_0_1px_rgba(0,0,0,0.02)]',
    hoverShadow: '0 28px 56px -14px rgba(0, 0, 0, 0.18), 0 16px 32px -8px rgba(0, 0, 0, 0.12)',
    gradient: 'from-white via-white/95 to-neutral-100/70',
    innerPadding: 'p-1', // Extra inner breathing room indicator
  },
  secondary: {
    // Secondary: Clear but quieter - supporting role
    background: 'bg-white',
    border: 'border border-neutral-100/80',
    shadow: 'shadow-[0_4px_16px_-4px_rgba(0,0,0,0.06),0_2px_6px_-2px_rgba(0,0,0,0.03)]',
    hoverShadow: '0 16px 32px -8px rgba(0, 0, 0, 0.08), 0 6px 12px -4px rgba(0, 0, 0, 0.05)',
    gradient: 'from-white via-transparent to-neutral-50/40',
    innerPadding: '',
  },
  tertiary: {
    // Tertiary: Minimal - background information
    background: 'bg-neutral-50/40',
    border: 'border border-neutral-100/50',
    shadow: 'shadow-[0_1px_3px_-1px_rgba(0,0,0,0.03)]',
    hoverShadow: '0 4px 8px -2px rgba(0, 0, 0, 0.04)',
    gradient: 'from-white/60 via-transparent to-neutral-100/20',
    innerPadding: '',
  },
}

const glowStyles = {
  none: '',
  subtle: 'ring-1 ring-neutral-200/40',
  accent: 'ring-1 ring-accent-300/50 shadow-[0_0_20px_-4px_rgba(168,85,247,0.15)]',
  emerald: 'ring-1 ring-emerald-300/50 shadow-[0_0_20px_-4px_rgba(16,185,129,0.15)]',
  blue: 'ring-1 ring-blue-300/50 shadow-[0_0_20px_-4px_rgba(59,130,246,0.15)]',
}

export default function PremiumCard({
  children,
  className = '',
  delay = 0,
  interactive = false,
  onClick,
  tier = 'secondary',
  glow = 'none',
  noPadding = false,
}: PremiumCardProps) {
  const styles = tierStyles[tier]
  const isPrimary = tier === 'primary'

  return (
    <motion.div
      initial={{ opacity: 0, y: isPrimary ? 24 : 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: isPrimary ? 0.6 : 0.5,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={interactive ? {
        y: -4,
        boxShadow: styles.hoverShadow,
      } : isPrimary ? {
        y: -2,
        boxShadow: styles.hoverShadow,
      } : undefined}
      onClick={onClick}
      className={`
        relative overflow-hidden
        ${styles.background}
        ${isPrimary ? 'rounded-[20px]' : 'rounded-2xl'}
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

      {/* Extra subtle top highlight for primary cards */}
      {isPrimary && (
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none" />
      )}

      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}
