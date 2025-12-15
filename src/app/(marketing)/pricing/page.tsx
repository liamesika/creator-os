'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Check, Sparkles } from 'lucide-react'
import DemoButton from '@/components/marketing/DemoButton'
import { PRICING_CONFIG, getMonthlyPrice } from '@/config/pricing'
import { useSalesModeStore } from '@/stores/salesModeStore'
import { trackEvent } from '@/lib/analytics'

export default function PricingPage() {
  const { isEnabled: salesMode } = useSalesModeStore()
  const plans = [PRICING_CONFIG.trial, PRICING_CONFIG.basic, PRICING_CONFIG.premium]

  useEffect(() => {
    trackEvent('pricing_viewed')
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
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: 'linear-gradient(135deg, rgb(15,128,226) 0%, rgb(113,48,234) 100%)',
                }}
              >
                תמחור פשוט ושקוף
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              התחילו חינם. שדרגו מתי שמוכן לכם. בטלו בכל רגע.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 sm:py-14 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`
                  relative p-6 rounded-2xl border shadow-lg hover:shadow-xl transition-all duration-300
                  ${plan.popular
                    ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200'
                    : 'bg-white border-gray-200'
                  }
                `}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 text-sm font-semibold rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                      מומלץ
                    </span>
                  </div>
                )}

                <div className="mb-5">
                  <h3 className="text-xl font-bold mb-2 text-gray-900">{plan.nameHebrew}</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {plan.description}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900">
                      {getMonthlyPrice(plan.id)}
                    </span>
                    {plan.monthlyPrice > 0 && (
                      <span className="text-gray-600">לחודש</span>
                    )}
                  </div>
                </div>

                <div className="mb-5">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">
                    כלול בחבילה:
                  </h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check
                          className="text-green-600 flex-shrink-0 mt-0.5"
                          size={16}
                        />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Only show limitations if NOT in sales mode */}
                {!salesMode && plan.limitations.length > 0 && (
                  <div className="mb-5">
                    <ul className="space-y-1.5">
                      {plan.limitations.map((limitation) => (
                        <li
                          key={limitation}
                          className="text-xs text-gray-500"
                        >
                          • {limitation}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Link
                  href={plan.ctaLink}
                  className={`
                    block w-full py-3 px-6 rounded-xl font-semibold text-center transition-all shadow-md hover:shadow-lg
                    ${plan.popular
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                      : 'bg-gray-900 hover:bg-gray-800 text-white'
                    }
                  `}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Free Trial CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 shadow-lg"
          >
            <Sparkles className="mx-auto mb-3 text-purple-600" size={28} />
            <h3 className="text-xl font-bold mb-2 text-gray-900">מוכנים להתחיל?</h3>
            <p className="text-gray-600 mb-5">
              התחילו ניסיון חינם והתנסו בכל התכונות
            </p>
            <Link
              href="/signup"
              className="inline-block px-8 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg"
            >
              התחילו ניסיון חינם
            </Link>
          </motion.div>

          {/* Demo CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-center p-5 rounded-2xl bg-gray-50 border border-gray-200 mt-6"
          >
            <p className="text-gray-600 mb-3">
              רוצים לראות לפני שמתחילים? נסו את מצב ההדגמה
            </p>
            <DemoButton size="lg" />
          </motion.div>

          {/* Agency Link */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-8 text-center"
          >
            <p className="text-gray-600 mb-2">מנהלים סוכנות או צוות?</p>
            <Link
              href="/pricing/agencies"
              className="text-purple-600 hover:text-purple-700 font-semibold transition-colors"
            >
              צפו בפתרון לסוכנויות →
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  )
}
