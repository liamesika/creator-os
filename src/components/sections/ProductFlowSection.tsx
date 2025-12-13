'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import {
  LayoutDashboard,
  CalendarDays,
  Target,
  ListTodo,
  Sparkles,
} from 'lucide-react'

const features = [
  {
    icon: LayoutDashboard,
    title: 'סקירה מרכזית',
    description: 'הכל במקום אחד - מטרות, משימות, אירועים ותובנות',
    gradient: 'from-accent-500 to-accent-600',
    bgGradient: 'from-accent-50 to-accent-100',
  },
  {
    icon: CalendarDays,
    title: 'יומן חכם',
    description: 'לא סתם לוח שנה - מערכת שמבינה את העבודה שלך',
    gradient: 'from-primary-500 to-primary-600',
    bgGradient: 'from-primary-50 to-primary-100',
  },
  {
    icon: Target,
    title: 'מטרות יומיות',
    description: 'הגדר 1-3 מטרות ביום ותראה את ההתקדמות',
    gradient: 'from-green-500 to-emerald-600',
    bgGradient: 'from-green-50 to-emerald-100',
  },
  {
    icon: ListTodo,
    title: 'משימות ותזכורות',
    description: 'ניהול משימות פשוט עם תזכורות חכמות',
    gradient: 'from-orange-500 to-amber-600',
    bgGradient: 'from-orange-50 to-amber-100',
  },
  {
    icon: Sparkles,
    title: 'עזרה מבוססת AI',
    description: 'רעיונות, טקסטים והצעות בדיוק כשצריך',
    gradient: 'from-violet-500 to-purple-600',
    bgGradient: 'from-violet-50 to-purple-100',
  },
]

export default function ProductFlowSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])

  return (
    <section
      id="features"
      ref={sectionRef}
      className="section-padding relative overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-neutral-50" />

      <motion.div style={{ opacity }} className="container-custom relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <span className="inline-block text-sm font-semibold text-accent-600 mb-3">
            איך זה עובד
          </span>
          <h2 className="heading-lg text-neutral-900 mb-4">
            השגרה היומית שלך,{' '}
            <span className="gradient-text">בצורה חדשה</span>
          </h2>
          <p className="text-body max-w-2xl mx-auto">
            כל מה שצריך כדי לנהל את היום בצורה חכמה ויעילה
          </p>
        </motion.div>

        {/* Horizontal Scroll Cards (Desktop) */}
        <div className="hidden lg:block">
          <div className="flex gap-6 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="flex-shrink-0 w-72"
              >
                <div className="h-full card-elevated p-6 group cursor-pointer">
                  {/* Icon */}
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.bgGradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon
                      size={26}
                      className={`bg-gradient-to-br ${feature.gradient} bg-clip-text`}
                      style={{
                        color: feature.gradient.includes('accent')
                          ? '#6366f1'
                          : feature.gradient.includes('primary')
                          ? '#0c8ee6'
                          : feature.gradient.includes('green')
                          ? '#22c55e'
                          : feature.gradient.includes('orange')
                          ? '#f97316'
                          : '#8b5cf6',
                      }}
                    />
                  </div>

                  {/* Content */}
                  <h3 className="heading-sm text-neutral-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-body-sm">{feature.description}</p>

                  {/* Mockup placeholder */}
                  <div
                    className={`mt-5 h-36 rounded-xl bg-gradient-to-br ${feature.bgGradient} flex items-center justify-center overflow-hidden relative`}
                  >
                    <div className="absolute inset-0 bg-white/40" />
                    <div className="relative bg-white/80 backdrop-blur-sm rounded-lg p-3 shadow-sm">
                      <div className="w-24 h-2 bg-neutral-200 rounded mb-2" />
                      <div className="w-16 h-2 bg-neutral-100 rounded" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Grid Cards (Mobile & Tablet) */}
        <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="card p-5 sm:p-6"
            >
              {/* Icon */}
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.bgGradient} flex items-center justify-center mb-4`}
              >
                <feature.icon
                  size={22}
                  style={{
                    color: feature.gradient.includes('accent')
                      ? '#6366f1'
                      : feature.gradient.includes('primary')
                      ? '#0c8ee6'
                      : feature.gradient.includes('green')
                      ? '#22c55e'
                      : feature.gradient.includes('orange')
                      ? '#f97316'
                      : '#8b5cf6',
                  }}
                />
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-neutral-900 mb-1.5">
                {feature.title}
              </h3>
              <p className="text-sm text-neutral-500">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Progress indicator dots */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="hidden lg:flex justify-center gap-2 mt-8"
        >
          {features.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${
                i === 0 ? 'bg-accent-500' : 'bg-neutral-300'
              }`}
            />
          ))}
        </motion.div>
      </motion.div>
    </section>
  )
}
