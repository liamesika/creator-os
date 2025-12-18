'use client'

import { useEffect, useCallback, useRef, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AppSheetProps {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
  maxWidth?: 'sm' | 'md' | 'lg'
  className?: string
}

/**
 * Unified Sheet/Modal component for create/edit flows
 * - Mobile: Bottom sheet with drag handle, 90dvh height, rounded top
 * - Desktop: Centered modal with max-width
 * - Proper safe-area handling for iOS
 * - Internal scrollable content with sticky footer
 * - z-index: 110 (above bottom nav at z-50)
 */
export default function AppSheet({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = 'md',
  className,
}: AppSheetProps) {
  const contentRef = useRef<HTMLDivElement>(null)

  // Lock body scroll when open
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

  const maxWidthClass = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
  }[maxWidth]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - z-index 109 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[109]"
            aria-hidden="true"
          />

          {/* Modal Container - z-index 110, above bottom nav */}
          <div
            className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-6"
            style={{ height: '100dvh' }}
          >
            {/* Modal/Sheet */}
            <motion.div
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
              aria-labelledby="appsheet-title"
              className={cn(
                'relative w-full bg-white shadow-2xl flex flex-col overflow-hidden',
                // Mobile: bottom sheet style
                'rounded-t-3xl max-h-[90dvh]',
                // Desktop: centered modal
                'sm:rounded-2xl sm:max-h-[calc(100dvh-48px)]',
                maxWidthClass,
                className
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drag Handle - mobile only */}
              <div className="sm:hidden flex-shrink-0 pt-3 pb-1 flex justify-center">
                <div className="w-10 h-1 bg-neutral-300 rounded-full" />
              </div>

              {/* Header */}
              <div className="flex-shrink-0 px-5 py-3 flex items-center justify-between border-b border-neutral-100">
                <div className="flex-1 min-w-0">
                  <h2
                    id="appsheet-title"
                    className="text-lg font-semibold text-neutral-800 truncate"
                  >
                    {title}
                  </h2>
                  {subtitle && (
                    <p className="text-xs text-neutral-500 truncate">{subtitle}</p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="flex-shrink-0 p-2 hover:bg-neutral-100 rounded-xl transition-colors -mr-2"
                  aria-label="סגירה"
                >
                  <X size={20} className="text-neutral-500" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div
                ref={contentRef}
                className="flex-1 overflow-y-auto overscroll-contain"
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                {children}
              </div>

              {/* Sticky Footer with safe-area */}
              {footer && (
                <div
                  className="flex-shrink-0 border-t border-neutral-100 bg-white"
                  style={{
                    paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))',
                    paddingTop: '0.75rem',
                    paddingLeft: '1rem',
                    paddingRight: '1rem',
                  }}
                >
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

/**
 * Standard footer actions for AppSheet
 * Use this for consistent Cancel/Save button layouts
 */
interface AppSheetFooterProps {
  onCancel: () => void
  onSubmit: () => void
  cancelLabel?: string
  submitLabel?: string
  submitDisabled?: boolean
  submitIcon?: ReactNode
}

export function AppSheetFooter({
  onCancel,
  onSubmit,
  cancelLabel = 'ביטול',
  submitLabel = 'שמירה',
  submitDisabled = false,
  submitIcon,
}: AppSheetFooterProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 text-neutral-600 font-medium hover:bg-neutral-50 transition-all text-sm"
      >
        {cancelLabel}
      </button>
      <button
        type="button"
        onClick={onSubmit}
        disabled={submitDisabled}
        className="flex-1 px-4 py-2.5 rounded-xl bg-accent-600 text-white font-medium hover:bg-accent-700 transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-accent-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitIcon}
        {submitLabel}
      </button>
    </div>
  )
}
