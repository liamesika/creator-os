'use client'

import { motion } from 'framer-motion'
import { Lightbulb } from 'lucide-react'
import type { InsightDisplay, InsightSeverity } from '@/types/insights'
import { INSIGHT_SEVERITY_CONFIG } from '@/types/insights'

interface InsightsStripProps {
  insights: InsightDisplay[]
  loading?: boolean
  className?: string
  delay?: number
}

export function InsightsStrip({
  insights,
  loading = false,
  className = '',
  delay = 0,
}: InsightsStripProps) {
  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="flex-shrink-0 min-w-[280px] h-[72px] bg-neutral-100 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      </div>
    )
  }

  if (insights.length === 0) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={className}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-100 via-amber-50 to-white flex items-center justify-center shadow-[0_2px_6px_-2px_rgba(245,158,11,0.25)]">
          <Lightbulb size={14} className="text-amber-600 drop-shadow-sm" />
        </div>
        <h2 className="text-sm font-semibold text-neutral-600 tracking-tight">תובנות חכמות</h2>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide snap-x snap-mandatory">
        {insights.slice(0, 3).map((insight, index) => (
          <InsightCard
            key={insight.id}
            insight={insight}
            index={index}
            delay={delay + 0.1 + index * 0.08}
          />
        ))}
      </div>
    </motion.div>
  )
}

interface InsightCardProps {
  insight: InsightDisplay
  index: number
  delay: number
}

function InsightCard({ insight, index, delay }: InsightCardProps) {
  const config = INSIGHT_SEVERITY_CONFIG[insight.severity]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, x: -10 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      transition={{ delay, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={`
        flex-shrink-0 min-w-[280px] max-w-[320px] snap-start
        ${config.bgColor} ${config.borderColor} border
        rounded-2xl p-4 cursor-default
        shadow-sm hover:shadow-md transition-shadow
      `}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">{insight.icon}</span>
        <div className="min-w-0">
          <h4 className={`font-semibold text-sm ${config.color}`}>
            {insight.title}
          </h4>
          <p className="text-xs text-neutral-600 mt-0.5 line-clamp-2">
            {insight.message}
          </p>
          {insight.creatorName && (
            <span className="text-[10px] text-neutral-400 mt-1 block">
              {insight.creatorName}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// Compact version for smaller spaces
interface InsightsCompactProps {
  insights: InsightDisplay[]
  maxVisible?: number
  className?: string
}

export function InsightsCompact({
  insights,
  maxVisible = 2,
  className = ''
}: InsightsCompactProps) {
  if (insights.length === 0) return null

  const visibleInsights = insights.slice(0, maxVisible)
  const remaining = insights.length - maxVisible

  return (
    <div className={`space-y-2 ${className}`}>
      {visibleInsights.map((insight, index) => {
        const config = INSIGHT_SEVERITY_CONFIG[insight.severity]
        return (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-xl text-xs
              ${config.bgColor} ${config.borderColor} border
            `}
          >
            <span className="text-base">{insight.icon}</span>
            <span className={`font-medium ${config.color}`}>{insight.title}</span>
            <span className="text-neutral-500 truncate">– {insight.message}</span>
          </motion.div>
        )
      })}
      {remaining > 0 && (
        <p className="text-xs text-neutral-400 text-center">
          +{remaining} תובנות נוספות
        </p>
      )}
    </div>
  )
}

export default InsightsStrip
