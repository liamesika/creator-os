'use client'

import { motion } from 'framer-motion'
import { Palette, Feather, RefreshCw, Heart } from 'lucide-react'

const reasons = [
  {
    icon: Palette,
    title: 'מותאם ליוצרי תוכן',
    description: 'נבנה מהיסוד עבור יוצרים, לא כלי גנרי שהותאם',
    gradient: 'from-pink-500 to-rose-500',
    bgGradient: 'from-pink-50 to-rose-50',
  },
  {
    icon: Feather,
    title: 'לא עמוס',
    description: 'רק מה שצריך, בלי תכונות מיותרות ובלי מורכבות',
    gradient: 'from-blue-500 to-cyan-500',
    bgGradient: 'from-blue-50 to-cyan-50',
  },
  {
    icon: RefreshCw,
    title: 'עובד עם השגרה שלך',
    description: 'מסתנכרן עם הקצב שלך, לא נגדו',
    gradient: 'from-green-500 to-emerald-500',
    bgGradient: 'from-green-50 to-emerald-50',
  },
  {
    icon: Heart,
    title: 'בנוי להתמדה',
    description: 'מערכת שמעודדת עקביות ומייצרת הרגלים',
    gradient: 'from-violet-500 to-purple-500',
    bgGradient: 'from-violet-50 to-purple-50',
  },
]

export default function WhySection() {
  return (
    <section className="section-padding relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-neutral-50" />

      <div className="container-custom relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <span className="inline-block text-sm font-semibold text-accent-600 mb-3">
            למה Creators OS?
          </span>
          <h2 className="heading-lg text-neutral-900 mb-4">
            שונה מכל מה{' '}
            <span className="gradient-text">שהכרתם</span>
          </h2>
          <p className="text-body max-w-xl mx-auto">
            לא עוד כלי ניהול משימות. מערכת שנבנתה לחיות איתה
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {reasons.map((reason, index) => (
            <motion.div
              key={reason.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="group"
            >
              <div className="h-full bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 hover:shadow-xl hover:border-neutral-200 transition-all duration-300">
                {/* Icon */}
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${reason.bgGradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
                >
                  <reason.icon
                    size={26}
                    className={`bg-gradient-to-br ${reason.gradient} bg-clip-text`}
                    style={{
                      color: reason.gradient.includes('pink')
                        ? '#ec4899'
                        : reason.gradient.includes('blue')
                        ? '#3b82f6'
                        : reason.gradient.includes('green')
                        ? '#22c55e'
                        : '#8b5cf6',
                    }}
                  />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  {reason.title}
                </h3>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  {reason.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom quote */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-12 sm:mt-16 text-center"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-full shadow-sm border border-neutral-100">
            <span className="text-lg">💡</span>
            <p className="text-sm text-neutral-600">
              <span className="font-medium text-neutral-800">
                &ldquo;הפסקתי להשתמש ב-5 כלים שונים. עכשיו הכל במקום אחד.&rdquo;
              </span>
              <span className="text-neutral-400 mr-2">— מיכל, יוצרת תוכן</span>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
