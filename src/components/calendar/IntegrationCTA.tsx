/**
 * Integration CTA Banner
 *
 * Shows a banner encouraging users to connect calendar integrations
 */

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link2, X } from 'lucide-react'
import Link from 'next/link'
import { useIntegrationsStore } from '@/stores/integrationsStore'

export default function IntegrationCTA() {
  const { googleConnected, appleConnected } = useIntegrationsStore()
  const [dismissed, setDismissed] = useState(false)

  // Don't show if any integration is connected or if dismissed
  if (googleConnected || appleConnected || dismissed) {
    return null
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="mb-4"
      >
        <div className="relative p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200">
          <button
            onClick={() => setDismissed(true)}
            className="absolute top-2 left-2 p-1 hover:bg-white/50 rounded-lg transition-colors"
            aria-label="סגור"
          >
            <X size={16} className="text-neutral-600" />
          </button>

          <div className="flex items-start gap-3 pl-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
              <Link2 size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-neutral-900 mb-1">
                סנכרנו את היומן שלכם
              </h3>
              <p className="text-sm text-neutral-600 mb-3">
                חברו את Google Calendar או Apple Calendar כדי לשמור על סנכרון אוטומטי
              </p>
              <Link
                href="/settings/integrations"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm font-semibold rounded-xl transition-all"
              >
                <Link2 size={16} />
                <span>חברו עכשיו</span>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
