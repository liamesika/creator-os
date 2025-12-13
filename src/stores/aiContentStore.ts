'use client'

import { create } from 'zustand'
import { AIGeneratedContent, AIGenerationInput } from '@/types/ai-content'
import { db } from '@/lib/supabase/database'
import { getCurrentUserIdSync } from '@/lib/supabase/auth-helpers'
import { toast } from 'sonner'
import { logActivity } from '@/lib/activity-logger'

interface AIContentStore {
  generations: AIGeneratedContent[]
  selectedGeneration: AIGeneratedContent | null
  isGenerating: boolean
  isLoading: boolean
  isInitialized: boolean

  setSelectedGeneration: (generation: AIGeneratedContent | null) => void

  initialize: (userId: string) => Promise<void>

  generateContent: (input: AIGenerationInput) => Promise<AIGeneratedContent | null>
  updateGeneration: (id: string, output: string) => Promise<void>
  deleteGeneration: (id: string) => Promise<void>

  getGenerationById: (id: string) => AIGeneratedContent | undefined
  getGenerationsByTemplate: (templateId: string) => AIGeneratedContent[]
  getRecentGenerations: (limit?: number) => AIGeneratedContent[]
  getGenerationsThisMonth: () => number
}

export const useAIContentStore = create<AIContentStore>((set, get) => ({
  generations: [],
  selectedGeneration: null,
  isGenerating: false,
  isLoading: false,
  isInitialized: false,

  setSelectedGeneration: (generation) => set({ selectedGeneration: generation }),

  initialize: async (userId: string) => {
    if (get().isInitialized) return

    set({ isLoading: true })
    try {
      const generations = await db.getAIGenerations(userId)
      set({ generations, isInitialized: true })
    } catch (error) {
      console.error('Failed to load AI generations:', error)
      toast.error('שגיאה בטעינת תוצרי AI')
    } finally {
      set({ isLoading: false })
    }
  },

  generateContent: async (input: AIGenerationInput) => {
    const userId = getCurrentUserIdSync()
    if (!userId) {
      toast.error('יש להתחבר כדי ליצור תוכן')
      return null
    }

    set({ isGenerating: true })
    try {
      const generation = await db.generateAIContent(userId, input)
      set((state) => {
        const newGenerations = [generation, ...state.generations]
        // Update global count for freemium limits
        if (typeof window !== 'undefined') {
          (window as any).__AI_GENERATIONS_COUNT__ = get().getGenerationsThisMonth() + 1
        }
        return { generations: newGenerations }
      })
      logActivity('ai_generated', generation.id, generation.templateId, { template: input.templateId })
      toast.success('התוכן נוצר בהצלחה!')
      return generation
    } catch (error) {
      console.error('Failed to generate content:', error)
      toast.error('שגיאה ביצירת התוכן')
      return null
    } finally {
      set({ isGenerating: false })
    }
  },

  updateGeneration: async (id, output) => {
    const prevState = get().generations
    set((state) => ({
      generations: state.generations.map((gen) =>
        gen.id === id
          ? { ...gen, output, updatedAt: new Date() }
          : gen
      ),
      selectedGeneration:
        state.selectedGeneration?.id === id
          ? { ...state.selectedGeneration, output, updatedAt: new Date() }
          : state.selectedGeneration,
    }))

    try {
      await db.updateAIGeneration(id, { output })
      toast.success('התוכן עודכן')
    } catch (error) {
      console.error('Failed to update generation:', error)
      toast.error('שגיאה בעדכון התוכן')
      set({ generations: prevState })
    }
  },

  deleteGeneration: async (id) => {
    const prevState = get().generations
    const prevSelected = get().selectedGeneration

    set((state) => ({
      generations: state.generations.filter((gen) => gen.id !== id),
      selectedGeneration: state.selectedGeneration?.id === id ? null : state.selectedGeneration,
    }))

    try {
      await db.deleteAIGeneration(id)
      toast.success('התוכן נמחק')
    } catch (error) {
      console.error('Failed to delete generation:', error)
      toast.error('שגיאה במחיקת התוכן')
      set({
        generations: prevState,
        selectedGeneration: prevSelected,
      })
    }
  },

  getGenerationById: (id) => {
    return get().generations.find((gen) => gen.id === id)
  },

  getGenerationsByTemplate: (templateId) => {
    return get().generations.filter((gen) => gen.templateId === templateId)
  },

  getRecentGenerations: (limit = 10) => {
    return get().generations.slice(0, limit)
  },

  getGenerationsThisMonth: () => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    return get().generations.filter((gen) => {
      const genDate = new Date(gen.createdAt)
      return genDate >= startOfMonth
    }).length
  },
}))
