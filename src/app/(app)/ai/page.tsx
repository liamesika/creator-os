'use client'

import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import EmptyState from '@/components/app/EmptyState'

export default function AIPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">תוכן AI</h1>
        <p className="text-neutral-500">יצירת רעיונות וטקסטים עם עזרה חכמה</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="dashboard-card min-h-[400px] flex items-center justify-center"
      >
        <EmptyState
          icon={Sparkles}
          title="עוזר התוכן יהיה זמין בקרוב"
          description="אנחנו עובדים על זה — בינתיים, תן לרעיונות לזרום"
        />
      </motion.div>
    </div>
  )
}
