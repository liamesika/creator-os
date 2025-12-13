'use client'

import { motion } from 'framer-motion'
import { useTasksStore } from '@/stores/tasksStore'
import { useGoalsStore } from '@/stores/goalsStore'
import { useCalendarStore } from '@/stores/calendarStore'
import { getTodayDateString } from '@/types/goal'
import { Task, TaskStatus } from '@/types/task'
import { CalendarEvent, CATEGORY_PRESETS } from '@/types/calendar'
import { Target, CheckSquare, Calendar as CalendarIcon, ChevronRight, Circle, CheckCircle2, Clock } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function TodayWorkspace() {
  const { getTodayTasks, markTaskDone } = useTasksStore()
  const { getTodayGoal } = useGoalsStore()
  const { getEventsForDate } = useCalendarStore()

  const todayTasks = getTodayTasks()
  const todayGoal = getTodayGoal()
  const todayEvents = getEventsForDate(new Date())

  const upcomingEvents = todayEvents
    .filter((event) => {
      if (!event.startTime) return true
      const now = new Date()
      const [hours, minutes] = event.startTime.split(':').map(Number)
      const eventTime = new Date()
      eventTime.setHours(hours, minutes, 0, 0)
      return eventTime >= now
    })
    .sort((a, b) => {
      if (!a.startTime) return 1
      if (!b.startTime) return -1
      return a.startTime.localeCompare(b.startTime)
    })
    .slice(0, 3)

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'DONE':
        return <CheckCircle2 className="text-green-600" size={18} />
      case 'DOING':
        return <Clock className="text-orange-600" size={18} />
      case 'TODO':
        return <Circle className="text-neutral-400" size={18} />
    }
  }

  return (
    <div className="space-y-6">
      {/* Today's Goals */}
      {todayGoal && todayGoal.items.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="dashboard-card"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-accent-100 flex items-center justify-center">
                <Target size={16} className="text-accent-600" />
              </div>
              <h3 className="font-bold text-neutral-900">המטרות שלי להיום</h3>
            </div>
            <Link
              href="/goals"
              className="text-xs font-medium text-accent-600 hover:text-accent-700 flex items-center gap-1"
            >
              עוד
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="space-y-2">
            {todayGoal.items.map((item, index) => (
              <div
                key={item.id}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border transition-all',
                  item.status === 'DONE'
                    ? 'border-green-200 bg-green-50/50'
                    : 'border-neutral-200 bg-neutral-50/50'
                )}
              >
                <div className="w-6 h-6 rounded-full bg-white border-2 border-accent-500 flex items-center justify-center text-xs font-bold text-accent-700">
                  {index + 1}
                </div>
                <p
                  className={cn(
                    'flex-1 text-sm font-medium text-right',
                    item.status === 'DONE' && 'line-through text-neutral-500'
                  )}
                >
                  {item.title}
                </p>
                {item.status === 'DONE' && (
                  <CheckCircle2 size={16} className="text-green-600" />
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Today's Tasks */}
      {todayTasks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="dashboard-card"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <CheckSquare size={16} className="text-blue-600" />
              </div>
              <h3 className="font-bold text-neutral-900">המשימות שלי להיום</h3>
            </div>
            <Link
              href="/tasks"
              className="text-xs font-medium text-accent-600 hover:text-accent-700 flex items-center gap-1"
            >
              עוד
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="space-y-2">
            {todayTasks.slice(0, 5).map((task) => (
              <div
                key={task.id}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border transition-all hover:border-accent-300 cursor-pointer',
                  task.status === 'DONE'
                    ? 'border-green-200 bg-green-50/30'
                    : 'border-neutral-200 bg-white'
                )}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (task.status !== 'DONE') {
                      markTaskDone(task.id)
                    }
                  }}
                  className="flex-shrink-0"
                >
                  {getStatusIcon(task.status)}
                </button>
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      'text-sm font-medium text-right truncate',
                      task.status === 'DONE' && 'line-through text-neutral-500'
                    )}
                  >
                    {task.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Next Events */}
      {upcomingEvents.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="dashboard-card"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                <CalendarIcon size={16} className="text-purple-600" />
              </div>
              <h3 className="font-bold text-neutral-900">האירועים הבאים</h3>
            </div>
            <Link
              href="/calendar"
              className="text-xs font-medium text-accent-600 hover:text-accent-700 flex items-center gap-1"
            >
              עוד
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="space-y-2">
            {upcomingEvents.map((event) => {
              const preset = CATEGORY_PRESETS[event.category]
              const Icon = preset.icon

              return (
                <div
                  key={event.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-neutral-200 bg-white hover:border-accent-300 transition-all cursor-pointer"
                >
                  <div
                    className={cn('w-10 h-10 rounded-lg flex items-center justify-center', preset.bgColor)}
                  >
                    <Icon size={18} className={preset.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-neutral-900 truncate text-right">
                      {event.title}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {event.startTime} - {event.endTime}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {!todayGoal && todayTasks.length === 0 && upcomingEvents.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="dashboard-card py-12 text-center"
        >
          <Target size={48} className="text-neutral-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-neutral-900 mb-2">היום נקי!</h3>
          <p className="text-neutral-600 text-sm mb-6">
            עדיין לא הגדרת מטרות, משימות או אירועים להיום
          </p>
          <div className="flex items-center justify-center gap-2">
            <Link
              href="/goals"
              className="px-4 py-2 bg-accent-600 text-white rounded-lg text-sm font-medium hover:bg-accent-700 transition-all"
            >
              הגדר מטרות
            </Link>
            <Link
              href="/tasks"
              className="px-4 py-2 border-2 border-neutral-200 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-all"
            >
              צור משימה
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  )
}
