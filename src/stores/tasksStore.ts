'use client'

import { create } from 'zustand'
import {
  Task,
  TaskStatus,
  TaskPriority,
  TaskFilters,
} from '@/types/task'
import { db } from '@/lib/supabase/database'
import { getCurrentUserIdSync } from '@/lib/supabase/auth-helpers'
import { toast } from 'sonner'
import { logActivity } from '@/lib/activity-logger'

interface TasksStore {
  tasks: Task[]
  selectedTask: Task | null
  isCreateModalOpen: boolean
  isTaskDrawerOpen: boolean
  editingTask: Task | null
  filters: TaskFilters
  isLoading: boolean
  isInitialized: boolean

  setSelectedTask: (task: Task | null) => void
  openCreateModal: (prefilledData?: Partial<Task>) => void
  closeCreateModal: () => void
  openEditModal: (task: Task) => void
  openTaskDrawer: (task: Task) => void
  closeTaskDrawer: () => void
  setFilters: (filters: Partial<TaskFilters>) => void
  clearFilters: () => void

  initialize: (userId: string) => Promise<void>

  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'archived'>) => Promise<Task | null>
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  archiveTask: (id: string) => Promise<void>
  restoreTask: (id: string) => Promise<void>

  setTaskStatus: (id: string, status: TaskStatus) => Promise<void>
  markTaskDone: (id: string) => Promise<void>
  markTaskTodo: (id: string) => Promise<void>
  markTaskDoing: (id: string) => Promise<void>

  bulkArchive: (ids: string[]) => Promise<void>
  bulkMarkDone: (ids: string[]) => Promise<void>
  bulkDelete: (ids: string[]) => Promise<void>

  getTaskById: (id: string) => Task | undefined
  getTasksByStatus: (status: TaskStatus) => Task[]
  getTasksByCompany: (companyId: string) => Task[]
  getTasksByEvent: (eventId: string) => Task[]
  getTodayTasks: () => Task[]
  getThisWeekTasks: () => Task[]
  getOverdueTasks: () => Task[]
  getFilteredTasks: () => Task[]
  searchTasks: (query: string) => Task[]
  getTasksForDate: (date: Date) => Task[]
}

const isToday = (date: Date): boolean => {
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

const isThisWeek = (date: Date): boolean => {
  const today = new Date()
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay())
  startOfWeek.setHours(0, 0, 0, 0)

  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999)

  return date >= startOfWeek && date <= endOfWeek
}

const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  )
}

