'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Clock, CheckCircle2, Circle } from 'lucide-react'
import { CalendarEvent, CATEGORY_PRESETS } from '@/types/calendar'
import { useCalendarStore } from '@/stores/calendarStore'

interface DayViewProps {
  onEventClick: (event: CalendarEvent) => void
  onTimeSlotClick: (date: Date, time: string) => void
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)

const HEBREW_DAYS_FULL = ['יום ראשון', 'יום שני', 'יום שלישי', 'יום רביעי', 'יום חמישי', 'יום שישי', 'שבת']
const HEBREW_MONTHS = [
  'בינואר',
  'בפברואר',
  'במרץ',
  'באפריל',
  'במאי',
  'ביוני',
  'ביולי',
  'באוגוסט',
  'בספטמבר',
  'באוקטובר',
  'בנובמבר',
  'בדצמבר',
]

export default function DayView({ onEventClick, onTimeSlotClick }: DayViewProps) {
  const { selectedDate, events, toggleTaskCompletion } = useCalendarStore()

  const dayEvents = useMemo(() => {
    return events
      .filter((event) => {
        const eventDate = new Date(event.date)
        return (
          eventDate.getFullYear() === selectedDate.getFullYear() &&
          eventDate.getMonth() === selectedDate.getMonth() &&
          eventDate.getDate() === selectedDate.getDate()
        )
      })
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  }, [events, selectedDate])

  const isToday = (): boolean => {
    const today = new Date()
    return (
      selectedDate.getFullYear() === today.getFullYear() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getDate() === today.getDate()
    )
  }

  const getEventPosition = (event: CalendarEvent) => {
    const [startHour, startMin] = event.startTime.split(':').map(Number)
    const [endHour, endMin] = event.endTime.split(':').map(Number)

    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin
    const duration = endMinutes - startMinutes

    return {
      top: `${(startMinutes / (24 * 60)) * 100}%`,
      height: `${(duration / (24 * 60)) * 100}%`,
    }
  }

  const formatHour = (hour: number): string => {
    return `${hour.toString().padStart(2, '0')}:00`
  }

  const getCurrentTimePosition = (): string => {
    const now = new Date()
    const minutes = now.getHours() * 60 + now.getMinutes()
    return `${(minutes / (24 * 60)) * 100}%`
  }

  const formatDateHeader = (): string => {
    const day = HEBREW_DAYS_FULL[selectedDate.getDay()]
    const date = selectedDate.getDate()
    const month = HEBREW_MONTHS[selectedDate.getMonth()]
    return `${day}, ${date} ${month}`
  }

  return (
    <div className="h-full flex">
      {/* Time grid */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Date header */}
        <div className="px-4 py-3 border-b border-neutral-100 bg-white">
          <h3 className="text-lg font-semibold text-neutral-800">
            {formatDateHeader()}
            {isToday() && (
              <span className="mr-2 text-xs font-medium text-accent-600 bg-accent-50 px-2 py-0.5 rounded-full">
                היום
              </span>
            )}
          </h3>
          <p className="text-sm text-neutral-500 mt-0.5">
            {dayEvents.length} אירועים מתוכננים
          </p>
        </div>

        {/* Scrollable time grid */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="flex min-h-[1440px] relative">
            {/* Time column */}
            <div className="w-16 flex-shrink-0 relative">
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="absolute w-full text-left pr-2"
                  style={{ top: `${(hour / 24) * 100}%` }}
                >
                  <span className="text-[10px] text-neutral-400 bg-white px-1">
                    {formatHour(hour)}
                  </span>
                </div>
              ))}
            </div>

            {/* Events column */}
            <div className="flex-1 relative border-l border-neutral-100">
              {/* Hour lines */}
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="absolute w-full border-t border-neutral-100 cursor-pointer hover:bg-neutral-50/50"
                  style={{ top: `${(hour / 24) * 100}%`, height: `${100 / 24}%` }}
                  onClick={() => onTimeSlotClick(selectedDate, formatHour(hour))}
                />
              ))}

              {/* Current time indicator */}
              {isToday() && (
                <div
                  className="absolute left-0 right-0 z-20 pointer-events-none"
                  style={{ top: getCurrentTimePosition() }}
                >
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <div className="flex-1 h-0.5 bg-red-500" />
                  </div>
                </div>
              )}

              {/* Events */}
              {dayEvents.map((event) => {
                const preset = CATEGORY_PRESETS[event.category]
                const position = getEventPosition(event)
                const Icon = preset.icon
                const completedTasks = event.linkedTasks.filter((t) => t.completed).length
                const totalTasks = event.linkedTasks.length

                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`
                      absolute right-2 left-2 rounded-xl overflow-hidden cursor-pointer
                      ${preset.bgColor} ${preset.borderColor} border
                      shadow-sm hover:shadow-md transition-all duration-200
                    `}
                    style={{
                      top: position.top,
                      height: position.height,
                      minHeight: '60px',
                    }}
                    onClick={() => onEventClick(event)}
                  >
                    <div className="p-3 h-full flex flex-col">
                      <div className="flex items-start gap-2">
                        <div className={`p-1.5 rounded-lg bg-white/60`}>
                          <Icon size={16} className={preset.color} strokeWidth={2} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-semibold text-sm ${preset.color}`}>
                            {event.title}
                          </h4>
                          <div className="flex items-center gap-1 mt-0.5 text-neutral-500">
                            <Clock size={12} />
                            <span className="text-xs">
                              {event.startTime} - {event.endTime}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Tasks progress */}
                      {totalTasks > 0 && (
                        <div className="mt-auto pt-2">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-white/60 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(completedTasks / totalTasks) * 100}%` }}
                                className={`h-full rounded-full ${preset.color.replace('text-', 'bg-')}`}
                              />
                            </div>
                            <span className="text-[10px] text-neutral-500">
                              {completedTasks}/{totalTasks}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar with events list and tasks */}
      <div className="hidden lg:block w-80 border-l border-neutral-100 bg-neutral-50/50 overflow-y-auto">
        <div className="p-4">
          <h3 className="text-sm font-semibold text-neutral-800 mb-3">אירועי היום</h3>

          {dayEvents.length === 0 ? (
            <p className="text-sm text-neutral-500 text-center py-8">
              אין אירועים מתוכננים להיום
            </p>
          ) : (
            <div className="space-y-3">
              {dayEvents.map((event, index) => {
                const preset = CATEGORY_PRESETS[event.category]
                const Icon = preset.icon

                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-xl border border-neutral-100 shadow-sm p-3"
                  >
                    <div
                      className="flex items-start gap-2 cursor-pointer"
                      onClick={() => onEventClick(event)}
                    >
                      <div className={`p-1.5 rounded-lg ${preset.bgColor}`}>
                        <Icon size={14} className={preset.color} strokeWidth={2} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-neutral-800 truncate">
                          {event.title}
                        </h4>
                        <p className="text-xs text-neutral-500">
                          {event.startTime} - {event.endTime}
                        </p>
                      </div>
                    </div>

                    {/* Linked tasks */}
                    {event.linkedTasks.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-neutral-100 space-y-1">
                        {event.linkedTasks.map((task) => (
                          <button
                            key={task.id}
                            onClick={() => toggleTaskCompletion(event.id, task.id)}
                            className="w-full flex items-center gap-2 text-right group"
                          >
                            {task.completed ? (
                              <CheckCircle2
                                size={14}
                                className="text-emerald-500 flex-shrink-0"
                              />
                            ) : (
                              <Circle
                                size={14}
                                className="text-neutral-300 group-hover:text-neutral-400 flex-shrink-0"
                              />
                            )}
                            <span
                              className={`text-xs ${
                                task.completed
                                  ? 'text-neutral-400 line-through'
                                  : 'text-neutral-600'
                              }`}
                            >
                              {task.title}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
