'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Trash2, X, Loader2, LucideIcon } from 'lucide-react'

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning' | 'info'
  icon?: LucideIcon
  isLoading?: boolean
}

const variants = {
  danger: {
    icon: Trash2,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    buttonBg: 'bg-red-600 hover:bg-red-700',
    buttonShadow: 'shadow-red-500/20',
  },
  warning: {
    icon: AlertTriangle,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    buttonBg: 'bg-amber-600 hover:bg-amber-700',
    buttonShadow: 'shadow-amber-500/20',
  },
  info: {
    icon: AlertTriangle,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    buttonBg: 'bg-blue-600 hover:bg-blue-700',
    buttonShadow: 'shadow-blue-500/20',
  },
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'אישור',
  cancelLabel = 'ביטול',
  variant = 'danger',
  icon,
  isLoading = false,
}: ConfirmationModalProps) {
  const variantConfig = variants[variant]
  const Icon = icon || variantConfig.icon

  const handleConfirm = async () => {
    await onConfirm()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - z-109, above bottom nav z-50 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[109]"
          />

          {/* Modal - z-110 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 flex items-center justify-center z-[110] p-4"
          >
            <div
              className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 text-center" dir="rtl">
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 400, damping: 20 }}
                  className={`w-16 h-16 mx-auto rounded-2xl ${variantConfig.iconBg} flex items-center justify-center mb-4`}
                >
                  <Icon size={28} className={variantConfig.iconColor} />
                </motion.div>

                {/* Title */}
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-lg font-bold text-neutral-900 mb-2"
                >
                  {title}
                </motion.h2>

                {/* Message */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-sm text-neutral-500 leading-relaxed"
                >
                  {message}
                </motion.p>
              </div>

              {/* Actions */}
              <div className="p-4 bg-neutral-50 flex gap-3" dir="rtl">
                <motion.button
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 text-sm font-medium text-neutral-700 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors disabled:opacity-50"
                >
                  {cancelLabel}
                </motion.button>

                <motion.button
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleConfirm}
                  disabled={isLoading}
                  className={`flex-1 px-4 py-3 text-sm font-medium text-white rounded-xl shadow-lg ${variantConfig.buttonBg} ${variantConfig.buttonShadow} transition-colors disabled:opacity-50 flex items-center justify-center gap-2`}
                >
                  {isLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : null}
                  {confirmLabel}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
