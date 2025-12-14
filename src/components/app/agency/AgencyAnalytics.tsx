'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Users, Building2, DollarSign } from 'lucide-react'
import { formatEarnings, getMonthName } from '@/types/agency'

interface EarningsTrendData {
  month: string
  total: number
}

interface CreatorComparisonData {
  name: string
  earnings: number
  color: string
}

interface CompanyDistributionData {
  name: string
  count: number
  percentage: number
}

interface EarningsTrendChartProps {
  data: EarningsTrendData[]
  delay?: number
}

export function EarningsTrendChart({ data, delay = 0 }: EarningsTrendChartProps) {
  if (!data || data.length === 0) return null

  const maxValue = Math.max(...data.map(d => d.total), 1)
  const reversedData = [...data].reverse().slice(0, 6)

  // Calculate trend
  const latestMonth = data[0]?.total || 0
  const previousMonth = data[1]?.total || 0
  const trendPercent = previousMonth > 0 ? ((latestMonth - previousMonth) / previousMonth) * 100 : 0
  const isPositive = trendPercent >= 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="bg-white rounded-2xl border border-neutral-100/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08)] p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-green-50 flex items-center justify-center">
            <TrendingUp size={18} className="text-emerald-600" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900">מגמת הכנסות</h3>
            <p className="text-xs text-neutral-400">6 חודשים אחרונים</p>
          </div>
        </div>

        {trendPercent !== 0 && (
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
            isPositive
              ? 'bg-emerald-50 text-emerald-600'
              : 'bg-red-50 text-red-600'
          }`}>
            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(trendPercent).toFixed(1)}%
          </div>
        )}
      </div>

      {/* Bar Chart */}
      <div className="flex items-end justify-between gap-2 h-32 mt-4">
        {reversedData.map((item, index) => {
          const height = (item.total / maxValue) * 100
          const isLatest = index === reversedData.length - 1

          return (
            <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
              <motion.div
                className="w-full flex flex-col items-center"
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(height, 5)}%` }}
                transition={{ delay: delay + 0.1 * index, duration: 0.5, ease: 'easeOut' }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: delay + 0.1 * index + 0.3 }}
                  className="text-[10px] font-medium text-neutral-600 mb-1 whitespace-nowrap"
                >
                  {formatEarnings(item.total)}
                </motion.div>
                <div
                  className={`w-full rounded-t-lg transition-colors ${
                    isLatest
                      ? 'bg-gradient-to-t from-emerald-500 to-emerald-400'
                      : 'bg-gradient-to-t from-neutral-200 to-neutral-100'
                  }`}
                  style={{ height: '100%', minHeight: '4px' }}
                />
              </motion.div>
              <span className="text-[10px] text-neutral-400">
                {getMonthName(new Date(item.month + '-01')).slice(0, 3)}
              </span>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}

interface CreatorComparisonChartProps {
  data: CreatorComparisonData[]
  delay?: number
}

