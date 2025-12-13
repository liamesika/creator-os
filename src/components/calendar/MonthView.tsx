'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { CalendarEvent, CATEGORY_PRESETS } from '@/types/calendar'
import { useCalendarStore } from '@/stores/calendarStore'

interface MonthViewProps {
  onDateClick: (date: Date) => void
  onEventClick: (event: CalendarEvent) => void
}

const HEBREW_DAYS = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳']
const HEBREW_MONTHS = [
  'ינואר',
  'פברואר',
  'מרץ',
  'אפריל',
  'מאי',
  'יוני',
  'יולי',
  'אוגוסט',
  'ספטמבר',
  'אוקטובר',
  'נובמבר',
  'דצמבר',
]

export default function MonthView({ onDateClick, onEventClick }: MonthViewProps) {
  const { selectedDate, events, setSelectedDate, setCurrentView } = useCalendarStore()

  const calendarDays = useMemo(() => {
    const year = selectedDate.getFullYear()
    const month = selectedDate.getMonth()

    // First day of month
    const firstDay = new Date(year, month, 1)
    // Last day of month
    const lastDay = new Date(year, month + 1, 0)

    // Day of week for first day (0 = Sunday)
    const startDayOfWeek = firstDay.getDay()

    // Create array of days
    const days: Array<{ date: Date; isCurrentMonth: boolean }> = []

    // Add days from previous month
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month, -i)
      days.push({ date, isCurrentMonth: false })
    }

    // Add days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true })
    }

    // Add days from next month to complete the grid
    const remainingDays = 42 - days.length // 6 rows × 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false })
    }

    return days
  }, [selectedDate])

  const getEventsForDay = (date: Date): CalendarEvent[] => {
    return events.filter((event) => {
      const eventDate = new Date(event.date)
      return (
        eventDate.getFullYear() === date.getFullYear() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getDate() === date.getDate()
      )
    })
  }

  const isToday = (date: Date): boolean => {
    const today = new Date()
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    )
  }

  const isSelected = (date: Date): boolean => {
    return (
      date.getFullYear() === selectedDate.getFullYear() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getDate() === selectedDate.getDate()
    )
  }

  const handleDayClick = (date: Date) => {
    setSelectedDate(date)
    onDateClick(date)
  }

  const handleViewMore = (date: Date) => {
    setSelectedDate(date)
    setCurrentView('day')
  }

  return (
    <div className="h-full flex flex-col">
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-neutral-100">
        {HEBREW_DAYS.map((day, index) => (
          <div
            key={day}
            className={`py-3 text-center text-xs font-medium ${
              index === 6 ? 'text-accent-600' : 'text-neutral-500'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="flex-1 grid grid-cols-7 grid-rows-6">
        {calendarDays.map((dayInfo, index) => {
          const dayEvents = getEventsForDay(dayInfo.date)
          const visibleEvents = dayEvents.slice(0, 2)
          const hiddenCount = dayEvents.length - visibleEvents.length
          const isTodayDate = isToday(dayInfo.date)
          const isSelectedDate = isSelected(dayInfo.date)

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.005 }}
              onClick={() => handleDayClick(dayInfo.date)}
              className={`
                min-h-[100px] p-1.5 border-b border-l border-neutral-100 cursor-pointer
                transition-colors duration-200 hover:bg-neutral-50
                ${!dayInfo.isCurrentMonth ? 'bg-neutral-50/50' : 'bg-white'}
                ${isSelectedDate ? 'bg-accent-50/50' : ''}
              `}
            >
              {/* Day number */}
              <div className="flex items-center justify-center mb-1">
                <span
                  className={`
                    w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium
                    transition-colors duration-200
                    ${isTodayDate
                      ? 'bg-accent-600 text-white'
                      : dayInfo.isCurrentMonth
                        ? 'text-neutral-800'
                        : 'text-neutral-400'
                    }
                    ${isSelectedDate && !isTodayDate ? 'bg-accent-100 text-accent-700' : ''}
                  `}
                >
                  {dayInfo.date.getDate()}
                </span>
              </div>

              {/* Events */}
              <div className="space-y-0.5">
                {visibleEvents.map((event) => {
                  const preset = CATEGORY_PRESETS[event.category]
                  return (
                    <motion.button
                      key={event.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        onEventClick(event)
                      }}
                      className={`
                        w-full text-right px-1.5 py-0.5 rounded text-[10px] font-medium truncate
                        ${preset.bgColor} ${preset.color} ${preset.borderColor} border
                        hover:shadow-sm transition-shadow
                      `}
                    >
                      <span className="hidden sm:inline">{event.startTime} </span>
                      {event.title}
                    </motion.button>
                  )
                })}

                {hiddenCount > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleViewMore(dayInfo.date)
                    }}
                    className="w-full text-center text-[10px] font-medium text-accent-600 hover:text-accent-700 py-0.5"
                  >
                    +{hiddenCount} עוד
                  </button>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
