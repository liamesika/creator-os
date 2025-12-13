import { create } from 'zustand'
import { db } from '@/lib/supabase/database'
import { getCurrentUserIdSync } from '@/lib/supabase/auth-helpers'
import { toast } from 'sonner'
import { logActivity } from '@/lib/activity-logger'
import type { WeeklyReview } from '@/types/weekly-review'
import { getWeekStartDate, formatWeekLabel } from '@/types/weekly-review'

interface WeeklyReviewState {
  reviews: WeeklyReview[]
  currentReview: WeeklyReview | null
  isLoading: boolean
  isInitialized: boolean
  dismissedThisWeek: boolean

  initialize: (userId: string) => Promise<void>
  fetchReview: (weekStartDate: string) => Promise<void>
  saveReview: (review: Omit<WeeklyReview, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>
  dismissWeeklyPrompt: () => void
  shouldShowWeeklyPrompt: () => boolean
}

export const useWeeklyReviewStore = create<WeeklyReviewState>((set, get) => ({
  reviews: [],
  currentReview: null,
  isLoading: false,
  isInitialized: false,
  dismissedThisWeek: false,

  initialize: async (userId: string) => {
    if (get().isInitialized) return

    set({ isLoading: true })
    try {
      const reviews = await db.getWeeklyReviews(userId, 10)
      set({ reviews, isInitialized: true })

      // Check if dismissed this week
      const weekStart = getWeekStartDate()
      const dismissed = typeof window !== 'undefined'
        ? localStorage.getItem(`weekly_review_dismissed_${weekStart}`) === 'true'
        : false
      set({ dismissedThisWeek: dismissed })
    } catch (error) {
      console.error('Failed to load weekly reviews:', error)
    } finally {
      set({ isLoading: false })
    }
  },

  fetchReview: async (weekStartDate: string) => {
    const userId = getCurrentUserIdSync()
    if (!userId) return

    set({ isLoading: true })
    try {
      const review = await db.getWeeklyReview(userId, weekStartDate)
      set({ currentReview: review })
    } catch (error) {
      console.error('Failed to fetch weekly review:', error)
    } finally {
      set({ isLoading: false })
    }
  },

  saveReview: async (reviewData) => {
    const userId = getCurrentUserIdSync()
    if (!userId) {
      toast.error('יש להתחבר כדי לשמור סיכום')
      return
    }

    set({ isLoading: true })
    try {
      const savedReview = await db.upsertWeeklyReview(userId, reviewData)

      set((state) => {
        const existingIndex = state.reviews.findIndex(
          (r) => r.weekStartDate === reviewData.weekStartDate
        )

        if (existingIndex >= 0) {
          const newReviews = [...state.reviews]
          newReviews[existingIndex] = savedReview
          return { reviews: newReviews, currentReview: savedReview }
        } else {
          return {
            reviews: [savedReview, ...state.reviews],
            currentReview: savedReview,
          }
        }
      })

      logActivity(
        'weekly_review_saved',
        savedReview.id,
        formatWeekLabel(reviewData.weekStartDate)
      )

      toast.success('הסיכום השבועי נשמר!')
    } catch (error) {
      console.error('Failed to save weekly review:', error)
      toast.error('שגיאה בשמירת הסיכום')
    } finally {
      set({ isLoading: false })
    }
  },

  dismissWeeklyPrompt: () => {
    const weekStart = getWeekStartDate()
    if (typeof window !== 'undefined') {
      localStorage.setItem(`weekly_review_dismissed_${weekStart}`, 'true')
    }
    set({ dismissedThisWeek: true })
  },

  shouldShowWeeklyPrompt: () => {
    const { dismissedThisWeek, reviews } = get()
    if (dismissedThisWeek) return false

    const weekStart = getWeekStartDate()
    const hasReviewThisWeek = reviews.some((r) => r.weekStartDate === weekStart)

    return !hasReviewThisWeek
  },
}))
