'use client'

import { useRouter } from 'next/navigation'
import { Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { useDemoModeStore } from '@/stores/demoModeStore'
import { trackEvent } from '@/lib/analytics'

interface DemoButtonProps {
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  onClick?: () => void
}

export default function DemoButton({
  variant = 'primary',
  size = 'md',
  className = '',
  onClick
}: DemoButtonProps) {
  const router = useRouter()
  const { activateDemoMode } = useDemoModeStore()

  const handleClick = () => {
    trackEvent('demo_activated')
    activateDemoMode()
    sessionStorage.setItem('creators-os-just-logged-in', 'true')
    sessionStorage.removeItem('creators-os-splash-seen')
    onClick?.()
    router.push('/dashboard')
  }

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }

  const variantClasses = {
    primary: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/30',
    secondary: 'bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 text-purple-700 border border-purple-200',
  }

  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        flex items-center justify-center gap-2 rounded-xl font-semibold
        transition-all duration-200
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
    >
      <Sparkles size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} />
      <span>נסו מצב הדגמה</span>
    </motion.button>
  )
}
