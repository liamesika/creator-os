'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Crown, X, Sparkles } from 'lucide-react'
import Link from 'next/link'

interface UpgradePromptProps {
  isOpen: boolean
  onClose: () => void
  feature: string
  message?: string
}

export default function UpgradePrompt({ isOpen, onClose, feature, message }: UpgradePromptProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 pointer-events-auto"
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 left-4 p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-neutral-500" />
              </button>

              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl flex items-center justify-center">
                  <Crown className="text-white" size={32} />
                </div>
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold text-neutral-900 text-center mb-2">
                שדרגי לפרימיום
              </h3>
              <p className="text-neutral-600 text-center mb-6">
                {message || `כדי להמשיך להשתמש ב${feature}, יש לשדרג לחבילת פרימיום`}
              </p>

              {/* Features highlight */}
              <div className="bg-accent-50 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="text-accent-600" size={18} />
                  <span className="font-bold text-neutral-900">מה תקבלי:</span>
                </div>
                <ul className="space-y-2 text-sm text-neutral-700">
                  <li className="flex items-start gap-2">
                    <span className="text-accent-600">•</span>
                    <span>חברות, משימות ואירועים ללא הגבלה</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent-600">•</span>
                    <span>דורות AI ללא הגבלה</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent-600">•</span>
                    <span>תמיכה עדיפה</span>
                  </li>
                </ul>
              </div>

              {/* CTA */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="btn-app-outline flex-1"
                >
                  אולי אחר כך
                </button>
                <Link href="/billing" className="flex-1">
                  <button
                    className="btn-app-primary w-full flex items-center justify-center gap-2"
                  >
                    <Crown size={18} />
                    שדרגי עכשיו
                  </button>
                </Link>
              </div>

              {/* Price hint */}
              <p className="text-center text-sm text-neutral-500 mt-4">
                החל מ-₪49 לחודש
              </p>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
