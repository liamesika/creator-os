'use client'

import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Flame,
  Sparkles,
  ListTodo,
  CalendarClock,
  Building2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Zap,
  GripVertical,
  ArrowLeftRight,
  Check,
} from 'lucide-react'
import { useTasksStore } from '@/stores/tasksStore'
import { useCalendarStore } from '@/stores/calendarStore'
import { useCompaniesStore } from '@/stores/companiesStore'
import { useHealthScore } from '@/hooks/useHealthScore'
import { useInsights } from '@/hooks/useInsights'
import { HealthBadge } from '@/components/app/HealthScoreCard'
import { InsightsStrip } from '@/components/app/insights/InsightsStrip'
import { showSuccessToast } from '@/components/app/experience/MotivationalToast'
import Link from 'next/link'
import type { DayLoad, SmartWeekData } from '@/types/premium'

const DAYS_HEBREW = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']
const MONTHS_HEBREW = [
  'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
]

// Day load thresholds
const LOAD_THRESHOLDS = {
  light: 3, // 0-3 items
  moderate: 6, // 4-6 items
  heavy: Infinity, // 7+ items
}

function getLoadStatus(load: number): 'light' | 'moderate' | 'heavy' {
  if (load <= LOAD_THRESHOLDS.light) return 'light'
  if (load <= LOAD_THRESHOLDS.moderate) return 'moderate'
  return 'heavy'
}

function getLoadColors(status: 'light' | 'moderate' | 'heavy') {
  switch (status) {
    case 'light':
      return {
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        text: 'text-emerald-700',
        ring: 'ring-emerald-500/20',
        dot: 'bg-emerald-500',
      }
    case 'moderate':
      return {
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        text: 'text-amber-700',
        ring: 'ring-amber-500/20',
        dot: 'bg-amber-500',
      }
    case 'heavy':
      return {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-700',
        ring: 'ring-red-500/20',
        dot: 'bg-red-500',
      }
  }
}

// Draggable item type
interface DraggableItem {
  id: string
  type: 'event' | 'task'
  title: string
  time?: string
  companyName?: string
  priority?: 'low' | 'medium' | 'high'
}

