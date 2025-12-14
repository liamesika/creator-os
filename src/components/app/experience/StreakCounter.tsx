'use client'

import { motion } from 'framer-motion'
import { Flame, Zap } from 'lucide-react'

interface StreakCounterProps {
  count: number
  label?: string
  variant?: 'default' | 'compact' | 'large'
  animate?: boolean
}

export function StreakCounter({
  count,
  label = 'רצף',
  variant = 'default',
  animate = true,
}: StreakCounterProps) {
  if (count <= 0) return null

  const getFlameColor = () => {
    if (count >= 30) return 'text-violet-500'
    if (count >= 14) return 'text-indigo-500'
    if (count >= 7) return 'text-amber-500'
    return 'text-orange-500'
  }

  const getBgColor = () => {
    if (count >= 30) return 'bg-violet-50'
    if (count >= 14) return 'bg-indigo-50'
    if (count >= 7) return 'bg-amber-50'
    return 'bg-orange-50'
  }

  const getSize = () => {
    switch (variant) {
      case 'compact':
        return { icon: 14, text: 'text-xs', padding: 'px-2 py-1' }
      case 'large':
        return { icon: 28, text: 'text-xl', padding: 'px-6 py-3' }
      default:
        return { icon: 18, text: 'text-sm', padding: 'px-3 py-1.5' }
    }
  }

  const size = getSize()

  const content = (
    <div
      className={`inline-flex items-center gap-1.5 ${size.padding} rounded-full ${getBgColor()} ${size.text} font-medium`}
    >
      <Flame size={size.icon} className={getFlameColor()} />
      <span className={getFlameColor()}>{count}</span>
      {variant !== 'compact' && (
        <span className="text-neutral-500">{label}</span>
      )}
    </div>
  )

  if (!animate) return content

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {content}
    </motion.div>
  )
}

interface MilestoneStreakProps {
  count: number
  milestone: number
  onMilestoneReached?: () => void
}

export function MilestoneStreak({ count, milestone, onMilestoneReached }: MilestoneStreakProps) {
  const progress = Math.min((count / milestone) * 100, 100)
  const isMilestoneReached = count >= milestone

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200/50"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <motion.div
            animate={isMilestoneReached ? {
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0],
            } : {}}
            transition={{ duration: 0.5, repeat: isMilestoneReached ? Infinity : 0, repeatDelay: 2 }}
          >
            <Flame size={24} className={isMilestoneReached ? 'text-violet-500' : 'text-orange-500'} />
          </motion.div>
          <span className="font-semibold text-neutral-900">
            {isMilestoneReached ? `רצף של ${milestone} ימים!` : `${count} / ${milestone} ימים`}
          </span>
        </div>
        {isMilestoneReached && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-1 px-2 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-medium"
          >
            <Zap size={12} />
            הישג!
          </motion.div>
        )}
      </div>

      <div className="h-2 bg-amber-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`h-full rounded-full ${
            isMilestoneReached
              ? 'bg-gradient-to-r from-violet-500 to-indigo-500'
              : 'bg-gradient-to-r from-orange-400 to-amber-500'
          }`}
        />
      </div>
    </motion.div>
  )
}

export default StreakCounter