export function CreatorComparisonChart({ data, delay = 0 }: CreatorComparisonChartProps) {
  if (!data || data.length === 0) return null

  const maxEarnings = Math.max(...data.map(d => d.earnings), 1)
  const sortedData = [...data].sort((a, b) => b.earnings - a.earnings).slice(0, 5)

  const colors = [
    { bg: 'bg-accent-500', light: 'bg-accent-100' },
    { bg: 'bg-violet-500', light: 'bg-violet-100' },
    { bg: 'bg-blue-500', light: 'bg-blue-100' },
    { bg: 'bg-emerald-500', light: 'bg-emerald-100' },
    { bg: 'bg-orange-500', light: 'bg-orange-100' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="bg-white rounded-2xl border border-neutral-100/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08)] p-5"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
          <Users size={18} className="text-blue-600" />
        </div>
        <div>
          <h3 className="font-semibold text-neutral-900">השוואת יוצרים</h3>
          <p className="text-xs text-neutral-400">לפי הכנסות חודשיות</p>
        </div>
      </div>

      <div className="space-y-3 mt-4">
        {sortedData.map((creator, index) => {
          const width = (creator.earnings / maxEarnings) * 100
          const color = colors[index % colors.length]

          return (
            <div key={creator.name} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-lg ${color.light} flex items-center justify-center`}>
                    <span className="text-[10px] font-bold text-neutral-700">
                      {creator.name.charAt(0)}
                    </span>
                  </div>
                  <span className="text-sm text-neutral-700 truncate max-w-24">{creator.name}</span>
                </div>
                <span className="text-sm font-semibold text-neutral-900">
                  {formatEarnings(creator.earnings)}
                </span>
              </div>
              <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${width}%` }}
                  transition={{ delay: delay + 0.1 * index, duration: 0.6, ease: 'easeOut' }}
                  className={`h-full ${color.bg} rounded-full`}
                />
              </div>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}

interface CompanyDistributionChartProps {
  data: CompanyDistributionData[]
  delay?: number
}

export function CompanyDistributionChart({ data, delay = 0 }: CompanyDistributionChartProps) {
  if (!data || data.length === 0) return null

  const total = data.reduce((sum, d) => sum + d.count, 0)
  const topCategories = [...data].sort((a, b) => b.count - a.count).slice(0, 4)

  const colors = [
    { segment: '#8b5cf6', text: 'text-violet-600', bg: 'bg-violet-100' },
    { segment: '#3b82f6', text: 'text-blue-600', bg: 'bg-blue-100' },
    { segment: '#10b981', text: 'text-emerald-600', bg: 'bg-emerald-100' },
    { segment: '#f59e0b', text: 'text-orange-600', bg: 'bg-orange-100' },
  ]

  // Calculate pie segments
  let cumulativePercent = 0
  const segments = topCategories.map((item, index) => {
    const percent = (item.count / total) * 100
    const segment = {
      ...item,
      percent,
      color: colors[index % colors.length],
      offset: cumulativePercent,
    }
    cumulativePercent += percent
    return segment
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="bg-white rounded-2xl border border-neutral-100/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08)] p-5"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-violet-50 flex items-center justify-center">
          <Building2 size={18} className="text-violet-600" />
        </div>
        <div>
          <h3 className="font-semibold text-neutral-900">התפלגות חברות</h3>
          <p className="text-xs text-neutral-400">לפי סוג פעילות</p>
        </div>
      </div>

      <div className="flex items-center gap-6 mt-4">
        {/* Pie Chart */}
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            {/* Background circle */}
            <circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              stroke="#f5f5f5"
              strokeWidth="3"
            />
            {/* Segments */}
            {segments.map((segment, index) => (
              <motion.circle
                key={segment.name}
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                stroke={segment.color.segment}
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${segment.percent} ${100 - segment.percent}`}
                strokeDashoffset={-segment.offset}
                initial={{ strokeDasharray: '0 100' }}
                animate={{ strokeDasharray: `${segment.percent} ${100 - segment.percent}` }}
                transition={{ delay: delay + 0.15 * index, duration: 0.6 }}
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <span className="text-lg font-bold text-neutral-900">{total}</span>
              <span className="block text-[10px] text-neutral-400">חברות</span>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2">
          {segments.map((segment) => (
            <div key={segment.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: segment.color.segment }}
                />
                <span className="text-xs text-neutral-600 truncate max-w-20">{segment.name}</span>
              </div>
              <span className="text-xs font-medium text-neutral-900">
                {segment.count} ({segment.percent.toFixed(0)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

interface QuickStatsProps {
  monthlyGrowth: number
  avgEarningsPerCreator: number
  topPerformer: string
  delay?: number
}

export function QuickStats({ monthlyGrowth, avgEarningsPerCreator, topPerformer, delay = 0 }: QuickStatsProps) {
  const isPositiveGrowth = monthlyGrowth >= 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="bg-gradient-to-br from-accent-600 to-violet-600 rounded-2xl p-5 text-white"
    >
      <h3 className="font-semibold mb-4">תובנות מהירות</h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-white/80 text-sm">צמיחה חודשית</span>
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
            isPositiveGrowth ? 'bg-white/20' : 'bg-red-500/30'
          }`}>
            {isPositiveGrowth ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {isPositiveGrowth ? '+' : ''}{monthlyGrowth.toFixed(1)}%
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-white/80 text-sm">ממוצע ליוצר</span>
          <span className="font-semibold">{formatEarnings(avgEarningsPerCreator)}</span>
        </div>

        {topPerformer && (
          <div className="flex items-center justify-between">
            <span className="text-white/80 text-sm">יוצר מוביל</span>
            <span className="font-semibold truncate max-w-24">{topPerformer}</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}