export const useTasksStore = create<TasksStore>((set, get) => ({
  tasks: [],
  selectedTask: null,
  isCreateModalOpen: false,
  isTaskDrawerOpen: false,
  editingTask: null,
  filters: {},
  isLoading: false,
  isInitialized: false,

  setSelectedTask: (task) => set({ selectedTask: task }),

  openCreateModal: (prefilledData) =>
    set({
      isCreateModalOpen: true,
      editingTask: prefilledData ? ({ ...prefilledData } as Task) : null,
    }),

  closeCreateModal: () =>
    set({
      isCreateModalOpen: false,
      editingTask: null,
    }),

  openEditModal: (task) =>
    set({
      isCreateModalOpen: true,
      editingTask: task,
    }),

  openTaskDrawer: (task) =>
    set({
      selectedTask: task,
      isTaskDrawerOpen: true,
    }),

  closeTaskDrawer: () =>
    set({
      selectedTask: null,
      isTaskDrawerOpen: false,
    }),

  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),

  clearFilters: () => set({ filters: {} }),

  initialize: async (userId: string) => {
    if (get().isInitialized) return

    set({ isLoading: true })
    try {
      const tasks = await db.getTasks(userId)
      set({ tasks, isInitialized: true })
    } catch (error) {
      console.error('Failed to load tasks:', error)
      toast.error('שגיאה בטעינת המשימות')
    } finally {
      set({ isLoading: false })
    }
  },

  createTask: async (taskData) => {
    const userId = getCurrentUserIdSync()
    if (!userId) {
      toast.error('יש להתחבר כדי ליצור משימה')
      return null
    }

    try {
      const newTask = await db.createTask(userId, taskData)
      set((state) => ({ tasks: [...state.tasks, newTask] }))
      logActivity('task_created', newTask.id, newTask.title)
      toast.success('המשימה נוספה')
      return newTask
    } catch (error) {
      console.error('Failed to create task:', error)
      toast.error('שגיאה ביצירת המשימה')
      return null
    }
  },

  updateTask: async (id, updates) => {
    const prevState = get().tasks
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, ...updates, updatedAt: new Date() } : task
      ),
      selectedTask:
        state.selectedTask?.id === id
          ? { ...state.selectedTask, ...updates, updatedAt: new Date() }
          : state.selectedTask,
    }))

    try {
      await db.updateTask(id, updates)
      toast.success('המשימה עודכנה')
    } catch (error) {
      console.error('Failed to update task:', error)
      toast.error('שגיאה בעדכון המשימה')
      set({ tasks: prevState })
    }
  },

  deleteTask: async (id) => {
    const prevState = get().tasks
    const prevSelected = get().selectedTask
    const prevDrawerOpen = get().isTaskDrawerOpen

    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
      selectedTask: state.selectedTask?.id === id ? null : state.selectedTask,
      isTaskDrawerOpen:
        state.selectedTask?.id === id ? false : state.isTaskDrawerOpen,
    }))

    try {
      await db.deleteTask(id)
      toast.success('המשימה נמחקה')
    } catch (error) {
      console.error('Failed to delete task:', error)
      toast.error('שגיאה במחיקת המשימה')
      set({
        tasks: prevState,
        selectedTask: prevSelected,
        isTaskDrawerOpen: prevDrawerOpen
      })
    }
  },

  archiveTask: async (id) => {
    const prevState = get().tasks
    const task = get().tasks.find((t) => t.id === id)
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id
          ? { ...task, archived: true, updatedAt: new Date() }
          : task
      ),
    }))

    try {
      await db.updateTask(id, { archived: true })
      logActivity('task_archived', id, task?.title)
      toast.success('המשימה הועברה לארכיון')
    } catch (error) {
      console.error('Failed to archive task:', error)
      toast.error('שגיאה בהעברה לארכיון')
      set({ tasks: prevState })
    }
  },

  restoreTask: async (id) => {
    const prevState = get().tasks
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id
          ? { ...task, archived: false, updatedAt: new Date() }
          : task
      ),
    }))

    try {
      await db.updateTask(id, { archived: false })
      toast.success('המשימה שוחזרה מהארכיון')
    } catch (error) {
      console.error('Failed to restore task:', error)
      toast.error('שגיאה בשחזור המשימה')
      set({ tasks: prevState })
    }
  },

  setTaskStatus: async (id, status) => {
    const task = get().tasks.find((t) => t.id === id)
    await get().updateTask(id, { status })
    logActivity('task_status_changed', id, task?.title, { newStatus: status })
  },

  markTaskDone: async (id) => {
    await get().setTaskStatus(id, 'DONE')
  },

  markTaskTodo: async (id) => {
    await get().setTaskStatus(id, 'TODO')
  },

  markTaskDoing: async (id) => {
    await get().setTaskStatus(id, 'DOING')
  },

  bulkArchive: async (ids) => {
    const prevState = get().tasks
    set((state) => ({
      tasks: state.tasks.map((task) =>
        ids.includes(task.id)
          ? { ...task, archived: true, updatedAt: new Date() }
          : task
      ),
    }))

    try {
      await Promise.all(
        ids.map(id => db.updateTask(id, { archived: true }))
      )
      toast.success(`${ids.length} משימות הועברו לארכיון`)
    } catch (error) {
      console.error('Failed to bulk archive:', error)
      toast.error('שגיאה בהעברה לארכיון')
      set({ tasks: prevState })
    }
  },

  bulkMarkDone: async (ids) => {
    const prevState = get().tasks
    set((state) => ({
      tasks: state.tasks.map((task) =>
        ids.includes(task.id)
          ? { ...task, status: 'DONE' as TaskStatus, updatedAt: new Date() }
          : task
      ),
    }))

    try {
      await Promise.all(
        ids.map(id => db.updateTask(id, { status: 'DONE' }))
      )
      toast.success(`${ids.length} משימות סומנו כבוצעו`)
    } catch (error) {
      console.error('Failed to bulk mark done:', error)
      toast.error('שגיאה בסימון המשימות')
      set({ tasks: prevState })
    }
  },

  bulkDelete: async (ids) => {
    const prevState = get().tasks
    set((state) => ({
      tasks: state.tasks.filter((task) => !ids.includes(task.id)),
    }))

    try {
      await Promise.all(
        ids.map(id => db.deleteTask(id))
      )
      toast.success(`${ids.length} משימות נמחקו`)
    } catch (error) {
      console.error('Failed to bulk delete:', error)
      toast.error('שגיאה במחיקת המשימות')
      set({ tasks: prevState })
    }
  },

  getTaskById: (id) => {
    return get().tasks.find((task) => task.id === id)
  },

  getTasksByStatus: (status) => {
    return get().tasks.filter((task) => task.status === status && !task.archived)
  },

  getTasksByCompany: (companyId) => {
    return get().tasks.filter(
      (task) => task.companyId === companyId && !task.archived
    )
  },

  getTasksByEvent: (eventId) => {
    return get().tasks.filter(
      (task) => task.eventId === eventId && !task.archived
    )
  },

  getTodayTasks: () => {
    const today = new Date()
    return get().tasks.filter(
      (task) =>
        !task.archived &&
        task.dueDate &&
        isToday(new Date(task.dueDate))
    )
  },

  getThisWeekTasks: () => {
    return get().tasks.filter(
      (task) =>
        !task.archived &&
        task.dueDate &&
        isThisWeek(new Date(task.dueDate))
    )
  },

  getOverdueTasks: () => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    return get().tasks.filter(
      (task) =>
        !task.archived &&
        task.status !== 'DONE' &&
        task.dueDate &&
        new Date(task.dueDate) < now
    )
  },

  getFilteredTasks: () => {
    const { tasks, filters } = get()
    let filtered = tasks.filter((task) => !task.archived)

    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter((task) => filters.status!.includes(task.status))
    }

    if (filters.priority && filters.priority.length > 0) {
      filtered = filtered.filter((task) =>
        filters.priority!.includes(task.priority)
      )
    }

    if (filters.companyId !== undefined) {
      if (filters.companyId === null) {
        filtered = filtered.filter((task) => !task.companyId)
      } else {
        filtered = filtered.filter((task) => task.companyId === filters.companyId)
      }
    }

    if (filters.category !== undefined) {
      if (filters.category === null) {
        filtered = filtered.filter((task) => !task.category)
      } else {
        filtered = filtered.filter((task) => task.category === filters.category)
      }
    }

    if (filters.dateRange) {
      const now = new Date()
      switch (filters.dateRange) {
        case 'today':
          filtered = filtered.filter(
            (task) => task.dueDate && isToday(new Date(task.dueDate))
          )
          break
        case 'week':
          filtered = filtered.filter(
            (task) => task.dueDate && isThisWeek(new Date(task.dueDate))
          )
          break
        case 'month':
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
          const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
          filtered = filtered.filter((task) => {
            if (!task.dueDate) return false
            const dueDate = new Date(task.dueDate)
            return dueDate >= startOfMonth && dueDate <= endOfMonth
          })
          break
      }
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchLower) ||
          task.description?.toLowerCase().includes(searchLower)
      )
    }

    return filtered
  },

  searchTasks: (query) => {
    const searchLower = query.toLowerCase()
    return get().tasks.filter(
      (task) =>
        !task.archived &&
        (task.title.toLowerCase().includes(searchLower) ||
          task.description?.toLowerCase().includes(searchLower))
    )
  },

  getTasksForDate: (date) => {
    return get().tasks.filter(
      (task) =>
        !task.archived &&
        task.dueDate &&
        isSameDay(new Date(task.dueDate), date)
    )
  },
}))
