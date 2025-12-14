'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'

interface AnimatedCounterProps {
  value: number
  duration?: number
  className?: string
  formatFn?: (value: number) => string
}

export function AnimatedCounter({
  value,
  duration = 1,
  className = '',
  formatFn,
}: AnimatedCounterProps) {
  const spring = useSpring(0, {
    stiffness: 100,
    damping: 30,
    duration: duration * 1000,
  })

  const display = useTransform(spring, (current) => {
    const rounded = Math.round(current)
    return formatFn ? formatFn(rounded) : rounded.toString()
  })

  const [displayValue, setDisplayValue] = useState('0')

  useEffect(() => {
    spring.set(value)
  }, [spring, value])

  useEffect(() => {
    const unsubscribe = display.on('change', (latest) => {
      setDisplayValue(latest)
    })
    return unsubscribe
  }, [display])

  return (
    <span className={className}>
      {displayValue}
    </span>
  )
}

interface AnimatedPercentageProps {
  value: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  color?: 'emerald' | 'amber' | 'red' | 'violet'
}

export function AnimatedPercentage({
  value,
  size = 'md',
  showLabel = true,
  color = 'violet',
}: AnimatedPercentageProps) {
  const sizeStyles = {
    sm: { circle: 48, stroke: 4, text: 'text-sm' },
    md: { circle: 80, stroke: 6, text: 'text-lg' },
    lg: { circle: 120, stroke: 8, text: 'text-2xl' },
  }

  const colorStyles = {
    emerald: 'stroke-emerald-500',
    amber: 'stroke-amber-500',
    red: 'stroke-red-500',
    violet: 'stroke-violet-500',
  }

  const s = sizeStyles[size]
  const radius = (s.circle - s.stroke) / 2
  const circumference = 2 * Math.PI * radius
  const progress = Math.min(100, Math.max(0, value))
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={s.circle}
        height={s.circle}
        className="-rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={s.circle / 2}
          cy={s.circle / 2}
          r={radius}
          fill="none"
          strokeWidth={s.stroke}
          className="stroke-neutral-200"
        />
        {/* Progress circle */}
        <motion.circle
          cx={s.circle / 2}
          cy={s.circle / 2}
          r={radius}
          fill="none"
          strokeWidth={s.stroke}
          strokeLinecap="round"
          className={colorStyles[color]}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
          strokeDasharray={circumference}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <AnimatedCounter
            value={progress}
            className={`${s.text} font-bold text-neutral-900`}
            formatFn={(v) => `${v}%`}
          />
        </div>
      )}
    </div>
  )
}

export default AnimatedCounter
