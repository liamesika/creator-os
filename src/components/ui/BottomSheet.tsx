'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
  showCloseButton?: boolean
  fullHeight?: boolean
  snapPoints?: number[] // percentage values like [0.3, 0.6, 0.9]
  defaultSnapPoint?: number
}

export default function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  className,
  showCloseButton = true,
  fullHeight = false,
  snapPoints,
  defaultSnapPoint,
}: BottomSheetProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [currentSnapPoint, setCurrentSnapPoint] = useState(
    defaultSnapPoint || snapPoints?.[0] || 0.9
  )
  const sheetRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // Lock body scroll when sheet is open - using position fixed to prevent iOS Safari issues
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

  const handleDragEnd = (event: any, info: PanInfo) => {
    setIsDragging(false)

    const velocity = info.velocity.y
    const offset = info.offset.y

    // Close if dragged down significantly or with high velocity
    if (offset > 150 || velocity > 500) {
      onClose()
      return
    }

    // Snap to points if provided
    if (snapPoints && snapPoints.length > 1) {
      const windowHeight = window.innerHeight
      const draggedPercentage = Math.max(
        0,
        1 - (offset + currentSnapPoint * windowHeight) / windowHeight
      )

      // Find closest snap point
      const closest = snapPoints.reduce((prev, curr) =>
        Math.abs(curr - draggedPercentage) < Math.abs(prev - draggedPercentage)
          ? curr
          : prev
      )

      setCurrentSnapPoint(closest)
    }
  }

  // Calculate height: fullHeight uses 95% viewport to leave room at top
  const getSheetHeight = () => {
    if (fullHeight) {
      return '95dvh'
    }
    return `${currentSnapPoint * 100}dvh`
  }

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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
            aria-hidden="true"
          />

          {/* Sheet */}
          <motion.div
            ref={sheetRef}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{
              type: 'spring',
              damping: 30,
              stiffness: 300,
            }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.2 }}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={handleDragEnd}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'sheet-title' : undefined}
            className={cn(
              'fixed bottom-0 left-0 right-0 z-[101]',
              'bg-white rounded-t-3xl shadow-2xl',
              'flex flex-col',
              className
            )}
            style={{
              height: getSheetHeight(),
              maxHeight: '95dvh',
            }}
          >
            {/* Drag Handle */}
            <div className="flex-shrink-0 pt-3 pb-2 px-4 flex justify-center touch-none">
              <div className="w-12 h-1.5 bg-neutral-300 rounded-full" />
            </div>

            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex-shrink-0 px-5 pb-3 flex items-center justify-between border-b border-neutral-100">
                <h2 id="sheet-title" className="text-lg font-bold text-neutral-900">{title}</h2>
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-neutral-100 transition-colors"
                    aria-label="Close sheet"
                  >
                    <X size={22} className="text-neutral-600" />
                  </button>
                )}
              </div>
            )}

            {/* Scrollable Content */}
            <div
              ref={contentRef}
              className="flex-1 overflow-y-auto overscroll-contain touch-pan-y"
              style={{
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
