'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GoalItem, MAX_DAILY_GOALS, formatGoalDate } from '@/types/goal'
import { useGoalsStore } from '@/stores/goalsStore'
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
  const modalRef = useRef<HTMLDivElement>(null)

  const [items, setItems] = useState<Array<{ title: string; id: string }>>([
    { title: '', id: '1' },
  ])

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

  const formattedDate = new Date(date).toLocaleDateString('he-IL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - z-109, above bottom nav z-50 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[109]"
            aria-hidden="true"
          />

          {/* Modal Container - z-110 */}
          <div
            className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-6"
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
              aria-labelledby="goal-modal-title"
              className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90dvh] sm:max-h-[calc(100dvh-48px)] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drag handle - mobile only */}
              <div className="sm:hidden flex-shrink-0 pt-3 pb-2 flex justify-center">
                <div className="w-12 h-1.5 bg-neutral-300 rounded-full" />
              </div>

              {/* Header */}
              <div className="flex-shrink-0 px-5 py-3 flex items-center justify-between border-b border-neutral-100">
                <div>
                  <h2 id="goal-modal-title" className="text-lg font-semibold text-neutral-800">
                    מטרות יומיות
                  </h2>
                  <p className="text-xs text-neutral-500">{formattedDate}</p>
                </div>
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
                  {/* Tip Card */}
                  <div className="bg-accent-50 border border-accent-200 rounded-xl p-3">
                    <div className="flex items-start gap-2.5">
                      <Target className="text-accent-600 flex-shrink-0 mt-0.5" size={18} />
                      <div className="text-xs text-accent-800 text-right">
                        <p className="font-medium mb-0.5">טיפ: מטרות אפקטיביות</p>
                        <p className="text-accent-700">הגדר 1-3 מטרות ספציפיות ומדידות</p>
                      </div>
                    </div>
                  </div>

                  {/* Goals Input */}
                  <div className="space-y-2.5">
                    <label className="block text-sm font-medium text-neutral-700">
                      המטרות שלך ({items.length}/{MAX_DAILY_GOALS})
                    </label>

                    {items.map((item, index) => (
                      <div key={item.id} className="flex items-center gap-2">
                        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-accent-100 text-accent-700 font-bold flex items-center justify-center text-xs">
                          {index + 1}
                        </div>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => handleItemChange(item.id, e.target.value)}
                          placeholder={`מטרה ${index + 1}...`}
                          className="flex-1 px-3 py-2.5 rounded-xl border border-neutral-200 focus:border-accent-500 focus:ring-2 focus:ring-accent-100 transition-all text-right text-sm"
                          dir="rtl"
                          autoFocus={index === 0}
                        />
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="flex-shrink-0 p-1.5 rounded-full hover:bg-red-50 text-red-500 transition-colors"
                          >
                            <X size={18} />
                          </button>
                        )}
                      </div>
                    ))}

                    {items.length < MAX_DAILY_GOALS && (
                      <button
                        type="button"
                        onClick={handleAddItem}
                        className="w-full px-3 py-2.5 rounded-xl border border-dashed border-neutral-300 text-neutral-500 hover:border-accent-400 hover:text-accent-600 hover:bg-accent-50 transition-all font-medium flex items-center justify-center gap-2 text-sm"
                      >
                        <Plus size={18} />
                        הוסף מטרה
                      </button>
                    )}
                  </div>
                </div>

                {/* Footer - Sticky with safe area */}
                <div className="flex-shrink-0 flex items-center gap-3 px-4 sm:px-5 py-3 border-t border-neutral-100 bg-white safe-area-bottom">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 text-neutral-600 font-medium hover:bg-neutral-50 transition-all text-sm"
                  >
                    ביטול
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-accent-600 text-white font-medium hover:bg-accent-700 transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-accent-500/20"
                  >
                    <Save size={16} />
                    שמירה
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
