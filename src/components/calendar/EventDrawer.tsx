'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Calendar,
  Clock,
  Bell,
  ListTodo,
  FileText,
  Trash2,
  Edit3,
  CheckCircle2,
  Circle,
  ChevronLeft,
  Sparkles,
  Building2,
  Archive,
  ExternalLink,
  Plus,
} from 'lucide-react'
import {
  CalendarEvent,
  CATEGORY_PRESETS,
  formatReminderLabel,
} from '@/types/calendar'
import { BRAND_TYPE_PRESETS, PAYMENT_MODEL_LABELS } from '@/types/company'
import { useCalendarStore } from '@/stores/calendarStore'
import { useCompaniesStore } from '@/stores/companiesStore'
import { useTasksStore } from '@/stores/tasksStore'
import { toast } from 'sonner'

interface EventDrawerProps {
  isOpen: boolean
  onClose: () => void
  event: CalendarEvent | null
  onEdit?: (event: CalendarEvent) => void
}

const HEBREW_DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']
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

export default function EventDrawer({
  isOpen,
  onClose,
  event,
  onEdit,
}: EventDrawerProps) {
  const { deleteEvent, toggleTaskCompletion, setEventCompany } = useCalendarStore()
  const { companies, openProfileDrawer } = useCompaniesStore()
  const { openCreateModal } = useTasksStore()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const linkedCompany = useMemo(() => {
    if (!event?.companyId) return null
    return companies.find((c) => c.id === event.companyId)
  }, [companies, event?.companyId])

  if (!event) return null

  const preset = CATEGORY_PRESETS[event.category]
  const Icon = preset.icon
  const eventDate = new Date(event.date)

  const formatDate = (date: Date): string => {
    const day = HEBREW_DAYS[date.getDay()]
    const dateNum = date.getDate()
    const month = HEBREW_MONTHS[date.getMonth()]
    const year = date.getFullYear()
    return `יום ${day}, ${dateNum} ${month} ${year}`
  }

  const completedTasks = event.linkedTasks.filter((t) => t.completed).length
  const totalTasks = event.linkedTasks.length
  const progressPercent = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  const handleDelete = () => {
    deleteEvent(event.id)
    setShowDeleteConfirm(false)
    onClose()
  }

  const handleOpenCompanyProfile = () => {
    if (linkedCompany) {
      onClose()
      openProfileDrawer(linkedCompany)
    }
  }

  const handleRemoveCompany = () => {
    setEventCompany(event.id, null)
  }

  const handleCreateLinkedTask = () => {
    openCreateModal({
      title: `משימה עבור: ${event.title}`,
      eventId: event.id,
      eventTitleSnapshot: event.title,
      companyId: event.companyId,
      companyNameSnapshot: linkedCompany?.name,
      category: event.category,
      dueDate: event.date,
      priority: 'MEDIUM',
      status: 'TODO',
    })
    onClose()
    toast.success('נפתח טופס משימה חדשה')
  }

  const brandPreset = linkedCompany?.brandType
    ? BRAND_TYPE_PRESETS[linkedCompany.brandType]
    : null
  const BrandIcon = brandPreset?.icon || Building2
  const isCompanyArchived = linkedCompany?.status === 'ARCHIVED'

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
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 left-0 bottom-0 w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className={`${preset.bgColor} px-5 py-6`}>
              <div className="flex items-start justify-between mb-4">
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <ChevronLeft size={20} className={preset.color} />
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEdit?.(event)}
                    className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                  >
                    <Edit3 size={18} className={preset.color} />
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                  >
                    <Trash2 size={18} className="text-red-500" />
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className={`p-3 rounded-xl bg-white/60`}>
                  <Icon size={24} className={preset.color} strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <span
                    className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${preset.color} bg-white/60 mb-1`}
                  >
                    {preset.label}
                  </span>
                  <h2 className="text-xl font-bold text-neutral-800">{event.title}</h2>
                </div>
              </div>

              {/* Company badge in header */}
              {(linkedCompany || event.companyNameSnapshot) && (
                <div className="mt-3">
                  <button
                    onClick={linkedCompany ? handleOpenCompanyProfile : undefined}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/70 hover:bg-white/90 transition-colors ${
                      linkedCompany ? 'cursor-pointer' : 'cursor-default'
                    }`}
                  >
                    <BrandIcon size={14} className={brandPreset?.color || 'text-neutral-500'} />
                    <span className="text-sm font-medium text-neutral-700">
                      {linkedCompany?.name || event.companyNameSnapshot}
                    </span>
                    {isCompanyArchived && (
                      <span className="text-[9px] font-medium text-neutral-500 bg-neutral-200 px-1 py-0.5 rounded">
                        <Archive size={8} className="inline" /> בארכיון
                      </span>
                    )}
                    {linkedCompany && <ExternalLink size={12} className="text-neutral-400" />}
                  </button>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Date & Time */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-neutral-100 rounded-lg">
                    <Calendar size={16} className="text-neutral-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-800">
                      {formatDate(eventDate)}
                    </p>
                  </div>
                </div>

                {!event.isAllDay && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-neutral-100 rounded-lg">
                      <Clock size={16} className="text-neutral-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-800">
                        {event.startTime} - {event.endTime}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Company Info Card */}
              {linkedCompany && (
                <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-4 border border-violet-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Building2 size={14} className="text-violet-500" />
                      <span className="text-sm font-semibold text-violet-700">חברה מקושרת</span>
                    </div>
                    <button
                      onClick={handleRemoveCompany}
                      className="text-xs text-neutral-500 hover:text-neutral-700"
                    >
                      הסר
                    </button>
                  </div>
                  <button
                    onClick={handleOpenCompanyProfile}
                    className="w-full flex items-center gap-3 p-3 bg-white/80 hover:bg-white rounded-lg transition-colors"
                  >
                    <div className={`p-2 rounded-lg ${brandPreset?.bgColor || 'bg-neutral-100'}`}>
                      <BrandIcon size={16} className={brandPreset?.color || 'text-neutral-500'} />
                    </div>
                    <div className="flex-1 text-right">
                      <p className="text-sm font-medium text-neutral-800">{linkedCompany.name}</p>
                      <p className="text-xs text-neutral-500">
                        {PAYMENT_MODEL_LABELS[linkedCompany.paymentTerms.paymentModel]}
                      </p>
                    </div>
                    <ExternalLink size={14} className="text-neutral-400" />
                  </button>
                </div>
              )}

              {/* Reminders */}
              {event.reminders.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Bell size={16} className="text-neutral-400" />
                    <h3 className="text-sm font-semibold text-neutral-700">תזכורות</h3>
                  </div>
                  <div className="space-y-2">
                    {event.reminders.map((reminder) => (
                      <div
                        key={reminder.id}
                        className="flex items-center gap-2 px-3 py-2 bg-neutral-50 rounded-lg"
                      >
                        <Bell size={14} className="text-neutral-400" />
                        <span className="text-sm text-neutral-600">
                          {formatReminderLabel(reminder.minutesBefore)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Linked Tasks */}
              {event.linkedTasks.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <ListTodo size={16} className="text-neutral-400" />
                      <h3 className="text-sm font-semibold text-neutral-700">
                        משימות מקושרות
                      </h3>
                    </div>
                    <span className="text-xs text-neutral-500">
                      {completedTasks}/{totalTasks}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="h-2 bg-neutral-100 rounded-full overflow-hidden mb-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className={`h-full rounded-full ${preset.color.replace('text-', 'bg-')}`}
                    />
                  </div>

                  <div className="space-y-2">
                    {event.linkedTasks.map((task) => (
                      <motion.button
                        key={task.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toggleTaskCompletion(event.id, task.id)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 bg-neutral-50 hover:bg-neutral-100 rounded-xl transition-colors text-right"
                      >
                        {task.completed ? (
                          <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />
                        ) : (
                          <Circle
                            size={18}
                            className="text-neutral-300 flex-shrink-0"
                          />
                        )}
                        <span
                          className={`text-sm flex-1 ${
                            task.completed
                              ? 'text-neutral-400 line-through'
                              : 'text-neutral-700'
                          }`}
                        >
                          {task.title}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {event.notes && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <FileText size={16} className="text-neutral-400" />
                    <h3 className="text-sm font-semibold text-neutral-700">הערות</h3>
                  </div>
                  <p className="text-sm text-neutral-600 bg-neutral-50 rounded-xl p-4 leading-relaxed">
                    {event.notes}
                  </p>
                </div>
              )}

              {/* Create Task Button */}
              <button
                onClick={handleCreateLinkedTask}
                className="w-full px-4 py-3 rounded-xl border-2 border-dashed border-accent-300 text-accent-700 hover:border-accent-400 hover:bg-accent-50 transition-all font-medium flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                צור משימה מקושרת לאירוע
              </button>

              {/* Auto-generated follow-up hint */}
              {event.linkedTasks.length > 0 && (
                <div className={`${preset.bgColor} rounded-xl p-4`}>
                  <div className="flex items-start gap-3">
                    <Sparkles size={18} className={preset.color} />
                    <div>
                      <h4 className={`text-sm font-semibold ${preset.color} mb-1`}>
                        משימות נוצרו אוטומטית
                      </h4>
                      <p className="text-xs text-neutral-600">
                        המשימות המקושרות נוצרו אוטומטית לפי סוג האירוע. ניתן לערוך ולהוסיף
                        משימות לפי הצורך.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Delete confirmation */}
            <AnimatePresence>
              {showDeleteConfirm && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute inset-x-0 bottom-0 bg-white border-t border-neutral-200 p-5 shadow-lg"
                >
                  <p className="text-sm text-neutral-700 mb-4 text-center">
                    האם למחוק את האירוע &quot;{event.title}&quot;?
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 px-4 py-2.5 text-sm font-medium text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors"
                    >
                      ביטול
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors"
                    >
                      מחיקה
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
