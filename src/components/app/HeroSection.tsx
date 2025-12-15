'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface HeroSectionProps {
  // Main content
  eyebrow?: string
  title: string
  subtitle?: string
  // Visual options
  variant?: 'light' | 'dark' | 'gradient'
  color?: 'accent' | 'blue' | 'violet' | 'emerald' | 'amber'
  size?: 'default' | 'large' | 'compact'
  // Optional elements
  badge?: ReactNode
  stats?: Array<{ label: string; value: string; subValue?: string }>
  action?: ReactNode
  children?: ReactNode
  // Animation
  delay?: number
}

const colorConfigs = {
  accent: {
    gradient: 'from-accent-600 via-violet-600 to-purple-700',
    lightBg: 'from-accent-50/80 via-violet-50/50 to-white',
    textAccent: 'text-accent-600',
    decorative: 'from-accent-400/20 to-violet-400/10',
  },
  blue: {
    gradient: 'from-blue-600 via-indigo-600 to-violet-700',
    lightBg: 'from-blue-50/80 via-indigo-50/50 to-white',
    textAccent: 'text-blue-600',
    decorative: 'from-blue-400/20 to-indigo-400/10',
  },
  violet: {
    gradient: 'from-violet-600 via-purple-600 to-indigo-700',
    lightBg: 'from-violet-50/80 via-purple-50/50 to-white',
    textAccent: 'text-violet-600',
    decorative: 'from-violet-400/20 to-purple-400/10',
  },
  emerald: {
    gradient: 'from-emerald-600 via-teal-600 to-cyan-700',
    lightBg: 'from-emerald-50/80 via-teal-50/50 to-white',
    textAccent: 'text-emerald-600',
    decorative: 'from-emerald-400/20 to-teal-400/10',
  },
  amber: {
    gradient: 'from-amber-500 via-orange-500 to-red-600',
    lightBg: 'from-amber-50/80 via-orange-50/50 to-white',
    textAccent: 'text-amber-600',
    decorative: 'from-amber-400/20 to-orange-400/10',
  },
}

const sizeConfigs = {
  compact: {
    padding: 'py-8 sm:py-10',
    titleSize: 'text-2xl sm:text-3xl',
    subtitleSize: 'text-sm sm:text-base',
    gap: 'gap-2',
  },
  default: {
    padding: 'py-12 sm:py-16 lg:py-20',
    titleSize: 'text-3xl sm:text-4xl lg:text-5xl',
    subtitleSize: 'text-base sm:text-lg',
    gap: 'gap-3 sm:gap-4',
  },
  large: {
    padding: 'py-16 sm:py-20 lg:py-28',
    titleSize: 'text-4xl sm:text-5xl lg:text-6xl',
    subtitleSize: 'text-lg sm:text-xl',
    gap: 'gap-4 sm:gap-6',
  },
}

export default function HeroSection({
  eyebrow,
  title,
  subtitle,
  variant = 'light',
  color = 'accent',
  size = 'default',
  badge,
  stats,
  action,
  children,
  delay = 0,
}: HeroSectionProps) {
  const colorConfig = colorConfigs[color]
  const sizeConfig = sizeConfigs[size]

  const isDark = variant === 'dark' || variant === 'gradient'

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay }}
      className={`relative overflow-hidden ${sizeConfig.padding} -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 mb-8 sm:mb-12`}
    >
      {/* Background */}
      {variant === 'dark' && (
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900" />
      )}
      {variant === 'gradient' && (
        <div className={`absolute inset-0 bg-gradient-to-br ${colorConfig.gradient}`} />
      )}
      {variant === 'light' && (
        <div className={`absolute inset-0 bg-gradient-to-br ${colorConfig.lightBg}`} />
      )}

      {/* Abstract decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large blur circle - top right */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: delay + 0.2 }}
          className={`absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-br ${colorConfig.decorative} blur-3xl`}
        />
        {/* Medium blur circle - bottom left */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: delay + 0.4 }}
          className={`absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-gradient-to-tr ${colorConfig.decorative} blur-2xl`}
        />
        {/* Subtle grid overlay for dark variants */}
        {isDark && (
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px]" />
        )}
        {/* Light noise texture */}
        <div className={`absolute inset-0 ${isDark ? 'opacity-[0.02]' : 'opacity-[0.015]'} bg-[url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")]`} />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Badge */}
        {badge && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: delay + 0.1 }}
            className="mb-4 sm:mb-6"
          >
            {badge}
          </motion.div>
        )}

        {/* Eyebrow */}
        {eyebrow && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: delay + 0.15 }}
            className={`text-sm font-semibold tracking-wider uppercase mb-3 ${
              isDark ? 'text-white/60' : colorConfig.textAccent
            }`}
          >
            {eyebrow}
          </motion.p>
        )}

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: delay + 0.2, ease: [0.16, 1, 0.3, 1] }}
          className={`${sizeConfig.titleSize} font-bold tracking-tight leading-[1.1] ${
            isDark ? 'text-white' : 'text-neutral-900'
          }`}
        >
          {title}
        </motion.h1>

        {/* Subtitle */}
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: delay + 0.35 }}
            className={`${sizeConfig.subtitleSize} max-w-2xl mx-auto mt-4 sm:mt-6 leading-relaxed ${
              isDark ? 'text-white/70' : 'text-neutral-600'
            }`}
          >
            {subtitle}
          </motion.p>
        )}

        {/* Stats Row */}
        {stats && stats.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: delay + 0.45 }}
            className="flex items-center justify-center gap-6 sm:gap-12 mt-8 sm:mt-10"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: delay + 0.5 + index * 0.1 }}
                className="text-center"
              >
                <p className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${
                  isDark ? 'text-white' : 'text-neutral-900'
                }`}>
                  {stat.value}
                </p>
                <p className={`text-xs sm:text-sm font-medium mt-1 ${
                  isDark ? 'text-white/50' : 'text-neutral-500'
                }`}>
                  {stat.label}
                </p>
                {stat.subValue && (
                  <p className={`text-xs mt-0.5 ${
                    isDark ? 'text-white/40' : 'text-neutral-400'
                  }`}>
                    {stat.subValue}
                  </p>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Action */}
        {action && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: delay + 0.55 }}
            className="mt-8 sm:mt-10"
          >
            {action}
          </motion.div>
        )}

        {/* Children */}
        {children && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: delay + 0.6 }}
            className="mt-6 sm:mt-8"
          >
            {children}
          </motion.div>
        )}
      </div>
    </motion.section>
  )
}

// Compact hero badge component
export function HeroBadge({
  icon: Icon,
  text,
  variant = 'light',
}: {
  icon?: React.ComponentType<{ size?: number; className?: string }>
  text: string
  variant?: 'light' | 'dark'
}) {
  const isDark = variant === 'dark'

  return (
    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
      isDark
        ? 'bg-white/10 text-white/90 backdrop-blur-sm'
        : 'bg-neutral-900/5 text-neutral-700'
    }`}>
      {Icon && <Icon size={14} className={isDark ? 'text-white/70' : 'text-neutral-500'} />}
      {text}
    </span>
  )
}
