'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Users, X, ArrowLeft, Sparkles } from 'lucide-react'
import { useAgencyDemoStore } from '@/stores/agencyDemoStore'
import { toast } from 'sonner'

export default function AgencyDemoBanner() {
  const router = useRouter()
  const { isAgencyDemo, deactivateAgencyDemo } = useAgencyDemoStore()

  const handleExitDemo = () => {
    deactivateAgencyDemo()
    toast.success('יצאת ממצב הדגמה')
    router.push('/pricing/agencies')
  }

  const handleStartTrial = () => {
    deactivateAgencyDemo()
    router.push('/contact?type=agency&from=demo')
  }

  if (!isAgencyDemo) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 py-2.5">
          <div className="flex items-center justify-between gap-4">
            {/* Demo Badge */}
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 400 }}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-lg backdrop-blur-sm"
              >
                <Users size={16} className="text-white" />
                <span className="text-sm font-semibold text-white">Agency Demo</span>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-white/90 text-sm hidden md:block"
              >
                אתם צופים בדמו של מערכת הסוכנות • נתונים לדוגמה בלבד
              </motion.p>

              {/* Mobile badge */}
              <div className="flex sm:hidden items-center gap-1.5 text-white text-xs font-medium">
                <Sparkles size={14} />
                <span>דמו סוכנות</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Start Trial CTA */}
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleStartTrial}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white text-purple-700 text-sm font-semibold rounded-lg hover:bg-white/90 transition-colors shadow-sm"
              >
                <span>התחילו תקופת ניסיון</span>
                <ArrowLeft size={16} />
              </motion.button>

              {/* Exit Demo */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleExitDemo}
                className="flex items-center gap-1.5 px-3 py-2 text-white/80 hover:text-white text-sm font-medium rounded-lg hover:bg-white/10 transition-colors"
              >
                <span className="hidden sm:inline">חזרה לתמחור</span>
                <X size={18} />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// Toast component for demo actions
export function showDemoActionToast(action: string) {
  toast.info(`מצב הדגמה - ${action}`, {
    description: 'פעולה זו לא זמינה במצב הדגמה',
    duration: 3000,
  })
}
