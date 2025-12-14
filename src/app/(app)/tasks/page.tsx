'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTasksStore } from '@/stores/tasksStore'
import { useCompaniesStore } from '@/stores/companiesStore'
import { Task, TaskStatus, TaskPriority, TASK_PRIORITY_LABELS } from '@/types/task'
import { CATEGORY_PRESETS } from '@/types/calendar'
import TaskFormSheet from '@/components/tasks/TaskFormSheet'
import BottomSheet from '@/components/ui/BottomSheet'
import {
  CheckCircle2,
  Circle,
  Clock,
  Plus,
  Search,
  Filter,
  Flag,
  Building2,
  Calendar as CalendarIcon,
  MoreVertical,
  Edit,
  Archive,
  Trash2,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export default function TasksPage() {
  const {
    getFilteredTasks,
    setFilters,
    filters,
    clearFilters,
    openCreateModal,
    closeCreateModal,
    isCreateModalOpen,
    editingTask,
    openEditModal,
    markTaskDone,
    markTaskTodo,
    markTaskDoing,
    archiveTask,
    deleteTask,
    openTaskDrawer,
    closeTaskDrawer,
    isTaskDrawerOpen,
    selectedTask,
    updateTask,
  } = useTasksStore()

  const { getCompanyById } = useCompaniesStore()

  const [selectedTab, setSelectedTab] = useState<'all' | TaskStatus>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const allTasks = getFilteredTasks()

  const filteredTasks = allTasks.filter((task) => {
    const matchesTab = selectedTab === 'all' || task.status === selectedTab
    const matchesSearch =
      !searchQuery ||
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTab && matchesSearch
  })

  const todayTasks = allTasks.filter((task) => {
    if (!task.dueDate) return false
    const today = new Date()
    const due = new Date(task.dueDate)
    return (
      due.getDate() === today.getDate() &&
      due.getMonth() === today.getMonth() &&
      due.getFullYear() === today.getFullYear()
    )
  })

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    if (newStatus === 'DONE') markTaskDone(taskId)
    else if (newStatus === 'TODO') markTaskTodo(taskId)
    else markTaskDoing(taskId)
  }

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'HIGH':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'MEDIUM':
        return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'LOW':
        return 'text-blue-600 bg-blue-50 border-blue-200'
    }
  }

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'DONE':
        return <CheckCircle2 className="text-green-600" size={20} />
      case 'DOING':
        return <Clock className="text-orange-600" size={20} />
      case 'TODO':
        return <Circle className="text-neutral-400" size={20} />
    }
  }

  const TaskCard = ({ task }: { task: Task }) => {
    const company = task.companyId ? getCompanyById(task.companyId) : null
    const categoryPreset = task.category
      ? CATEGORY_PRESETS[task.category as keyof typeof CATEGORY_PRESETS]
      : null

    const isOverdue =
      task.dueDate &&
      task.status !== 'DONE' &&
      new Date(task.dueDate) < new Date()

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={cn(
          'bg-white rounded-2xl border-2 p-4 transition-all hover:shadow-md cursor-pointer',
          task.status === 'DONE'
            ? 'border-green-200 bg-green-50/30'
            : 'border-neutral-200 hover:border-accent-300'
        )}
        onClick={() => openTaskDrawer(task)}
      >
        <div className="flex items-start gap-3">
          {/* Status Icon */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              const nextStatus =
                task.status === 'TODO'
                  ? 'DOING'
                  : task.status === 'DOING'
                  ? 'DONE'
                  : 'TODO'
              handleStatusChange(task.id, nextStatus)
            }}
            className="mt-1 flex-shrink-0 hover:scale-110 transition-transform"
          >
            {getStatusIcon(task.status)}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3
                className={cn(
                  'font-bold text-neutral-900 text-right',
                  task.status === 'DONE' && 'line-through text-neutral-500'
                )}
              >
                {task.title}
              </h3>
              {categoryPreset && (
                <div
                  className={cn(
                    'flex-shrink-0 p-1.5 rounded-lg',
                    categoryPreset.bgColor
                  )}
                >
                  <categoryPreset.icon size={16} className={categoryPreset.color} />
                </div>
              )}
            </div>

            {task.description && (
              <p className="text-sm text-neutral-600 mb-3 text-right line-clamp-2">
                {task.description}
              </p>
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Priority */}
              <span
                className={cn(
                  'px-2 py-1 rounded-lg text-xs font-medium border flex items-center gap-1',
                  getPriorityColor(task.priority)
                )}
              >
                <Flag size={12} />
                {TASK_PRIORITY_LABELS[task.priority]}
              </span>

              {/* Due Date */}
              {task.dueDate && (
                <span
                  className={cn(
                    'px-2 py-1 rounded-lg text-xs font-medium border flex items-center gap-1',
                    isOverdue
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : 'bg-neutral-100 text-neutral-700 border-neutral-200'
                  )}
                >
                  <CalendarIcon size={12} />
                  {new Date(task.dueDate).toLocaleDateString('he-IL', {
                    day: 'numeric',
                    month: 'short',
                  })}
                  {task.scheduledAt && ` • ${task.scheduledAt}`}
                </span>
              )}

              {/* Company */}
              {company && (
                <span className="px-2 py-1 rounded-lg text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                  <Building2 size={12} />
                  {company.name}
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 mb-1">משימות</h1>
            <p className="text-neutral-600">
              {todayTasks.length > 0 && (
                <span className="font-medium text-accent-600">
                  {todayTasks.length} משימות להיום
                </span>
              )}
            </p>
          </div>

          {/* Desktop Add Button - Premium styling */}
          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => openCreateModal()}
            className="hidden lg:flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-emerald-600 transition-all shadow-[0_4px_16px_-4px_rgba(16,185,129,0.4)]"
          >
            <Plus size={20} strokeWidth={2.5} />
            משימה חדשה
          </motion.button>

          {/* Mobile Add Button - Premium styling */}
          <motion.button
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => openCreateModal()}
            className="lg:hidden flex items-center justify-center w-12 h-12 bg-gradient-to-br from-neutral-800 to-neutral-900 text-white rounded-2xl shadow-[0_8px_24px_-4px_rgba(0,0,0,0.3)] transition-all relative"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
            <Plus size={24} strokeWidth={2.5} className="relative z-10" />
          </motion.button>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400"
              size={20}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="חיפוש משימות..."
              className="w-full pr-12 pl-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-accent-500 focus:ring-2 focus:ring-accent-100 transition-all"
              dir="rtl"
            />
          </div>
          <button
            onClick={() => setIsFilterOpen(true)}
            className={cn(
              'px-4 py-3 rounded-xl border-2 transition-all flex items-center gap-2 font-medium',
              Object.keys(filters).length > 0
                ? 'border-accent-500 bg-accent-50 text-accent-700'
                : 'border-neutral-200 text-neutral-700 hover:border-neutral-300'
            )}
          >
            <Filter size={20} />
            <span className="hidden sm:inline">סינון</span>
          </button>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6 bg-neutral-100 p-1.5 rounded-xl inline-flex gap-1"
      >
        {[
          { id: 'all', label: 'הכל' },
          { id: 'TODO', label: 'לביצוע' },
          { id: 'DOING', label: 'בתהליך' },
          { id: 'DONE', label: 'הושלם' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id as any)}
            className={cn(
              'px-6 py-2.5 rounded-lg font-bold transition-all',
              selectedTab === tab.id
                ? 'bg-white text-accent-700 shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
            )}
          >
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Tasks List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        <AnimatePresence mode="popLayout">
          {filteredTasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="dashboard-card py-16 text-center"
            >
              <Circle size={64} className="text-neutral-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-neutral-900 mb-2">
                אין משימות
              </h3>
              <p className="text-neutral-600 mb-6">
                {searchQuery
                  ? 'לא נמצאו משימות התואמות לחיפוש'
                  : 'התחל ביצירת משימה ראשונה'}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => openCreateModal()}
                  className="px-6 py-3 bg-accent-600 text-white rounded-xl font-bold hover:bg-accent-700 transition-all inline-flex items-center gap-2"
                >
                  <Plus size={20} />
                  צור משימה
                </button>
              )}
            </motion.div>
          ) : (
            filteredTasks.map((task) => <TaskCard key={task.id} task={task} />)
          )}
        </AnimatePresence>
      </motion.div>

      {/* Task Form Sheet */}
      <TaskFormSheet
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        editingTask={editingTask}
      />

      {/* Task Details Drawer */}
      <BottomSheet
        isOpen={isTaskDrawerOpen}
        onClose={closeTaskDrawer}
        title="פרטי משימה"
      >
        {selectedTask && (
          <div className="p-6 space-y-6">
            {/* Title */}
            <div>
              <h2 className="text-2xl font-bold text-neutral-900 text-right mb-2">
                {selectedTask.title}
              </h2>
              {selectedTask.description && (
                <p className="text-neutral-700 text-right whitespace-pre-wrap">
                  {selectedTask.description}
                </p>
              )}
            </div>

            {/* Status Change */}
            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-3">
                סטטוס
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['TODO', 'DOING', 'DONE'] as TaskStatus[]).map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(selectedTask.id, status)}
                    className={cn(
                      'px-4 py-3 rounded-xl border-2 font-medium transition-all',
                      selectedTask.status === status
                        ? 'border-accent-500 bg-accent-50 text-accent-700'
                        : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                    )}
                  >
                    {status === 'TODO' && 'לביצוע'}
                    {status === 'DOING' && 'בתהליך'}
                    {status === 'DONE' && 'הושלם'}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-neutral-100">
              <button
                onClick={() => {
                  openEditModal(selectedTask)
                  closeTaskDrawer()
                }}
                className="flex-1 px-6 py-3 rounded-xl border-2 border-accent-500 text-accent-700 font-bold hover:bg-accent-50 transition-all flex items-center justify-center gap-2"
              >
                <Edit size={18} />
                עריכה
              </button>
              <button
                onClick={() => {
                  if (confirm('האם למחוק את המשימה?')) {
                    deleteTask(selectedTask.id)
                    closeTaskDrawer()
                    toast.success('המשימה נמחקה')
                  }
                }}
                className="flex-1 px-6 py-3 rounded-xl border-2 border-red-500 text-red-700 font-bold hover:bg-red-50 transition-all flex items-center justify-center gap-2"
              >
                <Trash2 size={18} />
                מחיקה
              </button>
            </div>
          </div>
        )}
      </BottomSheet>

      {/* Filter Sheet */}
      <BottomSheet
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="סינון משימות"
      >
        <div className="p-6 space-y-6">
          <p className="text-neutral-600 text-right">מסננים נוספים יתווספו בקרוב</p>
          <button
            onClick={() => {
              clearFilters()
              setIsFilterOpen(false)
              toast.success('הסינונים נוקו')
            }}
            className="w-full px-6 py-3 rounded-xl border-2 border-neutral-200 text-neutral-700 font-bold hover:bg-neutral-50 transition-all"
          >
            נקה סינונים
          </button>
        </div>
      </BottomSheet>
    </div>
  )
}
