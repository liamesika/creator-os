'use client'

import { useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
  showCloseButton?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  footer?: React.ReactNode
}

const SIZE_CLASSES = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
  xl: 'sm:max-w-4xl',
  full: 'sm:max-w-[calc(100vw-48px)]',
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  className,
  showCloseButton = true,
  size = 'md',
  footer,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

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

  // Focus trap
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const firstElement = focusableElements[0] as HTMLElement
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

      const handleTab = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault()
              lastElement?.focus()
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault()
              firstElement?.focus()
            }
          }
        }
      }

      document.addEventListener('keydown', handleTab)
      firstElement?.focus()

      return () => document.removeEventListener('keydown', handleTab)
    }
  }, [isOpen])

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
              aria-labelledby={title ? 'modal-title' : undefined}
              className={cn(
                // Base styles
                'relative w-full bg-white shadow-2xl',
                // Mobile: full width, rounded top, max height
                'rounded-t-3xl sm:rounded-2xl',
                // Sizing
                SIZE_CLASSES[size],
                // Max height with safe area consideration
                'max-h-[calc(100dvh-env(safe-area-inset-top))] sm:max-h-[calc(100dvh-48px)]',
                // Flex layout for header/content/footer
                'flex flex-col overflow-hidden',
                className
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drag handle - mobile only */}
              <div className="sm:hidden flex-shrink-0 pt-3 pb-2 flex justify-center">
                <div className="w-12 h-1.5 bg-neutral-300 rounded-full" />
              </div>

              {/* Header */}
              {(title || showCloseButton) && (
                <div className="flex-shrink-0 px-5 py-4 flex items-center justify-between border-b border-neutral-100">
                  {title && (
                    <h2 id="modal-title" className="text-lg font-semibold text-neutral-800">
                      {title}
                    </h2>
                  )}
                  {showCloseButton && (
                    <button
                      onClick={onClose}
                      className="p-2 hover:bg-neutral-100 rounded-xl transition-colors -mr-2"
                      aria-label="Close modal"
                    >
                      <X size={20} className="text-neutral-500" />
                    </button>
                  )}
                </div>
              )}

              {/* Scrollable Content */}
              <div
                ref={contentRef}
                className="flex-1 overflow-y-auto overscroll-contain"
                style={{
                  WebkitOverflowScrolling: 'touch',
                }}
              >
                {children}
              </div>

              {/* Footer - always visible */}
              {footer && (
                <div className="flex-shrink-0 border-t border-neutral-100 bg-neutral-50/80 backdrop-blur-sm">
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
