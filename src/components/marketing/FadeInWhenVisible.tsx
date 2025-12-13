'use client'

import { ReactNode, useRef, useEffect, useState } from 'react'
import { motion, useAnimation, useInView } from 'framer-motion'

interface FadeInWhenVisibleProps {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
  once?: boolean
}

export default function FadeInWhenVisible({
  children,
  className = '',
  delay = 0,
  duration = 0.5,
  once = true,
}: FadeInWhenVisibleProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once, margin: '-50px' })
  const controls = useAnimation()
  const [hasAnimated, setHasAnimated] = useState(false)

  // Check for prefers-reduced-motion
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    if (isInView && (!once || !hasAnimated)) {
      controls.start('visible')
      setHasAnimated(true)
    }
  }, [isInView, controls, once, hasAnimated])

  // If reduced motion is preferred, skip animation
  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: {
          opacity: 0,
          y: 20,
        },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration,
            delay,
            ease: [0.25, 0.1, 0.25, 1],
          },
        },
      }}
      className={className}
      style={{
        willChange: isInView ? 'auto' : 'transform, opacity',
      }}
    >
      {children}
    </motion.div>
  )
}
