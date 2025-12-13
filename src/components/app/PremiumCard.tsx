'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface PremiumCardProps {
  children: ReactNode
  className?: string
  delay?: number
  interactive?: boolean
  onClick?: () => void
}

export default function PremiumCard({
  children,
  className = '',
  delay = 0,
  interactive = false,
  onClick,
}: PremiumCardProps) {
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
        boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.1), 0 8px 16px -8px rgba(0, 0, 0, 0.06)',
      } : undefined}
      onClick={onClick}
      className={`
        relative overflow-hidden
        bg-white rounded-2xl
        border border-neutral-100/80
        shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08),0_2px_8px_-2px_rgba(0,0,0,0.04)]
        transition-all duration-300 ease-out
        ${interactive ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {/* Subtle gradient overlay for premium feel */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-transparent to-neutral-50/50 pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}
