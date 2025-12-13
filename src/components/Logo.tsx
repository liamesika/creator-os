'use client'

import { motion } from 'framer-motion'

interface LogoProps {
  className?: string
  showText?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function Logo({ className = '', showText = true, size = 'md' }: LogoProps) {
  const sizes = {
    sm: { icon: 28, text: 'text-lg' },
    md: { icon: 36, text: 'text-xl' },
    lg: { icon: 48, text: 'text-2xl' },
  }

  const { icon, text } = sizes[size]

  return (
    <motion.div
      className={`flex items-center gap-2.5 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Logo Mark - Abstract geometric shape representing flow/organization */}
      <div className="relative" style={{ width: icon, height: icon }}>
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Background gradient circle */}
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="50%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#4f46e5" />
            </linearGradient>
            <linearGradient id="logoGradient2" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4f46e5" />
              <stop offset="100%" stopColor="#818cf8" />
            </linearGradient>
          </defs>

          {/* Main shape - overlapping rounded squares creating depth */}
          <motion.rect
            x="8"
            y="8"
            width="24"
            height="24"
            rx="6"
            fill="url(#logoGradient)"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          />
          <motion.rect
            x="16"
            y="16"
            width="24"
            height="24"
            rx="6"
            fill="url(#logoGradient2)"
            opacity="0.85"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.85, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          />

          {/* Accent line - representing flow/connection */}
          <motion.path
            d="M18 28 L28 18"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          />
          <motion.circle
            cx="18"
            cy="28"
            r="2"
            fill="white"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          />
          <motion.circle
            cx="28"
            cy="18"
            r="2"
            fill="white"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6, duration: 0.3 }}
          />
        </svg>
      </div>

      {/* Logo Text */}
      {showText && (
        <motion.div
          className="flex flex-col leading-none"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <span className={`font-bold ${text} text-neutral-900 tracking-tight`}>
            Creators<span className="text-accent-600">OS</span>
          </span>
        </motion.div>
      )}
    </motion.div>
  )
}
