'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import { useCalendarStore } from '@/stores/calendarStore'
import { CalendarEvent } from '@/types/calendar'
import CalendarHeader from '@/components/calendar/CalendarHeader'
import MonthView from '@/components/calendar/MonthView'
import WeekView from '@/components/calendar/WeekView'
import DayView from '@/components/calendar/DayView'
import CreateEventModal from '@/components/calendar/CreateEventModal'
import EventDrawer from '@/components/calendar/EventDrawer'
import IntegrationCTA from '@/components/calendar/IntegrationCTA'

export default function CalendarPage() {
  const {
    currentView,
    selectedEvent,
    isCreateModalOpen,
    isEventDrawerOpen,
    openCreateModal,
    closeCreateModal,
    openEventDrawer,
    closeEventDrawer,
    setSelectedDate,
    setCurrentView,
  } = useCalendarStore()

  const [createModalDate, setCreateModalDate] = useState<Date | undefined>()
  const [createModalTime, setCreateModalTime] = useState<string | undefined>()

  const handleDateClick = useCallback((date: Date) => {
    setSelectedDate(date)
  }, [setSelectedDate])

  const handleEventClick = useCallback((event: CalendarEvent) => {
    openEventDrawer(event)
  }, [openEventDrawer])

  const handleTimeSlotClick = useCallback((date: Date, time: string) => {
    setCreateModalDate(date)
    setCreateModalTime(time)
    openCreateModal()
  }, [openCreateModal])

  const handleCreateEvent = useCallback(() => {
    setCreateModalDate(undefined)
    setCreateModalTime(undefined)
    openCreateModal()
  }, [openCreateModal])

  const handleCloseCreateModal = useCallback(() => {
    setCreateModalDate(undefined)
    setCreateModalTime(undefined)
    closeCreateModal()
  }, [closeCreateModal])

  return (
    <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <CalendarHeader onCreateEvent={handleCreateEvent} />
      </motion.div>

      {/* Integration CTA */}
      <IntegrationCTA />

      {/* Calendar container */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex-1 bg-white rounded-2xl border border-neutral-100 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08)] overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {currentView === 'month' && (
            <motion.div
              key="month"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <MonthView
                onDateClick={handleDateClick}
                onEventClick={handleEventClick}
              />
            </motion.div>
          )}

          {currentView === 'week' && (
            <motion.div
              key="week"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <WeekView
                onEventClick={handleEventClick}
                onTimeSlotClick={handleTimeSlotClick}
              />
            </motion.div>
          )}

          {currentView === 'day' && (
            <motion.div
              key="day"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <DayView
                onEventClick={handleEventClick}
                onTimeSlotClick={handleTimeSlotClick}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Mobile FAB */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 20 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleCreateEvent}
        className="sm:hidden fixed bottom-24 left-6 w-14 h-14 bg-accent-600 hover:bg-accent-700 text-white rounded-full shadow-lg shadow-accent-500/30 flex items-center justify-center z-40"
      >
        <Plus size={24} strokeWidth={2.5} />
      </motion.button>

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        initialDate={createModalDate}
        initialTime={createModalTime}
      />

      {/* Event Details Drawer */}
      <EventDrawer
        isOpen={isEventDrawerOpen}
        onClose={closeEventDrawer}
        event={selectedEvent}
      />
    </div>
  )
}
