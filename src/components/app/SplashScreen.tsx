'use client'

import { motion } from 'framer-motion'

interface SplashScreenProps {
  onComplete: () => void
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      onAnimationComplete={() => {
        setTimeout(onComplete, 2500)
      }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-br from-white via-neutral-50 to-accent-50/30"
    >
      {/* Background subtle pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgb(99 102 241) 1px, transparent 0)`,
        backgroundSize: '32px 32px'
      }} />

      {/* Ambient glow */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.4, scale: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="absolute w-[500px] h-[500px] bg-accent-200 rounded-full blur-[120px]"
      />

      {/* Logo container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex flex-col items-center"
      >
        {/* Logo mark */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-6"
        >
          <svg
            width="80"
            height="80"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="splashGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="50%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#4f46e5" />
              </linearGradient>
              <linearGradient id="splashGradient2" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#4f46e5" />
                <stop offset="100%" stopColor="#818cf8" />
              </linearGradient>
            </defs>
            <motion.rect
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              x="8" y="8" width="24" height="24" rx="6"
              fill="url(#splashGradient1)"
            />
            <motion.rect
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 0.85, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              x="16" y="16" width="24" height="24" rx="6"
              fill="url(#splashGradient2)"
            />
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              d="M18 28 L28 18"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <motion.circle
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.9 }}
              cx="18" cy="28" r="2" fill="white"
            />
            <motion.circle
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 1 }}
              cx="28" cy="18" r="2" fill="white"
            />
          </svg>
        </motion.div>

        {/* Logo text */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 mb-2">
            Creators<span className="text-accent-600">OS</span>
          </h1>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="text-base text-neutral-500 mt-4"
        >
          המרחב שלך לניהול זמן ותוכן
        </motion.p>

        {/* Loading indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 1 }}
          className="mt-8 flex items-center gap-1.5"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.15,
                ease: 'easeInOut',
              }}
              className="w-2 h-2 rounded-full bg-accent-500"
            />
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
