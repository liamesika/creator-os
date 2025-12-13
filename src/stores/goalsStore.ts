'use client'

import { create } from 'zustand'
import {
  DailyGoal,
  GoalItem,
  GoalItemStatus,
  generateGoalId,
  formatGoalDate,
  getTodayDateString,
  getWeekDates,
  parseGoalDate,
  MAX_DAILY_GOALS,
} from '@/types/goal'
import { db } from '@/lib/supabase/database'
import { getCurrentUserIdSync } from '@/lib/supabase/auth-helpers'
import { toast } from 'sonner'
import { logActivity } from '@/lib/activity-logger'

interface GoalsStore {
  goals: DailyGoal[]
  selectedDate: string
  isCreateModalOpen: boolean
  isReflectionModalOpen: boolean
  editingGoal: DailyGoal | null
  isLoading: boolean
  isInitialized: boolean

  setSelectedDate: (date: string) => void
  openCreateModal: (date?: string) => void
  closeCreateModal: () => void
  openReflectionModal: (date: string) => void
  closeReflectionModal: () => void

  initialize: (userId: string) => Promise<void>

  setGoalsForDate: (date: string, items: Omit<GoalItem, 'id'>[]) => Promise<DailyGoal | null>
  updateGoalItem: (date: string, itemId: string, updates: Partial<GoalItem>) => Promise<void>
  deleteGoalItem: (date: string, itemId: string) => Promise<void>
  addGoalItem: (date: string, item: Omit<GoalItem, 'id'>) => Promise<void>
  setGoalItemStatus: (date: string, itemId: string, status: GoalItemStatus) => Promise<void>

  saveReflection: (
    date: string,
    reflection: { whatWorked?: string; whatBlocked?: string }
  ) => Promise<void>

  getGoalForDate: (date: string) => DailyGoal | undefined
  getTodayGoal: () => DailyGoal | undefined
  getGoalsForWeek: (startDate: Date) => DailyGoal[]
  getGoalsForMonth: (year: number, month: number) => DailyGoal[]
  hasReachedMaxGoals: (date: string) => boolean
  getWeeklyConsistency: () => number
  getMonthlyConsistency: (year: number, month: number) => number
}