export default function SmartWeekPage() {
  const [weekOffset, setWeekOffset] = useState(0)
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null)
  const [isRebalanceMode, setIsRebalanceMode] = useState(false)
  const [draggedItem, setDraggedItem] = useState<DraggableItem | null>(null)
  const [dragSourceDayIndex, setDragSourceDayIndex] = useState<number | null>(null)
  const [dropTargetDayIndex, setDropTargetDayIndex] = useState<number | null>(null)

  const { tasks, updateTask } = useTasksStore()
  const { events, updateEvent } = useCalendarStore()
  const { companies } = useCompaniesStore()
  const { health } = useHealthScore()
  const { insights } = useInsights({ scope: 'creator' })

  // Calculate week dates
  const getWeekDates = (offset: number) => {
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay() + offset * 7)
    startOfWeek.setHours(0, 0, 0, 0)

    const dates: Date[] = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      dates.push(date)
    }
    return dates
  }

  const weekDates = getWeekDates(weekOffset)

  // Helper to get company name
  const getCompanyName = (companyId?: string | null) => {
    if (!companyId) return undefined
    return companies.find(c => c.id === companyId)?.name
  }

  // Build smart week data
  const smartWeekData = useMemo((): SmartWeekData => {
    const days: DayLoad[] = weekDates.map(date => {
      const dateStr = date.toISOString().split('T')[0]

      // Get events for this day
      const dayEvents = events
        .filter(e => {
          const eventDate = new Date(e.date)
          eventDate.setHours(0, 0, 0, 0)
          return eventDate.getTime() === date.getTime()
        })
        .map(e => ({
          id: e.id,
          title: e.title,
          startTime: e.startTime || '',
          endTime: e.endTime,
          companyId: e.companyId || undefined,
          companyName: getCompanyName(e.companyId),
          category: e.category,
        }))
        .sort((a, b) => a.startTime.localeCompare(b.startTime))

      // Get tasks for this day
      const dayTasks = tasks
        .filter(t => {
          if (t.archived || t.status === 'DONE') return false
          if (!t.dueDate) return false
          const dueDate = new Date(t.dueDate)
          dueDate.setHours(0, 0, 0, 0)
          return dueDate.getTime() === date.getTime()
        })
        .map(t => ({
          id: t.id,
          title: t.title,
          dueDate: t.dueDate?.toISOString(),
          companyId: t.companyId || undefined,
          companyName: getCompanyName(t.companyId),
          priority: t.priority.toLowerCase() as 'low' | 'medium' | 'high',
          status: t.status,
        }))

      // Get top companies for this day
      const companyIds = [
        ...dayEvents.filter(e => e.companyId).map(e => e.companyId!),
        ...dayTasks.filter(t => t.companyId).map(t => t.companyId!),
      ]
      const companyCount: Record<string, number> = {}
      companyIds.forEach(id => {
        companyCount[id] = (companyCount[id] || 0) + 1
      })
      const topCompanies = Object.entries(companyCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([id]) => getCompanyName(id) || id)

      const totalLoad = dayEvents.length + dayTasks.length

      return {
        date: dateStr,
        eventsCount: dayEvents.length,
        tasksCount: dayTasks.length,
        totalLoad,
        isHeavy: totalLoad > LOAD_THRESHOLDS.moderate,
        events: dayEvents,
        tasks: dayTasks,
        topCompanies,
      }
    })

    const overallLoad = days.reduce((sum, d) => sum + d.totalLoad, 0)
    const riskDays = days.filter(d => d.isHeavy).length

    return {
      weekStart: weekDates[0].toISOString().split('T')[0],
      weekEnd: weekDates[6].toISOString().split('T')[0],
      days,
      overallLoad,
      riskDays,
    }
  }, [weekDates, events, tasks, companies])

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const selectedDay = selectedDayIndex !== null ? smartWeekData.days[selectedDayIndex] : null

  // Reset drag state
  const resetDragState = useCallback(() => {
    setDraggedItem(null)
    setDragSourceDayIndex(null)
    setDropTargetDayIndex(null)
  }, [])

  // Handle drag start
  const handleDragStart = useCallback((item: DraggableItem, dayIndex: number) => {
    setDraggedItem(item)
    setDragSourceDayIndex(dayIndex)
  }, [])

  // Handle drag over a day
  const handleDragOver = useCallback((e: React.DragEvent, dayIndex: number) => {
    e.preventDefault()
    if (draggedItem && dayIndex !== dragSourceDayIndex) {
      setDropTargetDayIndex(dayIndex)
    }
  }, [draggedItem, dragSourceDayIndex])

  // Handle drag leave
  const handleDragLeave = useCallback(() => {
    setDropTargetDayIndex(null)
  }, [])

  // Handle drop
  const handleDrop = useCallback(async (e: React.DragEvent, targetDayIndex: number) => {
    e.preventDefault()
    if (!draggedItem || dragSourceDayIndex === null || targetDayIndex === dragSourceDayIndex) {
      resetDragState()
      return
    }

    const targetDate = weekDates[targetDayIndex]

    try {
      if (draggedItem.type === 'event') {
        await updateEvent(draggedItem.id, { date: targetDate })
        showSuccessToast('האירוע הועבר בהצלחה', '📅')
      } else {
        await updateTask(draggedItem.id, { dueDate: targetDate })
        showSuccessToast('המשימה הועברה בהצלחה', '✓')
      }
    } catch (error) {
      console.error('Error moving item:', error)
    }

    resetDragState()
  }, [draggedItem, dragSourceDayIndex, weekDates, updateEvent, updateTask, resetDragState])

  // Toggle rebalance mode
  const toggleRebalanceMode = () => {
    setIsRebalanceMode(!isRebalanceMode)
    if (isRebalanceMode) {
      resetDragState()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50" dir="rtl">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-neutral-200/50 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/calendar" className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                <ChevronLeft size={20} className="text-neutral-500" />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <Zap size={20} className="text-violet-600" />
                  <h1 className="font-bold text-neutral-900">שבוע חכם</h1>
                </div>
                <p className="text-sm text-neutral-500">
                  {MONTHS_HEBREW[weekDates[0].getMonth()]} {weekDates[0].getFullYear()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Rebalance Mode Toggle */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={toggleRebalanceMode}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isRebalanceMode
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/25'
                    : 'bg-violet-100 text-violet-700 hover:bg-violet-200'
                }`}
              >
                <ArrowLeftRight size={16} />
                <span className="hidden sm:inline">{isRebalanceMode ? 'סיום גרירה' : 'גרור ואזן'}</span>
              </motion.button>

              {health && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-neutral-500 hidden sm:inline">בריאות</span>
                  <HealthBadge score={health.score} status={health.status} size="md" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Rebalance Mode Banner */}
        <AnimatePresence>
          {isRebalanceMode && (
            <motion.div
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              className="bg-gradient-to-r from-violet-500 to-indigo-500 rounded-2xl p-4 text-white text-center"
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                <GripVertical size={18} />
                <span className="font-semibold">מצב גרירה פעיל</span>
              </div>
              <p className="text-sm text-white/80">
                לחץ והזז אירועים ומשימות בין הימים כדי לאזן את העומס
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Week navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setWeekOffset(prev => prev - 1)}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <ChevronRight size={20} className="text-neutral-500" />
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setWeekOffset(0)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                weekOffset === 0
                  ? 'bg-violet-100 text-violet-700'
                  : 'text-neutral-500 hover:bg-neutral-100'
              }`}
            >
              השבוע
            </button>
          </div>
          <button
            onClick={() => setWeekOffset(prev => prev + 1)}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <ChevronLeft size={20} className="text-neutral-500" />
          </button>
        </div>

        {/* Insights Strip */}
        {insights.length > 0 && !isRebalanceMode && (
          <InsightsStrip
            insights={insights}
            className="mb-2"
            delay={0.15}
          />
        )}

        {/* Week overview stats */}
        <div className="grid grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-neutral-200/50 p-4 text-center"
          >
            <div className="text-3xl font-bold text-neutral-900">{smartWeekData.overallLoad}</div>
            <div className="text-sm text-neutral-500">פריטים השבוע</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`rounded-2xl border p-4 text-center ${
              smartWeekData.riskDays > 0
                ? 'bg-red-50 border-red-200'
                : 'bg-emerald-50 border-emerald-200'
            }`}
          >
            <div className={`text-3xl font-bold ${
              smartWeekData.riskDays > 0 ? 'text-red-600' : 'text-emerald-600'
            }`}>
              {smartWeekData.riskDays}
            </div>
            <div className={`text-sm ${
              smartWeekData.riskDays > 0 ? 'text-red-600' : 'text-emerald-600'
            }`}>
              ימים עמוסים
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-neutral-200/50 p-4 text-center"
          >
            <div className="text-3xl font-bold text-neutral-900">
              {Math.round(smartWeekData.overallLoad / 7)}
            </div>
            <div className="text-sm text-neutral-500">ממוצע ליום</div>
          </motion.div>
        </div>

        {/* Week grid - heatmap style with drag support */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-7 gap-2"
        >
          {smartWeekData.days.map((day, index) => {
            const date = weekDates[index]
            const isToday = date.getTime() === today.getTime()
            const loadStatus = getLoadStatus(day.totalLoad)
            const colors = getLoadColors(loadStatus)
            const isSelected = selectedDayIndex === index
            const isDropTarget = dropTargetDayIndex === index
            const isSource = dragSourceDayIndex === index && draggedItem

            return (
              <motion.button
                key={day.date}
                onClick={() => {
                  if (!isRebalanceMode) {
                    setSelectedDayIndex(isSelected ? null : index)
                  }
                }}
                onDragOver={(e) => isRebalanceMode && handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => isRebalanceMode && handleDrop(e, index)}
                whileHover={{ scale: isRebalanceMode ? 1.05 : 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative p-4 rounded-2xl border-2 transition-all text-center ${
                  isDropTarget
                    ? 'bg-violet-100 border-violet-400 ring-4 ring-violet-400/30 scale-105'
                    : isSource
                    ? 'opacity-50'
                    : isSelected
                    ? `${colors.bg} ${colors.border} ring-4 ${colors.ring}`
                    : `bg-white border-transparent hover:border-neutral-200`
                } ${isToday ? 'ring-2 ring-violet-500/30' : ''} ${
                  isRebalanceMode ? 'cursor-move' : ''
                }`}
              >
                {/* Drop indicator */}
                {isDropTarget && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-0 flex items-center justify-center bg-violet-500/10 rounded-2xl z-10"
                  >
                    <div className="w-12 h-12 rounded-full bg-violet-500 flex items-center justify-center">
                      <Check size={24} className="text-white" />
                    </div>
                  </motion.div>
                )}

                {/* Day label */}
                <div className="text-xs text-neutral-400 mb-1">{DAYS_HEBREW[index]}</div>
                <div className={`text-lg font-bold mb-2 ${isToday ? 'text-violet-600' : 'text-neutral-900'}`}>
                  {date.getDate()}
                </div>

                {/* Load indicator */}
                <div className={`w-10 h-10 mx-auto rounded-xl ${colors.bg} flex items-center justify-center mb-2`}>
                  {day.isHeavy ? (
                    <Flame size={20} className={colors.text} />
                  ) : day.totalLoad > 0 ? (
                    <span className={`font-bold ${colors.text}`}>{day.totalLoad}</span>
                  ) : (
                    <Sparkles size={16} className="text-emerald-400" />
                  )}
                </div>

                {/* Mini stats */}
                <div className="flex items-center justify-center gap-1 text-xs text-neutral-400">
                  <span>{day.eventsCount}📅</span>
                  <span>{day.tasksCount}✓</span>
                </div>

                {/* Today indicator */}
                {isToday && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-violet-500 animate-pulse" />
                )}
              </motion.button>
            )
          })}
        </motion.div>

        {/* Selected day detail with draggable items */}
        {selectedDay && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-neutral-200/50 shadow-lg overflow-hidden"
          >
            {/* Day header */}
            <div className={`p-4 ${getLoadColors(getLoadStatus(selectedDay.totalLoad)).bg} border-b`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-neutral-900">
                    יום {DAYS_HEBREW[selectedDayIndex!]}, {weekDates[selectedDayIndex!].getDate()} ב{MONTHS_HEBREW[weekDates[selectedDayIndex!].getMonth()]}
                  </h3>
                  <p className="text-sm text-neutral-600">
                    {selectedDay.eventsCount} אירועים, {selectedDay.tasksCount} משימות
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {isRebalanceMode && (
                    <span className="px-3 py-1.5 bg-violet-100 text-violet-700 rounded-full text-xs font-medium flex items-center gap-1">
                      <GripVertical size={12} />
                      גרור פריטים
                    </span>
                  )}
                  {selectedDay.isHeavy && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                      <AlertTriangle size={14} />
                      יום עמוס
                    </div>
                  )}
                </div>
              </div>

              {/* Top companies */}
              {selectedDay.topCompanies.length > 0 && (
                <div className="flex items-center gap-2 mt-3">
                  <Building2 size={14} className="text-neutral-400" />
                  <div className="flex gap-1">
                    {selectedDay.topCompanies.map((name, i) => (
                      <span key={i} className="px-2 py-0.5 bg-white/60 rounded-full text-xs text-neutral-600">
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Events list */}
            {selectedDay.events.length > 0 && (
              <div className="p-4 border-b border-neutral-100">
                <h4 className="flex items-center gap-2 text-sm font-semibold text-neutral-700 mb-3">
                  <CalendarClock size={14} className="text-violet-500" />
                  אירועים
                </h4>
                <div className="space-y-2">
                  {selectedDay.events.map(event => (
                    <motion.div
                      key={event.id}
                      draggable={isRebalanceMode}
                      onDragStart={() => handleDragStart({
                        id: event.id,
                        type: 'event',
                        title: event.title,
                        time: event.startTime,
                        companyName: event.companyName,
                      }, selectedDayIndex!)}
                      onDragEnd={resetDragState}
                      whileHover={isRebalanceMode ? { scale: 1.02, x: -4 } : {}}
                      className={`flex items-center gap-3 p-3 bg-violet-50 rounded-xl transition-all ${
                        isRebalanceMode ? 'cursor-grab active:cursor-grabbing hover:shadow-md' : ''
                      }`}
                    >
                      {isRebalanceMode && (
                        <GripVertical size={16} className="text-violet-400 flex-shrink-0" />
                      )}
                      <div className="flex items-center gap-1.5 text-sm text-violet-600 font-medium min-w-[60px]">
                        <Clock size={12} />
                        {event.startTime}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-neutral-900">{event.title}</p>
                        {event.companyName && (
                          <p className="text-xs text-neutral-500">{event.companyName}</p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Tasks list */}
            {selectedDay.tasks.length > 0 && (
              <div className="p-4">
                <h4 className="flex items-center gap-2 text-sm font-semibold text-neutral-700 mb-3">
                  <ListTodo size={14} className="text-indigo-500" />
                  משימות
                </h4>
                <div className="space-y-2">
                  {selectedDay.tasks.map(task => (
                    <motion.div
                      key={task.id}
                      draggable={isRebalanceMode}
                      onDragStart={() => handleDragStart({
                        id: task.id,
                        type: 'task',
                        title: task.title,
                        companyName: task.companyName,
                        priority: task.priority,
                      }, selectedDayIndex!)}
                      onDragEnd={resetDragState}
                      whileHover={isRebalanceMode ? { scale: 1.02, x: -4 } : {}}
                      className={`flex items-center gap-3 p-3 bg-indigo-50 rounded-xl transition-all ${
                        isRebalanceMode ? 'cursor-grab active:cursor-grabbing hover:shadow-md' : ''
                      }`}
                    >
                      {isRebalanceMode && (
                        <GripVertical size={16} className="text-indigo-400 flex-shrink-0" />
                      )}
                      <div className={`w-2 h-2 rounded-full ${
                        task.priority === 'high' ? 'bg-red-500' :
                        task.priority === 'medium' ? 'bg-amber-500' :
                        'bg-neutral-300'
                      }`} />
                      <div className="flex-1">
                        <p className="font-medium text-neutral-900">{task.title}</p>
                        {task.companyName && (
                          <p className="text-xs text-neutral-500">{task.companyName}</p>
                        )}
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        task.status === 'DOING' ? 'bg-blue-100 text-blue-700' : 'bg-neutral-100 text-neutral-600'
                      }`}>
                        {task.status === 'DOING' ? 'בתהליך' : 'לביצוע'}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {selectedDay.events.length === 0 && selectedDay.tasks.length === 0 && (
              <div className="p-8 text-center">
                <Sparkles size={32} className="text-emerald-400 mx-auto mb-3" />
                <p className="text-neutral-600 font-medium">יום פנוי!</p>
                <p className="text-sm text-neutral-400">אין אירועים או משימות</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Dragged item preview */}
        <AnimatePresence>
          {draggedItem && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
            >
              <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl ${
                draggedItem.type === 'event' ? 'bg-violet-600' : 'bg-indigo-600'
              } text-white`}>
                {draggedItem.type === 'event' ? (
                  <CalendarClock size={18} />
                ) : (
                  <ListTodo size={18} />
                )}
                <span className="font-medium">{draggedItem.title}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick insights */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-violet-500 to-indigo-500 rounded-2xl p-6 text-white"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <TrendingUp size={20} />
            </div>
            <div>
              <h3 className="font-semibold mb-1">תובנות השבוע</h3>
              <ul className="text-sm text-white/90 space-y-1">
                {smartWeekData.riskDays > 0 ? (
                  <li>• יש {smartWeekData.riskDays} ימים עמוסים - {isRebalanceMode ? 'גרור פריטים לאזן' : 'לחץ על "גרור ואזן" לאיזון'}</li>
                ) : (
                  <li>• השבוע נראה מאוזן - כל הכבוד!</li>
                )}
                {smartWeekData.days.some(d => d.totalLoad === 0) && (
                  <li>• יש לך ימים פנויים - מושלם להתקדמות בפרויקטים</li>
                )}
                {smartWeekData.overallLoad > 35 && (
                  <li>• העומס הכללי גבוה - נסה לתעדף משימות</li>
                )}
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
