'use client'

import { useState, useEffect } from 'react'
import { useGoalsStore } from '@/stores/goalsStore'
import BottomSheet from '@/components/ui/BottomSheet'
import { Save, Lightbulb, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface ReflectionSheetProps {
  isOpen: boolean
  onClose: () => void
  date: string // YYYY-MM-DD
}

export default function ReflectionSheet({
  isOpen,
  onClose,
  date,
}: ReflectionSheetProps) {
  const { getGoalForDate, saveReflection } = useGoalsStore()

  const [whatWorked, setWhatWorked] = useState('')
  const [whatBlocked, setWhatBlocked] = useState('')

  useEffect(() => {
    if (isOpen) {
      const goal = getGoalForDate(date)
      if (goal?.reflection) {
        setWhatWorked(goal.reflection.whatWorked || '')
        setWhatBlocked(goal.reflection.whatBlocked || '')
      } else {
        setWhatWorked('')
        setWhatBlocked('')
      }
    }
  }, [isOpen, date, getGoalForDate])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    saveReflection(date, {
      whatWorked: whatWorked.trim() || undefined,
      whatBlocked: whatBlocked.trim() || undefined,
    })

    toast.success('הסיכום נשמר בהצלחה')
    onClose()
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="סיכום יום">
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Lightbulb
              className="text-purple-600 flex-shrink-0 mt-0.5"
              size={20}
            />
            <div className="text-sm text-purple-900 text-right">
              <p className="font-bold mb-1">למה חשוב לסכם את היום?</p>
              <p>
                סיכום יומי עוזר לזהות דפוסים, ללמוד מהצלחות וחסמים, ולהשתפר
                בהדרגה.
              </p>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-neutral-700 mb-2">
            <div className="flex items-center gap-2 mb-1">
              <Lightbulb size={16} className="text-green-600" />
              <span>מה עבד טוב היום?</span>
            </div>
          </label>
          <textarea
            value={whatWorked}
            onChange={(e) => setWhatWorked(e.target.value)}
            placeholder="למשל: התחלתי מוקדם, הפריוריטי היה ברור, התמקדתי בדבר אחד..."
            rows={4}
            className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all text-right resize-none"
            dir="rtl"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-neutral-700 mb-2">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle size={16} className="text-orange-600" />
              <span>מה חסם אותי?</span>
            </div>
          </label>
          <textarea
            value={whatBlocked}
            onChange={(e) => setWhatBlocked(e.target.value)}
            placeholder="למשל: הסחות דעת, משימות לא ברורות, חוסר אנרגיה..."
            rows={4}
            className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all text-right resize-none"
            dir="rtl"
          />
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
