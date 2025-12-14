'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface SuccessConfettiProps {
  trigger: boolean
  onComplete?: () => void
}

interface Particle {
  id: number
  x: number
  y: number
  rotation: number
  scale: number
  color: string
  shape: 'circle' | 'square' | 'star'
}

const COLORS = [
  '#8B5CF6', // violet
  '#6366F1', // indigo
  '#10B981', // emerald
  '#F59E0B', // amber
  '#EC4899', // pink
]

const SHAPES = ['circle', 'square', 'star'] as const

export function SuccessConfetti({ trigger, onComplete }: SuccessConfettiProps) {
  const [particles, setParticles] = useState<Particle[]>([])
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    if (trigger && !isActive) {
      setIsActive(true)

      // Generate particles
      const newParticles: Particle[] = []
      for (let i = 0; i < 30; i++) {
        newParticles.push({
          id: i,
          x: 50 + (Math.random() - 0.5) * 40,
          y: 50,
          rotation: Math.random() * 360,
          scale: 0.5 + Math.random() * 0.5,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
        })
      }
      setParticles(newParticles)

      // Clean up after animation
      const timer = setTimeout(() => {
        setIsActive(false)
        setParticles([])
        onComplete?.()
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [trigger, isActive, onComplete])

  return (
    <AnimatePresence>
      {isActive && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{
                x: `${particle.x}vw`,
                y: `${particle.y}vh`,
                rotate: 0,
                scale: 0,
                opacity: 1,
              }}
              animate={{
                x: `${particle.x + (Math.random() - 0.5) * 50}vw`,
                y: `${particle.y + 40 + Math.random() * 30}vh`,
                rotate: particle.rotation + Math.random() * 360,
                scale: particle.scale,
                opacity: 0,
              }}
              transition={{
                duration: 1.5 + Math.random() * 0.5,
                ease: 'easeOut',
              }}
              style={{
                position: 'absolute',
                width: particle.shape === 'star' ? 16 : 12,
                height: particle.shape === 'star' ? 16 : 12,
              }}
            >
              {particle.shape === 'circle' && (
                <div
                  className="w-full h-full rounded-full"
                  style={{ backgroundColor: particle.color }}
                />
              )}
              {particle.shape === 'square' && (
                <div
                  className="w-full h-full rounded-sm"
                  style={{ backgroundColor: particle.color }}
                />
              )}
              {particle.shape === 'star' && (
                <svg viewBox="0 0 24 24" fill={particle.color}>
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  )
}

export default SuccessConfetti
