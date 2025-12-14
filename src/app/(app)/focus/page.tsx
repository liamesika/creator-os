'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Focus,
  CheckCircle2,
  Calendar,
  ArrowRight,
  Sparkles,
  Coffee,
  Moon,
  ChevronLeft,
  Clock,
  Building2,
  CalendarClock,
  ListTodo,
  X,
  Sunrise,
  Sunset
} from 'lucide-react'
import { useTasksStore } from '@/stores/tasksStore'
import { useCalendarStore } from '@/stores/calendarStore'
import { useCompaniesStore } from '@/stores/companiesStore'
import { useHealthScore } from '@/hooks/useHealthScore'
import { HealthBadge } from '@/components/app/HealthScoreCard'
import Link from 'next/link'
import { toast } from 'sonner'
import type { Task } from '@/types/task'
import type { CalendarEvent } from '@/types/calendar'

type FocusPhase = 'start' | 'action' | 'end-day' | 'completed'

interface FocusAction {
  type: 'task' | 'event'
  id: string
  title: string
  companyName?: string
  time?: string
  priority?: string
  dueDate?: Date
}

export default function FocusModePage() {
  const [phase, setPhase] = useState<FocusPhase>('start')
  const [currentActionIndex, setCurrentActionIndex] = useState(0)
  const [completedActions, setCompletedActions] = useState<string[]>([])
  const [skippedActions, setSkippedActions] = useState<string[]>([])
  const [sessionStartTime] = useState(new Date())
  const [reflection, setReflection] = useState('')

  const { tasks, markTaskDone, updateTask } = useTasksStore()
  const { events } = useCalendarStore()
  const { companies } = useCompaniesStore()
  const { health } = useHealthScore()

  // Get today's date
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Helper to get company name
  const getCompanyName = (companyId?: string | null) => {
    if (!companyId) return undefined
    return companies.find(c => c.id === companyId)?.name
  }

  // Build today's action queue
  const todayActions = useMemo((): FocusAction[] => {
    const actions: FocusAction[] = []

    // Get today's events (sorted by time)
    const todayEvents = events
      .filter(e => {
        const eventDate = new Date(e.date)
        eventDate.setHours(0, 0, 0, 0)
        return eventDate.getTime() === today.getTime()
      })
      .sort((a, b) => {
        if (!a.startTime) return 1
        if (!b.startTime) return -1
        return a.startTime.localeCompare(b.startTime)
      })

    todayEvents.forEach(event => {
      actions.push({
        type: 'event',
        id: event.id,
        title: event.title,
        companyName: getCompanyName(event.companyId),
        time: event.startTime,
      })
    })

    // Get today's tasks (sorted by priority)
    const todayTasks = tasks
      .filter(t => {
        if (t.archived || t.status === 'DONE') return false
        if (!t.dueDate) return false
        const dueDate = new Date(t.dueDate)
        dueDate.setHours(0, 0, 0, 0)
        return dueDate.getTime() === today.getTime()
      })
      .sort((a, b) => {
        const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 }
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      })

    todayTasks.forEach(task => {
      actions.push({
        type: 'task',
        id: task.id,
        title: task.title,
        companyName: getCompanyName(task.companyId),
        priority: task.priority,
        dueDate: task.dueDate,
      })
    })

    return actions
  }, [events, tasks, companies, today])

  // Get remaining actions (not completed or skipped)
  const remainingActions = todayActions.filter(
    a => !completedActions.includes(a.id) && !skippedActions.includes(a.id)
  )

  const currentAction = remainingActions[0]

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return { text: 'בוקר טוב', icon: Sunrise }
    if (hour < 17) return { text: 'צהריים טובים', icon: Coffee }
    if (hour < 21) return { text: 'ערב טוב', icon: Sunset }
    return { text: 'לילה טוב', icon: Moon }
  }

  const greeting = getGreeting()
  const GreetingIcon = greeting.icon

  // Handle completing current action
  const handleComplete = async () => {
    if (!currentAction) return

    if (currentAction.type === 'task') {
      await markTaskDone(currentAction.id)
    }

    setCompletedActions(prev => [...prev, currentAction.id])
    toast.success('הושלם!', { icon: '✨' })

    // Check if we're done
    if (remainingActions.length === 1) {
      setPhase('end-day')
    }
  }

  // Handle skipping (move to tomorrow)
  const handleSkip = async () => {
    if (!currentAction) return

    if (currentAction.type === 'task') {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      await updateTask(currentAction.id, { dueDate: tomorrow })
      toast.info('המשימה הועברה למחר')
    }

    setSkippedActions(prev => [...prev, currentAction.id])

    // Check if we're done
    if (remainingActions.length === 1) {
      setPhase('end-day')
    }
  }

  // Calculate session stats
  const sessionStats = {
    completed: completedActions.length,
    skipped: skippedActions.length,
    total: todayActions.length,
    duration: Math.round((new Date().getTime() - sessionStartTime.getTime()) / 60000)
  }

  // Render based on phase
  if (phase === 'start') {
    return (
      <FocusStartScreen
        greeting={greeting}
        GreetingIcon={GreetingIcon}
        todayActions={todayActions}
        health={health}
        onStart={() => setPhase(todayActions.length > 0 ? 'action' : 'end-day')}
      />
    )
  }

  if (phase === 'end-day' || phase === 'completed') {
    return (
      <FocusEndScreen
        stats={sessionStats}
        reflection={reflection}
        setReflection={setReflection}
        isCompleted={phase === 'completed'}
        onComplete={() => setPhase('completed')}
      />
    )
  }

  // Action phase
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50" dir="rtl">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-neutral-200/50 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/dashboard" className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
            <ChevronLeft size={20} className="text-neutral-500" />
          </Link>
          <div className="flex items-center gap-2">
            <Focus size={18} className="text-indigo-600" />
            <span className="font-medium text-neutral-900">מצב פוקוס</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <span>{completedActions.length}/{todayActions.length}</span>
            {health && <HealthBadge score={health.score} status={health.status} size="sm" />}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-neutral-200">
        <motion.div
          className="h-full bg-gradient-to-r from-indigo-500 to-violet-500"
          initial={{ width: 0 }}
          animate={{ width: `${(completedActions.length / todayActions.length) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Main content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {currentAction && (
            <motion.div
              key={currentAction.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6"
            >
              {/* Action type label */}
              <div className="text-center">
                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                  currentAction.type === 'event'
                    ? 'bg-violet-100 text-violet-700'
                    : 'bg-indigo-100 text-indigo-700'
                }`}>
                  {currentAction.type === 'event' ? (
                    <>
                      <CalendarClock size={14} />
                      אירוע
                    </>
                  ) : (
                    <>
                      <ListTodo size={14} />
                      משימה
                    </>
                  )}
                </span>
              </div>

              {/* Main action card */}
              <motion.div
                className="bg-white rounded-3xl shadow-[0_8px_32px_-8px_rgba(0,0,0,0.1)] border border-neutral-200/50 p-8 text-center"
                layoutId="action-card"
              >
                {/* Title */}
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                  {currentAction.title}
                </h2>

                {/* Meta info */}
                <div className="flex items-center justify-center gap-4 text-sm text-neutral-500 mb-8">
                  {currentAction.companyName && (
                    <div className="flex items-center gap-1.5">
                      <Building2 size={14} />
                      <span>{currentAction.companyName}</span>
                    </div>
                  )}
                  {currentAction.time && (
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} />
                      <span>{currentAction.time}</span>
                    </div>
                  )}
                  {currentAction.priority && (
                    <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      currentAction.priority === 'HIGH' ? 'bg-red-100 text-red-700' :
                      currentAction.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-700' :
                      'bg-neutral-100 text-neutral-600'
                    }`}>
                      {currentAction.priority === 'HIGH' ? 'גבוהה' :
                       currentAction.priority === 'MEDIUM' ? 'בינונית' : 'נמוכה'}
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleComplete}
                    className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold rounded-2xl shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-shadow flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={20} />
                    סיימתי
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSkip}
                    className="w-full sm:w-auto px-8 py-4 bg-neutral-100 text-neutral-600 font-medium rounded-2xl hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <ArrowRight size={20} />
                    {currentAction.type === 'task' ? 'העבר למחר' : 'דלג'}
                  </motion.button>
                </div>
              </motion.div>

              {/* Remaining count */}
              <p className="text-center text-sm text-neutral-500">
                עוד {remainingActions.length - 1} פריטים לאחר זה
              </p>

              {/* Quick end day button */}
              {completedActions.length > 0 && (
                <button
                  onClick={() => setPhase('end-day')}
                  className="w-full text-center text-sm text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  סיים את היום עכשיו
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Start screen component
interface FocusStartScreenProps {
  greeting: { text: string; icon: any }
  GreetingIcon: any
  todayActions: FocusAction[]
  health: ReturnType<typeof useHealthScore>['health']
  onStart: () => void
}

function FocusStartScreen({ greeting, GreetingIcon, todayActions, health, onStart }: FocusStartScreenProps) {
  const taskCount = todayActions.filter(a => a.type === 'task').length
  const eventCount = todayActions.filter(a => a.type === 'event').length

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50 flex flex-col" dir="rtl">
      {/* Header */}
      <div className="p-4">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-700 transition-colors">
          <ChevronLeft size={20} />
          <span>חזרה</span>
        </Link>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-md w-full text-center space-y-8"
        >
          {/* Greeting */}
          <div className="space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-20 h-20 mx-auto bg-gradient-to-br from-indigo-500 to-violet-500 rounded-3xl flex items-center justify-center shadow-xl shadow-indigo-500/25"
            >
              <GreetingIcon size={40} className="text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold text-neutral-900">{greeting.text}</h1>
            <p className="text-neutral-600">בואו נתמקד ביום שלך</p>
          </div>

          {/* Today summary card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg border border-neutral-200/50 p-6 text-right"
          >
            <h2 className="font-semibold text-neutral-900 mb-4">מה מחכה להיום</h2>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-neutral-600">
                  <ListTodo size={16} className="text-indigo-500" />
                  משימות
                </span>
                <span className="font-semibold text-neutral-900">{taskCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-neutral-600">
                  <CalendarClock size={16} className="text-violet-500" />
                  אירועים
                </span>
                <span className="font-semibold text-neutral-900">{eventCount}</span>
              </div>
              {health && (
                <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                  <span className="text-neutral-600">מדד בריאות</span>
                  <HealthBadge score={health.score} status={health.status} size="md" />
                </div>
              )}
            </div>
          </motion.div>

          {/* Start button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {todayActions.length > 0 ? (
              <button
                onClick={onStart}
                className="w-full py-4 px-8 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold rounded-2xl shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
              >
                <Focus size={20} />
                התחל מצב פוקוס
              </button>
            ) : (
              <div className="space-y-4">
                <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200/50">
                  <Sparkles size={32} className="text-emerald-500 mx-auto mb-3" />
                  <p className="text-emerald-700 font-medium">
                    אין משימות או אירועים להיום
                  </p>
                  <p className="text-emerald-600 text-sm mt-1">
                    תהנה מהיום הפנוי שלך!
                  </p>
                </div>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-700 transition-colors"
                >
                  <ChevronLeft size={16} />
                  חזרה לדשבורד
                </Link>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

// End screen component
interface FocusEndScreenProps {
  stats: {
    completed: number
    skipped: number
    total: number
    duration: number
  }
  reflection: string
  setReflection: (value: string) => void
  isCompleted: boolean
  onComplete: () => void
}

function FocusEndScreen({ stats, reflection, setReflection, isCompleted, onComplete }: FocusEndScreenProps) {
  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 100

  const getMessage = () => {
    if (completionRate === 100) return { emoji: '🎉', text: 'מושלם! סיימת את כל המשימות', sub: 'יום פרודוקטיבי במיוחד!' }
    if (completionRate >= 80) return { emoji: '⭐', text: 'עבודה מצוינת!', sub: 'רוב המשימות הושלמו' }
    if (completionRate >= 50) return { emoji: '💪', text: 'התקדמות טובה', sub: 'המשך כך!' }
    return { emoji: '🌱', text: 'כל צעד חשוב', sub: 'מחר יום חדש' }
  }

  const message = getMessage()

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50 flex items-center justify-center p-4" dir="rtl">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-md w-full"
      >
        <div className="bg-white rounded-3xl shadow-xl border border-neutral-200/50 overflow-hidden">
          {/* Header gradient */}
          <div className="bg-gradient-to-r from-indigo-500 to-violet-500 p-8 text-center text-white">
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="text-5xl block mb-4"
            >
              {message.emoji}
            </motion.span>
            <h1 className="text-2xl font-bold mb-1">{message.text}</h1>
            <p className="text-indigo-100">{message.sub}</p>
          </div>

          {/* Stats */}
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-emerald-50 rounded-xl">
                <p className="text-2xl font-bold text-emerald-600">{stats.completed}</p>
                <p className="text-xs text-emerald-600">הושלמו</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-xl">
                <p className="text-2xl font-bold text-amber-600">{stats.skipped}</p>
                <p className="text-xs text-amber-600">הועברו</p>
              </div>
              <div className="p-4 bg-indigo-50 rounded-xl">
                <p className="text-2xl font-bold text-indigo-600">{stats.duration}d</p>
                <p className="text-xs text-indigo-600">דקות</p>
              </div>
            </div>

            {/* Reflection */}
            {!isCompleted && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-2"
              >
                <label className="block text-sm font-medium text-neutral-700">
                  רפלקציה על היום (אופציונלי)
                </label>
                <textarea
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="מה עבד היום? מה הייתי עושה אחרת?"
                  className="w-full p-4 border border-neutral-200 rounded-xl resize-none h-24 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-right"
                />
              </motion.div>
            )}

            {/* Actions */}
            <div className="space-y-3 pt-2">
              {!isCompleted ? (
                <button
                  onClick={onComplete}
                  className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                >
                  סיים את היום
                </button>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center space-y-4"
                >
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200/50">
                    <CheckCircle2 size={32} className="text-emerald-500 mx-auto mb-2" />
                    <p className="text-emerald-700 font-medium">היום הסתיים!</p>
                  </div>
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center gap-2 w-full py-3 text-neutral-600 hover:text-neutral-800 transition-colors"
                  >
                    <ChevronLeft size={16} />
                    חזרה לדשבורד
                  </Link>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
