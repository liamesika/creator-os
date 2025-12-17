'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Task, TaskStatus, TaskPriority, TASK_PRIORITY_LABELS } from '@/types/task'
import { EventCategory, CATEGORY_PRESETS } from '@/types/calendar'
import { useTasksStore } from '@/stores/tasksStore'
import { useCompaniesStore } from '@/stores/companiesStore'
import { useCalendarStore } from '@/stores/calendarStore'
import {
  Flag,
  X,
  Save,
  Sparkles,
  ChevronDown,
} from 'lucide-react'
import { toast } from 'sonner'

interface TaskFormSheetProps {
  isOpen: boolean
  onClose: () => void
  editingTask?: Task | null
  prefilledData?: Partial<Task>
}

export default function TaskFormSheet({
  isOpen,
  onClose,
  editingTask,
  prefilledData,
}: TaskFormSheetProps) {
  const { createTask, updateTask } = useTasksStore()
  const { getActiveCompanies } = useCompaniesStore()
  const { events } = useCalendarStore()
  const modalRef = useRef<HTMLDivElement>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<TaskStatus>('TODO')
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM')
  const [dueDate, setDueDate] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [category, setCategory] = useState<EventCategory | 'general'>('general')
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [eventId, setEventId] = useState<string | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const companies = getActiveCompanies()
  const upcomingEvents = events
    .filter((e) => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 10)

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.left = '0'
      document.body.style.right = '0'
      document.body.style.overflow = 'hidden'
    } else {
      const scrollY = document.body.style.top
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.left = ''
      document.body.style.right = ''
      document.body.style.overflow = ''
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1)
      }
    }

    return () => {
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.left = ''
      document.body.style.right = ''
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Handle escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    },
    [isOpen, onClose]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title)
      setDescription(editingTask.description || '')
      setStatus(editingTask.status)
      setPriority(editingTask.priority)
      setDueDate(
        editingTask.dueDate
          ? new Date(editingTask.dueDate).toISOString().split('T')[0]
          : ''
      )
      setScheduledAt(editingTask.scheduledAt || '')
      setCategory(editingTask.category || 'general')
      setCompanyId(editingTask.companyId || null)
      setEventId(editingTask.eventId || null)
      setShowAdvanced(!!editingTask.companyId || !!editingTask.eventId || !!editingTask.category)
    } else if (prefilledData) {
      setTitle(prefilledData.title || '')
      setDescription(prefilledData.description || '')
      setStatus(prefilledData.status || 'TODO')
      setPriority(prefilledData.priority || 'MEDIUM')
      setDueDate(
        prefilledData.dueDate
          ? new Date(prefilledData.dueDate).toISOString().split('T')[0]
          : ''
      )
      setScheduledAt(prefilledData.scheduledAt || '')
      setCategory(prefilledData.category || 'general')
      setCompanyId(prefilledData.companyId || null)
      setEventId(prefilledData.eventId || null)
      setShowAdvanced(!!prefilledData.companyId || !!prefilledData.eventId)
    } else {
      resetForm()
    }
  }, [editingTask, prefilledData, isOpen])

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setStatus('TODO')
    setPriority('MEDIUM')
    setDueDate('')
    setScheduledAt('')
    setCategory('general')
    setCompanyId(null)
    setEventId(null)
    setShowAdvanced(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast.error('יש להזין כותרת למשימה')
      return
    }

    const selectedCompany = companies.find((c) => c.id === companyId)
    const selectedEvent = events.find((e) => e.id === eventId)

    const taskData = {
      title: title.trim(),
      description: description.trim() || undefined,
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      scheduledAt: scheduledAt || undefined,
      category: category === 'general' ? undefined : category,
      companyId: companyId || undefined,
      companyNameSnapshot: selectedCompany?.name,
      eventId: eventId || undefined,
      eventTitleSnapshot: selectedEvent?.title,
    }

    if (editingTask) {
      updateTask(editingTask.id, taskData)
      toast.success('המשימה עודכנה בהצלחה')
    } else {
      createTask(taskData)
      toast.success('המשימה נוצרה בהצלחה')
    }

    onClose()
    resetForm()
  }

  const categoryOptions: Array<{ id: EventCategory | 'general'; label: string; icon: any }> = [
    { id: 'general', label: 'כללי', icon: Sparkles },
    ...Object.values(CATEGORY_PRESETS).map((preset) => ({
      id: preset.id,
      label: preset.label,
      icon: preset.icon,
    })),
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
            aria-hidden="true"
          />

          {/* Modal Container */}
          <div
            className="fixed inset-0 z-[101] flex items-end sm:items-center justify-center p-0 sm:p-6"
            style={{ height: '100dvh' }}
          >
            {/* Modal */}
            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, y: '100%', scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: '100%', scale: 0.95 }}
              transition={{
                type: 'spring',
                damping: 30,
                stiffness: 300,
              }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="task-modal-title"
              className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90dvh] sm:max-h-[calc(100dvh-48px)] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drag handle - mobile only */}
              <div className="sm:hidden flex-shrink-0 pt-3 pb-2 flex justify-center">
                <div className="w-12 h-1.5 bg-neutral-300 rounded-full" />
              </div>

              {/* Header */}
              <div className="flex-shrink-0 px-5 py-3 flex items-center justify-between border-b border-neutral-100">
                <h2 id="task-modal-title" className="text-lg font-semibold text-neutral-800">
                  {editingTask ? 'עריכת משימה' : 'משימה חדשה'}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-neutral-100 rounded-xl transition-colors -mr-2"
                  aria-label="Close modal"
                >
                  <X size={20} className="text-neutral-500" />
                </button>
              </div>

              {/* Scrollable Content */}
              <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                <div
                  className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4"
                  style={{ WebkitOverflowScrolling: 'touch' }}
                >
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      כותרת <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="מה צריך לעשות?"
                      autoFocus
                      className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 focus:border-accent-500 focus:ring-2 focus:ring-accent-100 transition-all text-right text-sm"
                      dir="rtl"
                    />
                  </div>

                  {/* Status & Priority - Compact Row */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Status */}
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        סטטוס
                      </label>
                      <div className="flex gap-1">
                        {(['TODO', 'DOING', 'DONE'] as TaskStatus[]).map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setStatus(s)}
                            className={`flex-1 px-2 py-2 rounded-lg border transition-all font-medium text-xs ${
                              status === s
                                ? 'border-accent-500 bg-accent-50 text-accent-700'
                                : 'border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300'
                            }`}
                          >
                            {s === 'TODO' ? 'לביצוע' : s === 'DOING' ? 'בתהליך' : 'הושלם'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Priority */}
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        עדיפות
                      </label>
                      <div className="flex gap-1">
                        {(['LOW', 'MEDIUM', 'HIGH'] as TaskPriority[]).map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setPriority(p)}
                            className={`flex-1 px-2 py-2 rounded-lg border transition-all flex items-center justify-center gap-1 ${
                              priority === p
                                ? 'border-accent-500 bg-accent-50'
                                : 'border-neutral-200 bg-white hover:border-neutral-300'
                            }`}
                          >
                            <Flag
                              size={12}
                              className={
                                p === 'HIGH'
                                  ? 'text-red-500'
                                  : p === 'MEDIUM'
                                  ? 'text-orange-500'
                                  : 'text-blue-500'
                              }
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Due Date and Time - Compact */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        תאריך יעד
                      </label>
                      <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-neutral-200 focus:border-accent-500 focus:ring-2 focus:ring-accent-100 transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        שעה
                      </label>
                      <input
                        type="time"
                        value={scheduledAt}
                        onChange={(e) => setScheduledAt(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-neutral-200 focus:border-accent-500 focus:ring-2 focus:ring-accent-100 transition-all text-sm"
                      />
                    </div>
                  </div>

                  {/* Description - Compact */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      תיאור
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="פרטים נוספים..."
                      rows={2}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-200 focus:border-accent-500 focus:ring-2 focus:ring-accent-100 transition-all text-right resize-none text-sm"
                      dir="rtl"
                    />
                  </div>

                  {/* Advanced Options Toggle */}
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-colors text-sm"
                  >
                    <span className="text-neutral-600 font-medium">אפשרויות נוספות</span>
                    <ChevronDown
                      size={18}
                      className={`text-neutral-400 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {/* Advanced Options */}
                  <AnimatePresence>
                    {showAdvanced && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4 overflow-hidden"
                      >
                        {/* Category */}
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                            קטגוריה
                          </label>
                          <div className="flex flex-wrap gap-1.5">
                            {categoryOptions.slice(0, 6).map((cat) => {
                              const Icon = cat.icon
                              return (
                                <button
                                  key={cat.id}
                                  type="button"
                                  onClick={() => setCategory(cat.id)}
                                  className={`px-2.5 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 text-xs ${
                                    category === cat.id
                                      ? 'border-accent-500 bg-accent-50 text-accent-700'
                                      : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
                                  }`}
                                >
                                  <Icon size={14} />
                                  {cat.label}
                                </button>
                              )
                            })}
                          </div>
                        </div>

                        {/* Company */}
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                            חברה / מותג
                          </label>
                          <select
                            value={companyId || ''}
                            onChange={(e) => setCompanyId(e.target.value || null)}
                            className="w-full px-3 py-2 rounded-xl border border-neutral-200 focus:border-accent-500 focus:ring-2 focus:ring-accent-100 transition-all text-right text-sm bg-white"
                            dir="rtl"
                          >
                            <option value="">ללא חברה</option>
                            {companies.map((company) => (
                              <option key={company.id} value={company.id}>
                                {company.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Event */}
                        {upcomingEvents.length > 0 && (
                          <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                              קישור לאירוע
                            </label>
                            <select
                              value={eventId || ''}
                              onChange={(e) => setEventId(e.target.value || null)}
                              className="w-full px-3 py-2 rounded-xl border border-neutral-200 focus:border-accent-500 focus:ring-2 focus:ring-accent-100 transition-all text-right text-sm bg-white"
                              dir="rtl"
                            >
                              <option value="">ללא אירוע</option>
                              {upcomingEvents.map((event) => (
                                <option key={event.id} value={event.id}>
                                  {event.title} - {new Date(event.date).toLocaleDateString('he-IL')}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Footer - Always visible with safe area */}
                <div className="flex-shrink-0 flex items-center gap-3 px-4 sm:px-5 py-3 border-t border-neutral-100 bg-white safe-area-bottom">
                  <button
                    type="button"
                    onClick={() => {
                      onClose()
                      resetForm()
                    }}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 text-neutral-600 font-medium hover:bg-neutral-50 transition-all text-sm"
                  >
                    ביטול
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-accent-600 text-white font-medium hover:bg-accent-700 transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-accent-500/20"
                  >
                    <Save size={16} />
                    {editingTask ? 'שמירה' : 'יצירה'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
