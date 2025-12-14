'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGoalsStore } from '@/stores/goalsStore'
import {
  GoalItemStatus,
  formatGoalDate,
  getTodayDateString,
  getWeekDates,
  calculateGoalCompletion,
} from '@/types/goal'
import GoalFormSheet from '@/components/goals/GoalFormSheet'
import ReflectionSheet from '@/components/goals/ReflectionSheet'
import {
  Target,
  Plus,
  CheckCircle2,
  Circle,
  MinusCircle,
  Edit,
  FileText,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export default function GoalsPage() {
  const {
    getTodayGoal,
    getGoalForDate,
    setGoalItemStatus,
    openCreateModal,
    closeCreateModal,
    isCreateModalOpen,
    selectedDate,
    setSelectedDate,
    openReflectionModal,
    closeReflectionModal,
    isReflectionModalOpen,
  } = useGoalsStore()

  const [weekStartDate, setWeekStartDate] = useState(() => {
    const today = new Date()
    const start = new Date(today)
    start.setDate(today.getDate() - today.getDay())
    return start
  })

  const todayGoal = getTodayGoal()
  const weekDates = getWeekDates(weekStartDate)

  const handlePreviousWeek = () => {
    const newStart = new Date(weekStartDate)
    newStart.setDate(weekStartDate.getDate() - 7)
    setWeekStartDate(newStart)
  }

  const handleNextWeek = () => {
    const newStart = new Date(weekStartDate)
    newStart.setDate(weekStartDate.getDate() + 7)
    setWeekStartDate(newStart)
  }

  const handleStatusToggle = (
    date: string,
    itemId: string,
    currentStatus: GoalItemStatus
  ) => {
    const nextStatus: GoalItemStatus =
      currentStatus === 'NOT_DONE'
        ? 'PARTIAL'
        : currentStatus === 'PARTIAL'
        ? 'DONE'
        : 'NOT_DONE'

    setGoalItemStatus(date, itemId, nextStatus)
  }

  const getStatusIcon = (status: GoalItemStatus) => {
    switch (status) {
      case 'DONE':
        return <CheckCircle2 className="text-green-600" size={20} />
      case 'PARTIAL':
        return <MinusCircle className="text-orange-600" size={20} />
      case 'NOT_DONE':
        return <Circle className="text-neutral-400" size={20} />
    }
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const DayCard = ({ date }: { date: Date }) => {
    const dateString = formatGoalDate(date)
    const goal = getGoalForDate(dateString)
    const completion = goal ? calculateGoalCompletion(goal.items) : 0
    const isTodayDate = isToday(date)

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          'bg-white rounded-2xl border-2 p-4 transition-all hover:shadow-md cursor-pointer',
          isTodayDate
            ? 'border-accent-500 bg-accent-50/30'
            : goal && goal.items.length > 0
            ? 'border-neutral-200'
            : 'border-neutral-100 bg-neutral-50/50'
        )}
        onClick={() => {
          setSelectedDate(dateString)
          openCreateModal(dateString)
        }}
      >
        <div className="text-center mb-3">
          <div className="text-xs text-neutral-500 mb-1">
            {date.toLocaleDateString('he-IL', { weekday: 'short' })}
          </div>
          <div
            className={cn(
              'text-2xl font-bold',
              isTodayDate ? 'text-accent-600' : 'text-neutral-900'
            )}
          >
            {date.getDate()}
          </div>
          <div className="text-xs text-neutral-500">
            {date.toLocaleDateString('he-IL', { month: 'short' })}
          </div>
        </div>

        {goal && goal.items.length > 0 ? (
          <>
            {/* Completion Circle */}
            <div className="relative w-16 h-16 mx-auto mb-3">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  className="text-neutral-200"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 28}`}
                  strokeDashoffset={`${
                    2 * Math.PI * 28 * (1 - completion / 100)
                  }`}
                  className={cn(
                    'transition-all duration-500',
                    completion === 100
                      ? 'text-green-500'
                      : completion > 0
                      ? 'text-orange-500'
                      : 'text-neutral-300'
                  )}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-neutral-900">
                  {Math.round(completion)}%
                </span>
              </div>
            </div>

            {/* Goals Count */}
            <div className="text-center text-xs text-neutral-600">
              {goal.items.filter((i) => i.status === 'DONE').length}/
              {goal.items.length} מטרות
            </div>
          </>
        ) : (
          <div className="h-24 flex items-center justify-center">
            <Plus className="text-neutral-300" size={32} />
          </div>
        )}
      </motion.div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 mb-1">מטרות יומיות</h1>
            <p className="text-neutral-600">התמקד ב-1-3 דברים חשובים כל יום</p>
          </div>

          {/* Desktop Add Button - Premium styling */}
          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => openCreateModal(getTodayDateString())}
            className="hidden lg:flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent-600 to-accent-500 text-white rounded-xl font-semibold hover:from-accent-700 hover:to-accent-600 transition-all shadow-[0_4px_16px_-4px_rgba(168,85,247,0.4)]"
          >
            <Plus size={20} strokeWidth={2.5} />
            הגדר מטרות להיום
          </motion.button>

          {/* Mobile Add Button - Premium styling */}
          <motion.button
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => openCreateModal(getTodayDateString())}
            className="lg:hidden flex items-center justify-center w-12 h-12 bg-gradient-to-br from-neutral-800 to-neutral-900 text-white rounded-2xl shadow-[0_8px_24px_-4px_rgba(0,0,0,0.3)] transition-all relative"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
            <Plus size={24} strokeWidth={2.5} className="relative z-10" />
          </motion.button>
        </div>
      </motion.div>

      {/* Today's Goals */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <div className="bg-white rounded-2xl border border-neutral-200/70 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.12),0_6px_20px_-6px_rgba(0,0,0,0.08)] p-6 sm:p-7">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-accent-100 via-accent-50 to-white flex items-center justify-center shadow-[0_2px_8px_-2px_rgba(168,85,247,0.2)]">
                <Target className="text-accent-600 drop-shadow-sm" size={18} strokeWidth={2} />
              </div>
              <h2 className="text-xl font-bold text-neutral-900 tracking-tight">היום</h2>
            </div>
            {todayGoal && todayGoal.items.length > 0 && (
              <button
                onClick={() => openReflectionModal(getTodayDateString())}
                className="px-4 py-2 rounded-lg border-2 border-purple-200 text-purple-700 hover:bg-purple-50 transition-all flex items-center gap-2 text-sm font-bold"
              >
                <FileText size={16} />
                סיכום יום
              </button>
            )}
          </div>

          {todayGoal && todayGoal.items.length > 0 ? (
            <div className="space-y-3">
              {todayGoal.items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    'flex items-start gap-3 p-4 rounded-xl border-2 transition-all',
                    item.status === 'DONE'
                      ? 'border-green-200 bg-green-50/50'
                      : item.status === 'PARTIAL'
                      ? 'border-orange-200 bg-orange-50/50'
                      : 'border-neutral-200 bg-white hover:border-accent-300'
                  )}
                >
                  <button
                    onClick={() =>
                      handleStatusToggle(
                        getTodayDateString(),
                        item.id,
                        item.status
                      )
                    }
                    className="flex-shrink-0 mt-0.5 hover:scale-110 transition-transform"
                  >
                    {getStatusIcon(item.status)}
                  </button>

                  <div className="flex-1 min-w-0">
                    <h3
                      className={cn(
                        'font-bold text-neutral-900 text-right mb-1',
                        item.status === 'DONE' && 'line-through text-neutral-500'
                      )}
                    >
                      {item.title}
                    </h3>
                    {item.note && (
                      <p className="text-sm text-neutral-600 text-right">
                        {item.note}
                      </p>
                    )}
                  </div>

                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent-100 text-accent-700 font-bold flex items-center justify-center text-sm">
                    {index + 1}
                  </div>
                </motion.div>
              ))}

              <button
                onClick={() => openCreateModal(getTodayDateString())}
                className="w-full mt-4 px-4 py-3 rounded-xl border-2 border-accent-300 text-accent-700 hover:bg-accent-50 transition-all font-bold flex items-center justify-center gap-2"
              >
                <Edit size={18} />
                ערוך מטרות
              </button>
            </div>
          ) : (
            <div className="text-center py-12">
              <Target size={64} className="text-neutral-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-neutral-900 mb-2">
                עוד לא הוגדרו מטרות להיום
              </h3>
              <p className="text-neutral-600 mb-6">
                התחל את היום עם 1-3 מטרות ברורות
              </p>
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => openCreateModal(getTodayDateString())}
                className="px-6 py-3 bg-gradient-to-r from-accent-600 to-accent-500 text-white rounded-xl font-semibold hover:from-accent-700 hover:to-accent-600 transition-all inline-flex items-center gap-2 shadow-[0_4px_16px_-4px_rgba(168,85,247,0.4)]"
              >
                <Plus size={20} strokeWidth={2.5} />
                להגדיר מטרות
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Week Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-neutral-900">השבוע</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePreviousWeek}
              className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              <ChevronRight size={20} className="text-neutral-600" />
            </button>
            <span className="text-sm font-medium text-neutral-600 min-w-[120px] text-center">
              {weekDates[0].toLocaleDateString('he-IL', {
                month: 'short',
                year: 'numeric',
              })}
            </span>
            <button
              onClick={handleNextWeek}
              className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              <ChevronLeft size={20} className="text-neutral-600" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {weekDates.map((date) => (
            <DayCard key={date.toISOString()} date={date} />
          ))}
        </div>
      </motion.div>

      {/* Goal Form Sheet */}
      <GoalFormSheet
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        date={selectedDate}
      />

      {/* Reflection Sheet */}
      <ReflectionSheet
        isOpen={isReflectionModalOpen}
        onClose={closeReflectionModal}
        date={selectedDate}
      />
    </div>
  )
}
