'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { CalendarEvent, CATEGORY_PRESETS } from '@/types/calendar'
import { useCalendarStore } from '@/stores/calendarStore'

interface WeekViewProps {
  onEventClick: (event: CalendarEvent) => void
  onTimeSlotClick: (date: Date, time: string) => void
}

const HEBREW_DAYS_FULL = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']
const HOURS = Array.from({ length: 24 }, (_, i) => i)

export default function WeekView({ onEventClick, onTimeSlotClick }: WeekViewProps) {
  const { selectedDate, events, setSelectedDate } = useCalendarStore()

  const weekDays = useMemo(() => {
    const startOfWeek = new Date(selectedDate)
    const dayOfWeek = startOfWeek.getDay()
    startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek)

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek)
      date.setDate(date.getDate() + i)
      return date
    })
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

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header with days */}
      <div className="flex border-b border-neutral-100 bg-white sticky top-0 z-10">
        {/* Time column header */}
        <div className="w-16 flex-shrink-0" />

        {/* Day headers */}
        {weekDays.map((date, index) => {
          const isTodayDate = isToday(date)
          return (
            <div
              key={index}
              className={`flex-1 py-3 text-center border-l border-neutral-100 ${
                index === 6 ? 'bg-neutral-50/50' : ''
              }`}
            >
              <div className={`text-xs font-medium ${index === 6 ? 'text-accent-600' : 'text-neutral-500'}`}>
                {HEBREW_DAYS_FULL[index]}
              </div>
              <div
                className={`
                  mt-1 w-8 h-8 mx-auto flex items-center justify-center rounded-full text-sm font-semibold
                  ${isTodayDate ? 'bg-accent-600 text-white' : 'text-neutral-800'}
                `}
              >
                {date.getDate()}
              </div>
            </div>
          )
        })}
      </div>

      {/* Scrollable time grid */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="flex min-h-[1440px]">
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

          {/* Day columns */}
          {weekDays.map((date, dayIndex) => {
            const dayEvents = getEventsForDay(date)
            return (
              <div
                key={dayIndex}
                className={`flex-1 relative border-l border-neutral-100 ${
                  dayIndex === 6 ? 'bg-neutral-50/30' : ''
                }`}
              >
                {/* Hour lines */}
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    className="absolute w-full border-t border-neutral-100 cursor-pointer hover:bg-neutral-50/50"
                    style={{ top: `${(hour / 24) * 100}%`, height: `${100 / 24}%` }}
                    onClick={() => onTimeSlotClick(date, formatHour(hour))}
                  />
                ))}

                {/* Events */}
                {dayEvents.map((event) => {
                  const preset = CATEGORY_PRESETS[event.category]
                  const position = getEventPosition(event)
                  const Icon = preset.icon

                  return (
                    <motion.button
                      key={event.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.02, zIndex: 20 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onEventClick(event)}
                      className={`
                        absolute inset-x-1 rounded-lg p-1.5 text-right overflow-hidden
                        ${preset.bgColor} ${preset.borderColor} border
                        shadow-sm hover:shadow-md transition-shadow cursor-pointer
                      `}
                      style={{
                        top: position.top,
                        height: position.height,
                        minHeight: '24px',
                      }}
                    >
                      <div className="flex items-start gap-1">
                        <Icon size={12} className={preset.color} strokeWidth={2} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-[10px] font-semibold truncate ${preset.color}`}>
                            {event.title}
                          </p>
                          <p className="text-[9px] text-neutral-500">
                            {event.startTime} - {event.endTime}
                          </p>
                        </div>
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
