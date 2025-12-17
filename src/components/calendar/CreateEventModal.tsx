'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Calendar,
  Clock,
  Bell,
  ListTodo,
  FileText,
  Plus,
  Trash2,
  Building2,
  Search,
  ChevronDown,
} from 'lucide-react'
import {
  EventCategory,
  CATEGORY_PRESETS,
  CalendarReminder,
  LinkedTask,
  generateId,
  createDefaultReminders,
  createLinkedTasks,
  addMinutesToTime,
  formatReminderLabel,
} from '@/types/calendar'
import { BRAND_TYPE_PRESETS, PAYMENT_MODEL_LABELS } from '@/types/company'
import { useCalendarStore } from '@/stores/calendarStore'
import { useCompaniesStore } from '@/stores/companiesStore'

interface CreateEventModalProps {
  isOpen: boolean
  onClose: () => void
  initialDate?: Date
  initialTime?: string
  initialCompanyId?: string
}

export default function CreateEventModal({
  isOpen,
  onClose,
  initialDate,
  initialTime,
  initialCompanyId,
}: CreateEventModalProps) {
  const { addEvent, selectedDate } = useCalendarStore()
  const { companies, getActiveCompanies } = useCompaniesStore()

  const [selectedCategory, setSelectedCategory] = useState<EventCategory | null>(null)
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [isAllDay, setIsAllDay] = useState(false)
  const [notes, setNotes] = useState('')
  const [reminders, setReminders] = useState<CalendarReminder[]>([])
  const [linkedTasks, setLinkedTasks] = useState<LinkedTask[]>([])
  const [newTaskTitle, setNewTaskTitle] = useState('')

  // Company selection
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null)
  const [companySearchQuery, setCompanySearchQuery] = useState('')
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false)

  const activeCompanies = useMemo(() => getActiveCompanies(), [companies])

  const filteredCompanies = useMemo(() => {
    if (!companySearchQuery.trim()) return activeCompanies
    const query = companySearchQuery.toLowerCase()
    return activeCompanies.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.contactName?.toLowerCase().includes(query)
    )
  }, [activeCompanies, companySearchQuery])

  const selectedCompany = useMemo(
    () => companies.find((c) => c.id === selectedCompanyId),
    [companies, selectedCompanyId]
  )

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      const targetDate = initialDate || selectedDate
      setDate(targetDate.toISOString().split('T')[0])
      setStartTime(initialTime || '09:00')
      setEndTime(initialTime ? addMinutesToTime(initialTime, 60) : '10:00')
      setSelectedCategory(null)
      setTitle('')
      setIsAllDay(false)
      setNotes('')
      setReminders([])
      setLinkedTasks([])
      setNewTaskTitle('')
      setSelectedCompanyId(initialCompanyId || null)
      setCompanySearchQuery('')
      setIsCompanyDropdownOpen(false)
    }
  }, [isOpen, initialDate, initialTime, initialCompanyId, selectedDate])

  // Update form when category is selected
  useEffect(() => {
    if (selectedCategory) {
      const preset = CATEGORY_PRESETS[selectedCategory]
      if (!title) {
        setTitle(preset.label)
      }
      setEndTime(addMinutesToTime(startTime, preset.defaultDuration))
      setReminders(createDefaultReminders(preset))
      setLinkedTasks(createLinkedTasks(preset))
    }
  }, [selectedCategory])

  const handleAddReminder = (minutes: number) => {
    if (!reminders.find((r) => r.minutesBefore === minutes)) {
      setReminders([
        ...reminders,
        { id: generateId(), minutesBefore: minutes, isCustom: true },
      ])
    }
  }

  const handleRemoveReminder = (id: string) => {
    setReminders(reminders.filter((r) => r.id !== id))
  }

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      setLinkedTasks([
        ...linkedTasks,
        {
          id: generateId(),
          title: newTaskTitle.trim(),
          completed: false,
          createdAt: new Date(),
        },
      ])
      setNewTaskTitle('')
    }
  }

  const handleRemoveTask = (id: string) => {
    setLinkedTasks(linkedTasks.filter((t) => t.id !== id))
  }

  const handleSelectCompany = (companyId: string | null) => {
    setSelectedCompanyId(companyId)
    setIsCompanyDropdownOpen(false)
    setCompanySearchQuery('')
  }

  const handleSubmit = () => {
    if (!selectedCategory || !title || !date) return

    addEvent({
      category: selectedCategory,
      title,
      date: new Date(date),
      startTime,
      endTime,
      isAllDay,
      reminders,
      linkedTasks,
      notes: notes || undefined,
      companyId: selectedCompanyId,
      companyNameSnapshot: selectedCompany?.name,
    })

    onClose()
  }

  const REMINDER_OPTIONS = [15, 30, 60, 120, 1440] // 15min, 30min, 1hr, 2hr, 1day

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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            aria-hidden="true"
          />

          {/* Modal Container - centers the modal */}
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
            style={{ height: '100dvh' }}
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, y: '100%', scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: '100%', scale: 0.95 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="create-event-title"
              className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[calc(100dvh-env(safe-area-inset-top))] sm:max-h-[calc(100dvh-48px)] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-neutral-800">יצירת אירוע חדש</h2>
                {selectedCompany && (
                  <span className="text-xs font-medium text-violet-600 bg-violet-100 px-2 py-0.5 rounded-full">
                    {selectedCompany.name}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-neutral-100 rounded-xl transition-colors"
              >
                <X size={20} className="text-neutral-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Category selection */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  סוג האירוע
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.values(CATEGORY_PRESETS).map((preset) => {
                    const Icon = preset.icon
                    const isSelected = selectedCategory === preset.id
                    return (
                      <motion.button
                        key={preset.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedCategory(preset.id)}
                        className={`
                          flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all
                          ${isSelected
                            ? `${preset.bgColor} ${preset.borderColor}`
                            : 'border-neutral-200 hover:border-neutral-300'
                          }
                        `}
                      >
                        <Icon
                          size={20}
                          className={isSelected ? preset.color : 'text-neutral-400'}
                          strokeWidth={isSelected ? 2 : 1.5}
                        />
                        <span
                          className={`text-xs font-medium ${
                            isSelected ? preset.color : 'text-neutral-600'
                          }`}
                        >
                          {preset.label}
                        </span>
                      </motion.button>
                    )
                  })}
                </div>
              </div>

              {/* Company selection */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  <Building2 size={14} className="inline ml-1" />
                  חברה (אופציונלי)
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsCompanyDropdownOpen(!isCompanyDropdownOpen)}
                    className="w-full flex items-center justify-between px-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all bg-white"
                  >
                    {selectedCompany ? (
                      <div className="flex items-center gap-2">
                        {selectedCompany.brandType && BRAND_TYPE_PRESETS[selectedCompany.brandType] && (
                          <div className={`p-1 rounded ${BRAND_TYPE_PRESETS[selectedCompany.brandType].bgColor}`}>
                            {(() => {
                              const Icon = BRAND_TYPE_PRESETS[selectedCompany.brandType!].icon
                              return <Icon size={14} className={BRAND_TYPE_PRESETS[selectedCompany.brandType!].color} />
                            })()}
                          </div>
                        )}
                        <span className="text-sm text-neutral-800">{selectedCompany.name}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-neutral-400">ללא חברה</span>
                    )}
                    <ChevronDown
                      size={16}
                      className={`text-neutral-400 transition-transform ${isCompanyDropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {/* Dropdown */}
                  <AnimatePresence>
                    {isCompanyDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="absolute z-20 top-full mt-1 w-full bg-white border border-neutral-200 rounded-xl shadow-lg overflow-hidden"
                      >
                        {/* Search */}
                        <div className="p-2 border-b border-neutral-100">
                          <div className="relative">
                            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                            <input
                              type="text"
                              value={companySearchQuery}
                              onChange={(e) => setCompanySearchQuery(e.target.value)}
                              placeholder="חיפוש חברה..."
                              className="w-full pr-9 pl-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-accent-500"
                              autoFocus
                            />
                          </div>
                        </div>

                        {/* Options */}
                        <div className="max-h-48 overflow-y-auto">
                          {/* No company option */}
                          <button
                            type="button"
                            onClick={() => handleSelectCompany(null)}
                            className={`w-full flex items-center gap-2 px-4 py-2.5 text-right hover:bg-neutral-50 transition-colors ${
                              !selectedCompanyId ? 'bg-accent-50' : ''
                            }`}
                          >
                            <div className="p-1 rounded bg-neutral-100">
                              <X size={14} className="text-neutral-400" />
                            </div>
                            <span className="text-sm text-neutral-600">ללא חברה</span>
                          </button>

                          {filteredCompanies.map((company) => {
                            const brandPreset = company.brandType
                              ? BRAND_TYPE_PRESETS[company.brandType]
                              : null
                            const BrandIcon = brandPreset?.icon || Building2

                            return (
                              <button
                                key={company.id}
                                type="button"
                                onClick={() => handleSelectCompany(company.id)}
                                className={`w-full flex items-center gap-2 px-4 py-2.5 text-right hover:bg-neutral-50 transition-colors ${
                                  selectedCompanyId === company.id ? 'bg-accent-50' : ''
                                }`}
                              >
                                <div className={`p-1 rounded ${brandPreset?.bgColor || 'bg-neutral-100'}`}>
                                  <BrandIcon size={14} className={brandPreset?.color || 'text-neutral-400'} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-neutral-800 truncate">{company.name}</p>
                                  <p className="text-[10px] text-neutral-400">
                                    {PAYMENT_MODEL_LABELS[company.paymentTerms.paymentModel]}
                                  </p>
                                </div>
                              </button>
                            )
                          })}

                          {filteredCompanies.length === 0 && companySearchQuery && (
                            <div className="px-4 py-3 text-center text-sm text-neutral-500">
                              לא נמצאו חברות
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  כותרת
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="שם האירוע..."
                  className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all"
                />
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    <Calendar size={14} className="inline ml-1" />
                    תאריך
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all"
                  />
                </div>

                {!isAllDay && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        <Clock size={14} className="inline ml-1" />
                        שעת התחלה
                      </label>
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all"
                      />
                    </div>
                  </>
                )}
              </div>

              {!isAllDay && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      שעת סיום
                    </label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all"
                    />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isAllDay}
                        onChange={(e) => setIsAllDay(e.target.checked)}
                        className="w-4 h-4 text-accent-600 rounded focus:ring-accent-500"
                      />
                      <span className="text-sm text-neutral-600">כל היום</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Reminders */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  <Bell size={14} className="inline ml-1" />
                  תזכורות
                </label>
                <div className="space-y-2">
                  {reminders.map((reminder) => (
                    <div
                      key={reminder.id}
                      className="flex items-center justify-between px-3 py-2 bg-neutral-50 rounded-lg"
                    >
                      <span className="text-sm text-neutral-600">
                        {formatReminderLabel(reminder.minutesBefore)}
                      </span>
                      <button
                        onClick={() => handleRemoveReminder(reminder.id)}
                        className="p-1 hover:bg-neutral-200 rounded-lg transition-colors"
                      >
                        <X size={14} className="text-neutral-400" />
                      </button>
                    </div>
                  ))}

                  <div className="flex flex-wrap gap-2">
                    {REMINDER_OPTIONS.filter(
                      (mins) => !reminders.find((r) => r.minutesBefore === mins)
                    ).map((mins) => (
                      <button
                        key={mins}
                        onClick={() => handleAddReminder(mins)}
                        className="px-3 py-1.5 text-xs font-medium text-neutral-500 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                      >
                        + {formatReminderLabel(mins)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Linked Tasks */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  <ListTodo size={14} className="inline ml-1" />
                  משימות מקושרות
                </label>
                <div className="space-y-2">
                  {linkedTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between px-3 py-2 bg-neutral-50 rounded-lg"
                    >
                      <span className="text-sm text-neutral-600">{task.title}</span>
                      <button
                        onClick={() => handleRemoveTask(task.id)}
                        className="p-1 hover:bg-neutral-200 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} className="text-neutral-400" />
                      </button>
                    </div>
                  ))}

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                      placeholder="הוסף משימה..."
                      className="flex-1 px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500"
                    />
                    <button
                      onClick={handleAddTask}
                      disabled={!newTaskTitle.trim()}
                      className="px-3 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  <FileText size={14} className="inline ml-1" />
                  הערות
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="הערות נוספות..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all resize-none"
                />
              </div>
            </div>

            {/* Footer - Sticky with safe area */}
            <div className="flex-shrink-0 flex items-center justify-end gap-3 px-4 sm:px-5 py-3 border-t border-neutral-100 bg-white safe-area-bottom">
              <button
                onClick={onClose}
                className="px-4 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors"
              >
                ביטול
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={!selectedCategory || !title || !date}
                className="px-6 py-2.5 text-sm font-medium text-white bg-accent-600 hover:bg-accent-700 rounded-xl shadow-lg shadow-accent-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                יצירת אירוע
              </motion.button>
            </div>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
