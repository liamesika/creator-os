'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface PulseButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'success' | 'warning'
  size?: 'sm' | 'md' | 'lg'
  pulse?: boolean
  disabled?: boolean
  className?: string
}

export function PulseButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  pulse = true,
  disabled = false,
  className = '',
}: PulseButtonProps) {
  const variantStyles = {
    primary: {
      bg: 'bg-gradient-to-r from-violet-600 to-indigo-600',
      shadow: 'shadow-violet-500/25 hover:shadow-violet-500/40',
      pulse: 'bg-violet-500',
    },
    success: {
      bg: 'bg-gradient-to-r from-emerald-500 to-green-500',
      shadow: 'shadow-emerald-500/25 hover:shadow-emerald-500/40',
      pulse: 'bg-emerald-500',
    },
    warning: {
      bg: 'bg-gradient-to-r from-amber-500 to-orange-500',
      shadow: 'shadow-amber-500/25 hover:shadow-amber-500/40',
      pulse: 'bg-amber-500',
    },
  }

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }

  const styles = variantStyles[variant]

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`
        relative
        ${styles.bg}
        ${sizeStyles[size]}
        text-white font-semibold rounded-xl
        shadow-lg ${styles.shadow}
        transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {/* Pulse effect */}
      {pulse && !disabled && (
        <motion.span
          className={`absolute inset-0 rounded-xl ${styles.pulse}`}
          initial={{ opacity: 0.5, scale: 1 }}
          animate={{ opacity: 0, scale: 1.2 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatDelay: 0.5,
          }}
        />
      )}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </motion.button>
  )
}

export default PulseButton
