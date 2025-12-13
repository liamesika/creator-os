'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, X } from 'lucide-react'
import { useDemoScriptStore } from '@/stores/demoScriptStore'

interface DemoScriptHighlightProps {
  step: string
  caption: string
  position?: 'top' | 'bottom' | 'center'
  onNext?: () => void
}

export default function DemoScriptHighlight({
  step,
  caption,
  position = 'bottom',
  onNext,
}: DemoScriptHighlightProps) {
  const { isEnabled, currentStep, nextStep, disableDemoScript } =
    useDemoScriptStore()

  const isActive = isEnabled && currentStep === step

  const handleNext = () => {
    if (onNext) {
      onNext()
    }
    nextStep()
  }

  const positionClasses = {
    top: 'top-4',
    center: 'top-1/2 -translate-y-1/2',
    bottom: 'bottom-4',
  }

  return (
    <AnimatePresence>
      {isActive && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            onClick={disableDemoScript}
          />

          {/* Highlight Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`
              fixed left-1/2 -translate-x-1/2 z-[101]
              w-[90%] max-w-md
              ${positionClasses[position]}
            `}
          >
            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-2xl">
              {/* Close button */}
              <button
                onClick={disableDemoScript}
                className="absolute top-3 left-3 p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={16} />
              </button>

              {/* Caption */}
              <p className="text-base font-semibold mb-4 pr-6">{caption}</p>

              {/* Next button */}
              <button
                onClick={handleNext}
                className="w-full py-3 px-4 bg-white text-purple-700 rounded-xl font-semibold hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
              >
                <span>הבא</span>
                <ArrowLeft size={18} />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
