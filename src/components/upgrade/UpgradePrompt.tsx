'use client'

import { Crown } from 'lucide-react'
import { motion } from 'framer-motion'

interface UpgradePromptProps {
  message: string
  onUpgrade?: () => void
}

export default function UpgradePrompt({ message, onUpgrade }: UpgradePromptProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-purple-50 to-accent-50 border border-purple-200 rounded-2xl p-6 text-center"
    >
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-accent-500 rounded-full flex items-center justify-center">
          <Crown size={32} className="text-white" />
        </div>
      </div>

      <h3 className="text-lg font-semibold text-neutral-900 mb-2">
        שדרג לפרימיום
      </h3>

      <p className="text-sm text-neutral-600 mb-6">
        {message}
      </p>

      <button
        onClick={onUpgrade}
        className="w-full bg-gradient-to-r from-purple-600 to-accent-600 text-white font-medium px-6 py-3 rounded-xl hover:from-purple-700 hover:to-accent-700 transition-all shadow-md hover:shadow-lg"
      >
        שדרג עכשיו
      </button>

      <p className="text-xs text-neutral-500 mt-4">
        קבל גישה ללא הגבלה לכל התכונות
      </p>
    </motion.div>
  )
}
