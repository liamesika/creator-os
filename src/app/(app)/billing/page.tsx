'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Crown, Sparkles, Zap } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { PRICING_PLANS, type BillingInterval } from '@/types/billing'
import { toast } from 'sonner'
import { logActivity } from '@/lib/activity-logger'

export default function BillingPage() {
  const { user } = useAuth()
  const [interval, setInterval] = useState<BillingInterval>('monthly')
  const [isUpgrading, setIsUpgrading] = useState(false)

  const currentPlan = user?.plan || 'free'
  const isPremium = currentPlan === 'premium'

  const handleUpgrade = async (planId: string, selectedInterval: BillingInterval) => {
    setIsUpgrading(true)

    logActivity('upgrade_clicked', undefined, undefined, { plan: planId, interval: selectedInterval })

    // Mock Stripe checkout for now
    toast.success('בקרוב: תשלום מאובטח דרך Stripe')

    setTimeout(() => {
      setIsUpgrading(false)
      // When real payment succeeds, log plan_changed
      // logActivity('plan_changed', undefined, undefined, { plan: 'premium' })
    }, 1500)
  }

  const handleCancelSubscription = async () => {
    if (confirm('האם אתה בטוח שברצונך לבטל את המנוי?')) {
      toast.success('המנוי בוטל. יישאר פעיל עד סוף התקופה.')
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-100 rounded-full mb-4">
          <Crown className="text-accent-600" size={20} />
          <span className="text-sm font-bold text-accent-700">
            התוכנית הנוכחית: {PRICING_PLANS[currentPlan].name}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-3">
          בחרי את התוכנית המתאימה לך
        </h1>
        <p className="text-neutral-600 text-lg">
          התחילי חינם. שדרגי כשאת מוכנה להרחיב.
        </p>
      </motion.div>

      {/* Billing Toggle */}
      {!isPremium && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-center gap-3 mb-8"
        >
          <span className={`text-sm font-medium ${interval === 'monthly' ? 'text-neutral-900' : 'text-neutral-500'}`}>
            חודשי
          </span>
          <button
            onClick={() => setInterval(interval === 'monthly' ? 'yearly' : 'monthly')}
            className="relative w-14 h-8 bg-neutral-200 rounded-full transition-colors hover:bg-neutral-300"
          >
            <motion.div
              animate={{ x: interval === 'yearly' ? 24 : 2 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="absolute top-1 w-6 h-6 bg-accent-600 rounded-full"
            />
          </button>
          <span className={`text-sm font-medium ${interval === 'yearly' ? 'text-neutral-900' : 'text-neutral-500'}`}>
            שנתי
          </span>
          <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
            חסכו 17%
          </span>
        </motion.div>
      )}

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-8">
        {Object.values(PRICING_PLANS).map((plan, index) => {
          const price = plan.price[interval]
          const isCurrentPlan = plan.id === currentPlan

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`dashboard-card relative ${
                plan.recommended
                  ? 'border-accent-500 shadow-xl ring-2 ring-accent-500/20'
                  : ''
              }`}
            >
              {plan.recommended && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-accent-600 to-accent-500 text-white rounded-full text-sm font-bold shadow-lg">
                    <Sparkles size={14} />
                    מומלץ
                  </div>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-neutral-900 mb-2">
                  {plan.name}
                </h3>
                {price === 0 ? (
                  <div className="text-4xl font-bold text-neutral-900">חינמי</div>
                ) : (
                  <>
                    <div className="text-5xl font-bold text-neutral-900">
                      ₪{price}
                    </div>
                    <div className="text-sm text-neutral-600 mt-1">
                      {interval === 'monthly' ? 'לחודש' : 'לשנה'}
                    </div>
                    {interval === 'yearly' && (
                      <div className="text-xs text-green-600 font-bold mt-1">
                        ~₪{Math.round(price / 12)} לחודש
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Features */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2">
                  <Check className="text-green-600 flex-shrink-0" size={18} />
                  <span className="text-neutral-700">
                    {plan.features.companies === 'unlimited'
                      ? 'חברות ללא הגבלה'
                      : `עד ${plan.features.companies} חברות`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="text-green-600 flex-shrink-0" size={18} />
                  <span className="text-neutral-700">
                    {plan.features.eventsPerMonth === 'unlimited'
                      ? 'אירועים ללא הגבלה'
                      : `עד ${plan.features.eventsPerMonth} אירועים בחודש`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="text-green-600 flex-shrink-0" size={18} />
                  <span className="text-neutral-700">
                    {plan.features.activeTasks === 'unlimited'
                      ? 'משימות ללא הגבלה'
                      : `עד ${plan.features.activeTasks} משימות פעילות`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="text-green-600 flex-shrink-0" size={18} />
                  <span className="text-neutral-700">
                    {plan.features.aiGenerationsPerMonth === 'unlimited'
                      ? 'AI ללא הגבלה'
                      : `עד ${plan.features.aiGenerationsPerMonth} דורות AI בחודש`}
                  </span>
                </div>
                {plan.features.prioritySupport && (
                  <div className="flex items-center gap-2">
                    <Zap className="text-accent-600 flex-shrink-0" size={18} />
                    <span className="text-neutral-700 font-medium">
                      תמיכה עדיפה
                    </span>
                  </div>
                )}
              </div>

              {/* CTA */}
              {isCurrentPlan ? (
                <button
                  disabled
                  className="w-full btn-app-outline opacity-50 cursor-not-allowed"
                >
                  התוכנית הנוכחית
                </button>
              ) : plan.id === 'free' ? (
                <button
                  disabled
                  className="w-full btn-app-outline opacity-50 cursor-not-allowed"
                >
                  לא זמין
                </button>
              ) : (
                <button
                  onClick={() => handleUpgrade(plan.id, interval)}
                  disabled={isUpgrading}
                  className="w-full btn-app-primary flex items-center justify-center gap-2"
                >
                  {isUpgrading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        <Crown size={18} />
                      </motion.div>
                      משדרג...
                    </>
                  ) : (
                    <>
                      <Crown size={18} />
                      שדרג עכשיו
                    </>
                  )}
                </button>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Current Subscription Details */}
      {isPremium && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="dashboard-card max-w-2xl mx-auto"
        >
          <h3 className="text-lg font-bold text-neutral-900 mb-4">
            פרטי המנוי
          </h3>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span className="text-neutral-600">תוכנית:</span>
              <span className="font-bold text-neutral-900">פרימיום חודשי</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">מחיר:</span>
              <span className="font-bold text-neutral-900">₪49 לחודש</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">התחדשות הבאה:</span>
              <span className="font-bold text-neutral-900">
                {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('he-IL')}
              </span>
            </div>
          </div>

          <button
            onClick={handleCancelSubscription}
            className="w-full btn-app-outline text-red-600 border-red-200 hover:bg-red-50"
          >
            ביטול מנוי
          </button>
        </motion.div>
      )}

      {/* FAQ / Trust Signals */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-12 text-center text-sm text-neutral-600 max-w-2xl mx-auto"
      >
        <p className="mb-2">💳 תשלום מאובטח דרך Stripe</p>
        <p className="mb-2">🔒 ניתן לבטל בכל עת</p>
        <p>✨ ללא התחייבות ארוכת טווח</p>
      </motion.div>
    </div>
  )
}
