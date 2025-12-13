'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Users, CheckCircle, Mail } from 'lucide-react'
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
      <section className="relative py-12 sm:py-16 bg-gradient-to-b from-[#F2F4FC] to-white overflow-hidden">
        {/* Background Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(to right, #000 1px, transparent 1px),
              linear-gradient(to bottom, #000 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 border border-purple-200 mb-4">
              <Users size={24} className="text-purple-600" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: 'linear-gradient(135deg, rgb(15,128,226) 0%, rgb(113,48,234) 100%)',
                }}
              >
                {salesMode ? 'Creators OS Enterprise' : AGENCY_CONFIG.title}
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              {AGENCY_CONFIG.subtitle}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="py-12 sm:py-14 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-3 text-gray-900">
              למי זה מתאים?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {salesMode
                ? 'ארגונים שמחפשים שליטה מלאה על תהליכי התוכן שלהם'
                : 'סוכנויות וצוותים שמנהלים לקוחות מרובים'}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {AGENCY_CONFIG.useCases.map((useCase, index) => (
              <motion.div
                key={useCase.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-6 rounded-2xl border border-gray-200 bg-white hover:border-purple-200 hover:shadow-xl transition-all duration-300"
              >
                <h3 className="text-xl font-bold mb-2 text-gray-900">{useCase.title}</h3>
                <p className="text-gray-600">{useCase.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-12 sm:py-14 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-10"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-3 text-center text-gray-900">
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
                className="flex items-start gap-3 p-4 rounded-xl bg-white border border-gray-200"
              >
                <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                <span className="text-gray-700">{benefit}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-14 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 text-center shadow-lg"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900">
              {salesMode ? 'בואו נדבר על הצרכים שלכם' : 'מוכנים לראות איך זה עובד?'}
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              {salesMode
                ? 'נבנה פתרון מותאם בדיוק לארגון שלכם'
                : 'נציג את המערכת ונבנה פתרון מותאם לסוכנות'}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <Link
                href="/contact?type=agency"
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold transition-all shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <Mail size={20} />
                <span>{salesMode ? 'בקשו פגישה' : 'השאירו פרטים'}</span>
              </Link>
              <DemoButton size="lg" />
            </div>

            <p className="text-sm text-gray-600">
              או שלחו אימייל ל-{' '}
              <a
                href={`mailto:${AGENCY_CONFIG.contactEmail}`}
                className="text-purple-600 hover:text-purple-700 font-medium transition-colors"
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
            className="mt-8 text-center"
          >
            <p className="text-gray-600 mb-2">יוצר בודד?</p>
            <Link
              href="/pricing"
              className="text-purple-600 hover:text-purple-700 font-semibold transition-colors"
            >
              צפו בתמחור ליחידים →
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  )
}
