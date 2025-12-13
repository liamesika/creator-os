'use client'

import { useState, useEffect } from 'react'
import { Task, TaskStatus, TaskPriority, TASK_PRIORITY_LABELS } from '@/types/task'
import { EventCategory, CATEGORY_PRESETS } from '@/types/calendar'
import { useTasksStore } from '@/stores/tasksStore'
import { useCompaniesStore } from '@/stores/companiesStore'
import { useCalendarStore } from '@/stores/calendarStore'
import BottomSheet from '@/components/ui/BottomSheet'
import {
  CheckCircle2,
  Circle,
  Clock,
  Flag,
  Building2,
  Calendar as CalendarIcon,
  X,
  Save,
  Sparkles,
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

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<TaskStatus>('TODO')
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM')
  const [dueDate, setDueDate] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [category, setCategory] = useState<EventCategory | 'general'>('general')
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [eventId, setEventId] = useState<string | null>(null)

  const companies = getActiveCompanies()
  const upcomingEvents = events
    .filter((e) => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 10)

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
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={editingTask ? 'עריכת משימה' : 'משימה חדשה'}
      fullHeight
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-bold text-neutral-700 mb-2">
            כותרת <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="הזן כותרת למשימה..."
            className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-accent-500 focus:ring-2 focus:ring-accent-100 transition-all text-right"
            dir="rtl"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-bold text-neutral-700 mb-2">
            תיאור
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="הוסף פרטים נוספים..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-accent-500 focus:ring-2 focus:ring-accent-100 transition-all text-right resize-none"
            dir="rtl"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-bold text-neutral-700 mb-3">
            סטטוס
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(['TODO', 'DOING', 'DONE'] as TaskStatus[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={`px-4 py-3 rounded-xl border-2 transition-all font-medium ${
                  status === s
                    ? 'border-accent-500 bg-accent-50 text-accent-700'
                    : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
                }`}
              >
                {s === 'TODO' && 'לביצוע'}
                {s === 'DOING' && 'בתהליך'}
                {s === 'DONE' && 'הושלם'}
              </button>
            ))}
          </div>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-bold text-neutral-700 mb-3">
            עדיפות
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(['LOW', 'MEDIUM', 'HIGH'] as TaskPriority[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={`px-4 py-3 rounded-xl border-2 transition-all font-medium flex items-center justify-center gap-2 ${
                  priority === p
                    ? 'border-accent-500 bg-accent-50 text-accent-700'
                    : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
                }`}
              >
                <Flag
                  size={16}
                  className={
                    p === 'HIGH'
                      ? 'text-red-500'
                      : p === 'MEDIUM'
                      ? 'text-orange-500'
                      : 'text-blue-500'
                  }
                />
                {TASK_PRIORITY_LABELS[p]}
              </button>
            ))}
          </div>
        </div>

        {/* Due Date and Time */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-neutral-700 mb-2">
              תאריך יעד
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-accent-500 focus:ring-2 focus:ring-accent-100 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-neutral-700 mb-2">
              שעה מתוכננת
            </label>
            <input
              type="time"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-accent-500 focus:ring-2 focus:ring-accent-100 transition-all"
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-bold text-neutral-700 mb-3">
            קטגוריה
          </label>
          <div className="grid grid-cols-3 gap-3 max-h-64 overflow-y-auto">
            {categoryOptions.map((cat) => {
              const Icon = cat.icon
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`px-3 py-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                    category === cat.id
                      ? 'border-accent-500 bg-accent-50'
                      : 'border-neutral-200 bg-white hover:border-neutral-300'
                  }`}
                >
                  <Icon
                    size={24}
                    className={
                      category === cat.id ? 'text-accent-600' : 'text-neutral-600'
                    }
                  />
                  <span className="text-xs font-medium text-center">
                    {cat.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Company */}
        <div>
          <label className="block text-sm font-bold text-neutral-700 mb-2">
            חברה / מותג
          </label>
          <select
            value={companyId || ''}
            onChange={(e) => setCompanyId(e.target.value || null)}
            className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-accent-500 focus:ring-2 focus:ring-accent-100 transition-all text-right"
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
        <div>
          <label className="block text-sm font-bold text-neutral-700 mb-2">
            קישור לאירוע
          </label>
          <select
            value={eventId || ''}
            onChange={(e) => setEventId(e.target.value || null)}
            className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-accent-500 focus:ring-2 focus:ring-accent-100 transition-all text-right"
            dir="rtl"
          >
            <option value="">ללא אירוע</option>
            {upcomingEvents.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title} -{' '}
                {new Date(event.date).toLocaleDateString('he-IL')}
              </option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-neutral-100">
          <button
            type="button"
            onClick={() => {
              onClose()
              resetForm()
            }}
            className="flex-1 px-6 py-4 rounded-xl border-2 border-neutral-200 text-neutral-700 font-bold hover:bg-neutral-50 transition-all"
          >
            ביטול
          </button>
          <button
            type="submit"
            className="flex-1 px-6 py-4 rounded-xl bg-accent-600 text-white font-bold hover:bg-accent-700 transition-all flex items-center justify-center gap-2"
          >
            <Save size={20} />
            {editingTask ? 'שמירה' : 'יצירה'}
          </button>
        </div>
      </form>
    </BottomSheet>
  )
}