export const useGoalsStore = create<GoalsStore>((set, get) => ({
  goals: [],
  selectedDate: getTodayDateString(),
  isCreateModalOpen: false,
  isReflectionModalOpen: false,
  editingGoal: null,
  isLoading: false,
  isInitialized: false,

  setSelectedDate: (date) => set({ selectedDate: date }),

  openCreateModal: (date) => {
    const goalDate = date || getTodayDateString()
    const existingGoal = get().getGoalForDate(goalDate)
    set({
      isCreateModalOpen: true,
      editingGoal: existingGoal || null,
      selectedDate: goalDate,
    })
  },

  closeCreateModal: () =>
    set({
      isCreateModalOpen: false,
      editingGoal: null,
    }),

  openReflectionModal: (date) => {
    const goal = get().getGoalForDate(date)
    set({
      isReflectionModalOpen: true,
      editingGoal: goal || null,
      selectedDate: date,
    })
  },

  closeReflectionModal: () =>
    set({
      isReflectionModalOpen: false,
      editingGoal: null,
    }),

  initialize: async (userId: string) => {
    if (get().isInitialized) return

    set({ isLoading: true })
    try {
      const goals = await db.getGoals(userId)
      set({ goals, isInitialized: true })
    } catch (error) {
      console.error('Failed to load goals:', error)
      toast.error('שגיאה בטעינת היעדים')
    } finally {
      set({ isLoading: false })
    }
  },

  setGoalsForDate: async (date, itemsData) => {
    const userId = getCurrentUserIdSync()
    if (!userId) {
      toast.error('יש להתחבר כדי לשמור יעדים')
      return null
    }

    const existingGoal = get().getGoalForDate(date)

    const items: GoalItem[] = itemsData.map((item) => ({
      ...item,
      id: generateGoalId(),
    }))

    const goalData: Omit<DailyGoal, 'createdAt' | 'updatedAt'> = {
      id: existingGoal?.id || generateGoalId(),
      date,
      items,
      reflection: existingGoal?.reflection,
    }

    try {
      const updatedGoal = await db.upsertGoal(userId, goalData)

      if (existingGoal) {
        set((state) => ({
          goals: state.goals.map((goal) =>
            goal.date === date ? updatedGoal : goal
          ),
        }))
      } else {
        set((state) => ({
          goals: [...state.goals, updatedGoal]
        }))
      }

      logActivity('goal_set', updatedGoal.id, `${items.length} מטרות`, { count: items.length })
      toast.success('היעדים נשמרו')
      return updatedGoal
    } catch (error) {
      console.error('Failed to set goals:', error)
      toast.error('שגיאה בשמירת היעדים')
      return null
    }
  },

  updateGoalItem: async (date, itemId, updates) => {
    const userId = getCurrentUserIdSync()
    if (!userId) return

    const prevState = get().goals
    set((state) => ({
      goals: state.goals.map((goal) =>
        goal.date === date
          ? {
              ...goal,
              items: goal.items.map((item) =>
                item.id === itemId ? { ...item, ...updates } : item
              ),
              updatedAt: new Date(),
            }
          : goal
      ),
    }))

    try {
      const goal = get().getGoalForDate(date)
      if (goal) {
        await db.upsertGoal(userId, goal)
      }
    } catch (error) {
      console.error('Failed to update goal item:', error)
      set({ goals: prevState })
    }
  },

  deleteGoalItem: async (date, itemId) => {
    const userId = getCurrentUserIdSync()
    if (!userId) return

    const prevState = get().goals
    set((state) => ({
      goals: state.goals.map((goal) =>
        goal.date === date
          ? {
              ...goal,
              items: goal.items.filter((item) => item.id !== itemId),
              updatedAt: new Date(),
            }
          : goal
      ),
    }))

    try {
      const goal = get().getGoalForDate(date)
      if (goal) {
        await db.upsertGoal(userId, goal)
        toast.success('היעד נמחק')
      }
    } catch (error) {
      console.error('Failed to delete goal item:', error)
      toast.error('שגיאה במחיקת היעד')
      set({ goals: prevState })
    }
  },

  addGoalItem: async (date, itemData) => {
    const userId = getCurrentUserIdSync()
    if (!userId) return

    const goal = get().getGoalForDate(date)

    if (!goal) {
      await get().setGoalsForDate(date, [itemData])
      return
    }

    if (goal.items.length >= MAX_DAILY_GOALS) {
      toast.error(`ניתן להוסיף עד ${MAX_DAILY_GOALS} יעדים ליום`)
      return
    }

    const newItem: GoalItem = {
      ...itemData,
      id: generateGoalId(),
    }

    const prevState = get().goals
    set((state) => ({
      goals: state.goals.map((g) =>
        g.date === date
          ? {
              ...g,
              items: [...g.items, newItem],
              updatedAt: new Date(),
            }
          : g
      ),
    }))

    try {
      const updatedGoal = get().getGoalForDate(date)
      if (updatedGoal) {
        await db.upsertGoal(userId, updatedGoal)
        toast.success('היעד נוסף')
      }
    } catch (error) {
      console.error('Failed to add goal item:', error)
      toast.error('שגיאה בהוספת היעד')
      set({ goals: prevState })
    }
  },

  setGoalItemStatus: async (date, itemId, status) => {
    const goal = get().getGoalForDate(date)
    const item = goal?.items.find((i) => i.id === itemId)
    await get().updateGoalItem(date, itemId, { status })
    logActivity('goal_item_updated', itemId, item?.title, { status })
  },

  saveReflection: async (date, reflection) => {
    const userId = getCurrentUserIdSync()
    if (!userId) return

    const prevState = get().goals
    set((state) => ({
      goals: state.goals.map((goal) =>
        goal.date === date
          ? { ...goal, reflection, updatedAt: new Date() }
          : goal
      ),
    }))

    try {
      const goal = get().getGoalForDate(date)
      if (goal) {
        await db.upsertGoal(userId, goal)
        logActivity('goal_reflection_saved', goal.id, date)
        toast.success('ההשתקפות נשמרה')
      }
    } catch (error) {
      console.error('Failed to save reflection:', error)
      toast.error('שגיאה בשמירת ההשתקפות')
      set({ goals: prevState })
    }
  },

  getGoalForDate: (date) => {
    return get().goals.find((goal) => goal.date === date)
  },

  getTodayGoal: () => {
    return get().getGoalForDate(getTodayDateString())
  },

  getGoalsForWeek: (startDate) => {
    const weekDates = getWeekDates(startDate)
    const dateStrings = weekDates.map((d) => formatGoalDate(d))
    return get().goals.filter((goal) => dateStrings.includes(goal.date))
  },

  getGoalsForMonth: (year, month) => {
    return get().goals.filter((goal) => {
      const goalDate = parseGoalDate(goal.date)
      return goalDate.getFullYear() === year && goalDate.getMonth() === month
    })
  },

  hasReachedMaxGoals: (date) => {
    const goal = get().getGoalForDate(date)
    return goal ? goal.items.length >= MAX_DAILY_GOALS : false
  },

  getWeeklyConsistency: () => {
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())

    const weekGoals = get().getGoalsForWeek(startOfWeek)
    const daysWithGoals = weekGoals.filter((goal) => goal.items.length > 0).length

    return Math.round((daysWithGoals / 7) * 100)
  },

  getMonthlyConsistency: (year, month) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const monthGoals = get().getGoalsForMonth(year, month)
    const daysWithGoals = monthGoals.filter((goal) => goal.items.length > 0).length

    return Math.round((daysWithGoals / daysInMonth) * 100)
  },
}))
