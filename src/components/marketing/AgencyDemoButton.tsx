'use client'

import { useRouter } from 'next/navigation'
import { Users, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAgencyDemoStore } from '@/stores/agencyDemoStore'
import { trackEvent } from '@/lib/analytics'

interface AgencyDemoButtonProps {
  className?: string
}

export default function AgencyDemoButton({ className = '' }: AgencyDemoButtonProps) {
  const router = useRouter()
  const { activateAgencyDemo } = useAgencyDemoStore()

  const handleClick = () => {
    trackEvent('agency_demo_activated')
    activateAgencyDemo()
    // Set session flag for splash screen
    sessionStorage.setItem('creators-os-just-logged-in', 'true')
    sessionStorage.removeItem('creators-os-splash-seen')
    router.push('/agency')
  }

  return (
    <motion.button
      onClick={handleClick}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`
        group relative overflow-hidden
        inline-flex items-center justify-center gap-3
        px-8 py-4
        bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600
        hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700
        text-white text-lg font-bold
        rounded-2xl
        shadow-[0_8px_32px_-4px_rgba(139,92,246,0.4),0_4px_16px_-4px_rgba(139,92,246,0.3)]
        hover:shadow-[0_12px_40px_-4px_rgba(139,92,246,0.5),0_6px_20px_-4px_rgba(139,92,246,0.4)]
        transition-all duration-300
        ${className}
      `}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-violet-400/20 via-transparent to-indigo-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Top highlight line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

      {/* Icon */}
      <div className="relative w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
        <Users size={20} className="text-white" strokeWidth={2} />
      </div>

      {/* Text */}
      <span className="relative">צפו בדמו של מערכת הסוכנות</span>

      {/* Arrow */}
      <ArrowLeft size={20} className="relative transform group-hover:-translate-x-1 transition-transform duration-300" />
    </motion.button>
  )
}
