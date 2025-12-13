'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Users, CheckCircle, Mail, Sparkles, Star } from 'lucide-react'
import DemoButton from '@/components/marketing/DemoButton'
import { AGENCY_CONFIG } from '@/config/pricing'
import { useSalesModeStore } from '@/stores/salesModeStore'
import { trackEvent } from '@/lib/analytics'

export default function AgencyPricingPage() {
  const { isEnabled: salesMode } = useSalesModeStore()

  useEffect(() => {
    trackEvent('pricing_agencies_viewed')
  }, [])

  return (
    <>
      {/* Hero */}
      <section className="py-20 sm:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mx-auto mb-6">
              <Users className="text-purple-400" size={32} />
            </div>
            {salesMode && (
              <div className="mb-4">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold">
                  <Star size={16} />
                  פתרון ארגוני מתקדם
                </span>
              </div>
            )}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              {salesMode ? 'Creators OS Enterprise' : AGENCY_CONFIG.title}
            </h1>
            <p className="text-lg sm:text-xl text-neutral-300 max-w-2xl mx-auto">
              {AGENCY_CONFIG.subtitle}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              למי זה מתאים?
            </h2>
            <p className="text-neutral-400 max-w-2xl mx-auto">
              {salesMode
                ? 'ארגונים שמחפשים שליטה מלאה על תהליכי התוכן שלהם'
                : 'סוכנויות וצוותים שמנהלים לקוחות מרובים'}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {AGENCY_CONFIG.useCases.map((useCase, index) => (
              <motion.div
                key={useCase.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`
                  p-6 rounded-2xl border transition-colors
                  ${salesMode
                    ? 'bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/50'
                    : 'bg-neutral-900 border-neutral-800'
                  }
                `}
              >
                <h3 className="text-xl font-bold mb-2">{useCase.title}</h3>
                <p className="text-neutral-400">{useCase.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="pb-16 bg-neutral-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-center">
              {salesMode ? 'יכולות מתקדמות' : 'כלול בפתרון'}
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {AGENCY_CONFIG.benefits.map((benefit, index) => (
              <motion.div
                key={benefit}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className={`
                  flex items-start gap-3 p-4 rounded-xl
                  ${salesMode
                    ? 'bg-gradient-to-r from-purple-900/30 to-transparent'
                    : 'bg-neutral-900/50'
                  }
                `}
              >
                <CheckCircle
                  className={salesMode ? 'text-purple-400' : 'text-green-400'}
                  size={20}
                />
                <span className="text-neutral-200">{benefit}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="p-8 sm:p-12 rounded-2xl bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/30 text-center"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              {salesMode ? 'בואו נדבר על הצרכים שלכם' : 'מוכנים לראות איך זה עובד?'}
            </h2>
            <p className="text-lg text-neutral-300 mb-8 max-w-2xl mx-auto">
              {salesMode
                ? 'נבנה פתרון מותאם בדיוק לארגון שלכם'
                : 'נציג את המערכת ונבנה פתרון מותאם לסוכנות'}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Link
                href="/contact?type=agency"
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold transition-all flex items-center gap-2"
              >
                <Mail size={20} />
                <span>{salesMode ? 'בקשו פגישה' : 'השאירו פרטים'}</span>
              </Link>
              <DemoButton size="lg" variant="secondary" />
            </div>

            <p className="text-sm text-neutral-400">
              או שלחו אימייל ל-{' '}
              <a
                href={`mailto:${AGENCY_CONFIG.contactEmail}`}
                className="text-purple-400 hover:text-purple-300 transition-colors"
              >
                {AGENCY_CONFIG.contactEmail}
              </a>
            </p>
          </motion.div>

          {/* Back to individual pricing */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-12 text-center"
          >
            <p className="text-neutral-400 mb-2">יוצר בודד?</p>
            <Link
              href="/pricing"
              className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
            >
              צפו בתמחור ליחידים →
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  )
}
