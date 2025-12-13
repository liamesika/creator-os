'use client'

import { useState, useEffect } from 'react'
import { GoalItem, MAX_DAILY_GOALS, formatGoalDate } from '@/types/goal'
import { useGoalsStore } from '@/stores/goalsStore'
import BottomSheet from '@/components/ui/BottomSheet'
import { Save, Plus, X, Target } from 'lucide-react'
import { toast } from 'sonner'

interface GoalFormSheetProps {
  isOpen: boolean
  onClose: () => void
  date: string // YYYY-MM-DD
}

export default function GoalFormSheet({
  isOpen,
  onClose,
  date,
}: GoalFormSheetProps) {
  const { getGoalForDate, setGoalsForDate } = useGoalsStore()

  const [items, setItems] = useState<Array<{ title: string; id: string }>>([
    { title: '', id: '1' },
  ])

  useEffect(() => {
    if (isOpen) {
      const existingGoal = getGoalForDate(date)
      if (existingGoal && existingGoal.items.length > 0) {
        setItems(
          existingGoal.items.map((item) => ({
            title: item.title,
            id: item.id,
          }))
        )
      } else {
        setItems([{ title: '', id: '1' }])
      }
    }
  }, [isOpen, date, getGoalForDate])

  const handleAddItem = () => {
    if (items.length >= MAX_DAILY_GOALS) {
      toast.error(`ניתן להגדיר עד ${MAX_DAILY_GOALS} מטרות ביום`)
      return
    }
    setItems([...items, { title: '', id: Date.now().toString() }])
  }

  const handleRemoveItem = (id: string) => {
    if (items.length === 1) {
      toast.error('חייבת להיות לפחות מטרה אחת')
      return
    }
    setItems(items.filter((item) => item.id !== id))
  }

  const handleItemChange = (id: string, value: string) => {
    setItems(
      items.map((item) => (item.id === id ? { ...item, title: value } : item))
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const validItems = items.filter((item) => item.title.trim())

    if (validItems.length === 0) {
      toast.error('יש להזין לפחות מטרה אחת')
      return
    }

    setGoalsForDate(
      date,
      validItems.map((item) => ({
        title: item.title.trim(),
        status: 'NOT_DONE',
      }))
    )

    toast.success('המטרות נשמרו בהצלחה')
    onClose()
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="הגדרת מטרות יומיות">
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="bg-accent-50 border-2 border-accent-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Target className="text-accent-600 flex-shrink-0 mt-0.5" size={20} />
            <div className="text-sm text-accent-900 text-right">
              <p className="font-bold mb-1">טיפ: מטרות יומיות אפקטיביות</p>
              <p>הגדר 1-3 מטרות ספציפיות שאפשר להשלים היום. שמור את המטרות קצרות ומדידות.</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-bold text-neutral-700">
            המטרות שלך להיום ({items.length}/{MAX_DAILY_GOALS})
          </label>

          {items.map((item, index) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent-100 text-accent-700 font-bold flex items-center justify-center text-sm">
                {index + 1}
              </div>
              <input
                type="text"
                value={item.title}
                onChange={(e) => handleItemChange(item.id, e.target.value)}
                placeholder={`מטרה ${index + 1}...`}
                className="flex-1 px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-accent-500 focus:ring-2 focus:ring-accent-100 transition-all text-right"
                dir="rtl"
              />
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveItem(item.id)}
                  className="flex-shrink-0 p-2 rounded-full hover:bg-red-50 text-red-600 transition-colors"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          ))}

          {items.length < MAX_DAILY_GOALS && (
            <button
              type="button"
              onClick={handleAddItem}
              className="w-full px-4 py-3 rounded-xl border-2 border-dashed border-neutral-300 text-neutral-600 hover:border-accent-400 hover:text-accent-600 hover:bg-accent-50 transition-all font-medium flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              הוסף מטרה נוספת
            </button>
          )}
        </div>

        <div className="flex gap-3 pt-4 border-t border-neutral-100">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-4 rounded-xl border-2 border-neutral-200 text-neutral-700 font-bold hover:bg-neutral-50 transition-all"
          >
            ביטול
          </button>
          <button
            type="submit"
            className="flex-1 px-6 py-4 rounded-xl bg-accent-600 text-white font-bold hover:bg-accent-700 transition-all flex items-center justify-center gap-2"
          >
            <Save size={20} />
            שמירה
          </button>
        </div>
      </form>
    </BottomSheet>
  )
}
