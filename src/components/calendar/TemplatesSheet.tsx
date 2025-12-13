'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronRight, Clock, Calendar, Sparkles, Plus, Minus } from 'lucide-react'
import { CALENDAR_TEMPLATES, type CalendarTemplate, type TemplateItem } from '@/types/calendar-template'
import { useCompaniesStore } from '@/stores/companiesStore'
import { useCalendarStore } from '@/stores/calendarStore'
import { useTasksStore } from '@/stores/tasksStore'
import { useFreemiumLimits } from '@/hooks/useFreemiumLimits'
import { CATEGORY_PRESETS } from '@/types/calendar'
import { toast } from 'sonner'
import { logActivity } from '@/lib/activity-logger'

interface TemplatesSheetProps {
  isOpen: boolean
  onClose: () => void
  initialDate?: Date
}

export default function TemplatesSheet({ isOpen, onClose, initialDate }: TemplatesSheetProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<CalendarTemplate | null>(null)
  const [selectedDate, setSelectedDate] = useState(initialDate || new Date())
  const [timeShift, setTimeShift] = useState(0) // minutes
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null)
  const [isApplying, setIsApplying] = useState(false)

  const { getActiveCompanies } = useCompaniesStore()
  const { addEvent } = useCalendarStore()
  const { createTask } = useTasksStore()
  const { canAddEvent } = useFreemiumLimits()

  const activeCompanies = getActiveCompanies()
  const selectedCompany = activeCompanies.find((c) => c.id === selectedCompanyId)

  const handleApplyTemplate = async () => {
    if (!selectedTemplate) return

    // Check freemium limits
    if (!canAddEvent) {
      toast.error('הגעת למגבלת האירועים החינמית. שדרגי לפרימיום!')
      return
    }

    setIsApplying(true)

    try {
      const baseDate = new Date(selectedDate)
      const eventsCreated: string[] = []

      for (let i = 0; i < selectedTemplate.items.length; i++) {
        const item = selectedTemplate.items[i]
        const eventDate = new Date(baseDate)

        // For week templates, distribute across days
        if (selectedTemplate.scope === 'WEEK') {
          const dayOffset = Math.floor(i / 2) // Spread events across days
          eventDate.setDate(eventDate.getDate() + dayOffset)
        }

        // Apply time shift
        const [hours, minutes] = item.startTime.split(':').map(Number)
        const shiftedMinutes = hours * 60 + minutes + timeShift
        const shiftedHours = Math.floor(shiftedMinutes / 60) % 24
        const finalMinutes = shiftedMinutes % 60

        const startTime = `${String(shiftedHours).padStart(2, '0')}:${String(finalMinutes).padStart(2, '0')}`
        const endHours = Math.floor((shiftedMinutes + item.durationMinutes) / 60) % 24
        const endMinutes = (shiftedMinutes + item.durationMinutes) % 60
        const endTime = `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`

        // Create event
        const event = await addEvent({
          category: item.category,
          title: item.title,
          date: eventDate,
          startTime,
          endTime,
          isAllDay: false,
          companyId: selectedCompanyId || undefined,
          reminders: item.reminders.map((mins) => ({
            id: Math.random().toString(36).substring(7),
            minutesBefore: mins,
            isCustom: false,
          })),
          linkedTasks: [],
        })

        if (event) {
          eventsCreated.push(event.id)

          // Create linked tasks
          for (const taskTitle of item.linkedTasks) {
            await createTask({
              title: taskTitle,
              status: 'TODO',
              priority: 'MEDIUM',
              dueDate: eventDate,
              companyId: selectedCompanyId || undefined,
              eventId: event.id,
            })
          }
        }
      }

      // Log activity
      logActivity(
        'template_applied',
        selectedTemplate.id,
        selectedTemplate.name,
        {
          eventsCount: eventsCreated.length,
          scope: selectedTemplate.scope,
          companyId: selectedCompanyId,
        }
      )

      toast.success(`${selectedTemplate.name} הופעלה בהצלחה!`)
      onClose()
      setSelectedTemplate(null)
    } catch (error) {
      console.error('Failed to apply template:', error)
      toast.error('שגיאה בהפעלת התבנית')
    } finally {
      setIsApplying(false)
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('he-IL', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    })
  }

  const shiftTime = (time: string, shiftMinutes: number): string => {
    const [hours, minutes] = time.split(':').map(Number)
    const totalMinutes = hours * 60 + minutes + shiftMinutes
    const h = Math.floor(totalMinutes / 60) % 24
    const m = totalMinutes % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => {
              if (!selectedTemplate) onClose()
            }}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-200">
              <h2 className="text-lg font-bold text-neutral-900">
                {selectedTemplate ? selectedTemplate.name : 'תבניות יומן'}
              </h2>
              <button
                onClick={() => {
                  if (selectedTemplate) {
                    setSelectedTemplate(null)
                  } else {
                    onClose()
                  }
                }}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                {selectedTemplate ? <ChevronRight size={20} /> : <X size={20} />}
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {!selectedTemplate ? (
                /* Template List */
                <div className="p-4 space-y-3">
                  {CALENDAR_TEMPLATES.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template)}
                      className="w-full text-right p-4 bg-neutral-50 hover:bg-neutral-100 rounded-xl transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-3xl">{template.icon}</div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-neutral-900 mb-1">
                            {template.name}
                          </h3>
                          <p className="text-sm text-neutral-600 mb-2">
                            {template.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-neutral-500">
                            <span className="flex items-center gap-1">
                              <Calendar size={14} />
                              {template.scope === 'DAY' ? 'יום אחד' : 'שבוע שלם'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={14} />
                              {template.items.length} אירועים
                            </span>
                          </div>
                        </div>
                        <ChevronRight size={20} className="text-neutral-400 transform rotate-180" />
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                /* Template Preview */
                <div className="p-4 space-y-6">
                  {/* Date Picker */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      תאריך התחלה
                    </label>
                    <input
                      type="date"
                      value={selectedDate.toISOString().split('T')[0]}
                      onChange={(e) => setSelectedDate(new Date(e.target.value + 'T00:00:00'))}
                      className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {/* Time Shift */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      הזזת שעות
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setTimeShift((prev) => prev - 30)}
                        className="p-3 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                      >
                        <Minus size={18} />
                      </button>
                      <div className="flex-1 text-center">
                        <span className="text-lg font-semibold text-neutral-900">
                          {timeShift === 0 ? 'ללא הזזה' : `${Math.abs(timeShift)} דקות ${timeShift > 0 ? 'קדימה' : 'אחורה'}`}
                        </span>
                      </div>
                      <button
                        onClick={() => setTimeShift((prev) => prev + 30)}
                        className="p-3 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Company Selection */}
                  {activeCompanies.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        קישור לחברה (אופציונלי)
                      </label>
                      <select
                        value={selectedCompanyId || ''}
                        onChange={(e) => setSelectedCompanyId(e.target.value || null)}
                        className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">ללא חברה</option>
                        {activeCompanies.map((company) => (
                          <option key={company.id} value={company.id}>
                            {company.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Events Preview */}
                  <div>
                    <h3 className="text-sm font-medium text-neutral-700 mb-3">
                      תצוגה מקדימה ({selectedTemplate.items.length} אירועים)
                    </h3>
                    <div className="space-y-2">
                      {selectedTemplate.items.map((item, index) => {
                        const categoryPreset = CATEGORY_PRESETS[item.category]
                        const CategoryIcon = categoryPreset.icon
                        const eventDate = new Date(selectedDate)
                        if (selectedTemplate.scope === 'WEEK') {
                          eventDate.setDate(eventDate.getDate() + Math.floor(index / 2))
                        }

                        return (
                          <div
                            key={index}
                            className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg"
                          >
                            <div className={`p-2 rounded-lg ${categoryPreset.bgColor}`}>
                              <CategoryIcon size={16} className={categoryPreset.color} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-neutral-900 truncate">
                                {item.title}
                              </p>
                              <p className="text-xs text-neutral-500">
                                {formatDate(eventDate)} • {shiftTime(item.startTime, timeShift)} ({item.durationMinutes} דק')
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer - Apply Button */}
            {selectedTemplate && (
              <div className="p-4 border-t border-neutral-200 bg-white">
                <button
                  onClick={handleApplyTemplate}
                  disabled={isApplying}
                  className="w-full py-4 bg-purple-600 hover:bg-purple-700 disabled:bg-neutral-300 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {isApplying ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <Sparkles size={20} />
                      <span>הפעל תבנית</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
