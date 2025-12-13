'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Sparkles, ArrowLeft, Check } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useCompaniesStore } from '@/stores/companiesStore'
import { useCalendarStore } from '@/stores/calendarStore'
import { useGoalsStore } from '@/stores/goalsStore'
import { CREATOR_TYPES, type CreatorType, type OnboardingStep } from '@/types/onboarding'
import { BRAND_TYPE_PRESETS } from '@/types/company'
import { CATEGORY_PRESETS } from '@/types/calendar'
import { getTodayDateString } from '@/types/goal'

const steps: OnboardingStep[] = [
  'welcome',
  'creator-type',
  'first-company',
  'first-event',
  'first-goals',
  'complete'
]

export default function OnboardingPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { createCompany } = useCompaniesStore()
  const { addEvent } = useCalendarStore()
  const { setGoalsForDate } = useGoalsStore()

  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [creatorType, setCreatorType] = useState<CreatorType | null>(null)
  const [companyName, setCompanyName] = useState('')
  const [eventTitle, setEventTitle] = useState('')
  const [goals, setGoals] = useState(['', '', ''])

  const currentStep = steps[currentStepIndex]
  const progress = ((currentStepIndex + 1) / steps.length) * 100

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1)
    }
  }

  const handleSkip = () => {
    if (currentStep === 'complete') {
      router.push('/dashboard')
    } else {
      handleNext()
    }
  }

  const handleCreateCompany = async () => {
    if (!companyName.trim()) return

    await createCompany({
      name: companyName,
      brandType: 'brand',
      status: 'ACTIVE',
      contract: { contractType: 'NONE' },
      paymentTerms: {
        paymentModel: 'MONTHLY',
        currency: 'ILS',
      },
    })

    handleNext()
  }

  const handleCreateEvent = async () => {
    if (!eventTitle.trim()) return

    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)

    await addEvent({
      category: 'story-shoot',
      title: eventTitle,
      date: tomorrow,
      startTime: '10:00',
      endTime: '11:00',
      isAllDay: false,
      reminders: [],
      linkedTasks: [],
    })

    handleNext()
  }

  const handleCreateGoals = async () => {
    const validGoals = goals.filter(g => g.trim())
    if (validGoals.length === 0) return

    await setGoalsForDate(
      getTodayDateString(),
      validGoals.map(title => ({ title, status: 'NOT_DONE' }))
    )

    handleNext()
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 'welcome':
        return (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center max-w-lg mx-auto"
          >
            <div className="text-6xl mb-6">👋</div>
            <h1 className="text-4xl font-bold text-neutral-900 mb-4">
              ברוכה הבאה ל-Creators OS!
            </h1>
            <p className="text-xl text-neutral-600 mb-8">
              בואי נגדיר את המערכת שלך ב-3 דקות
            </p>
            <button onClick={handleNext} className="btn-app-primary px-8 py-4 text-lg">
              בואי נתחיל ✨
            </button>
          </motion.div>
        )

      case 'creator-type':
        return (
          <motion.div
            key="creator-type"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <h2 className="text-3xl font-bold text-neutral-900 mb-2 text-center">
              מה את עושה?
            </h2>
            <p className="text-neutral-600 mb-8 text-center">
              זה יעזור לנו להתאים את החוויה בשבילך
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
              {CREATOR_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => {
                    setCreatorType(type.id)
                    setTimeout(handleNext, 300)
                  }}
                  className={`dashboard-card text-right hover:shadow-lg hover:border-accent-300 transition-all ${
                    creatorType === type.id ? 'border-accent-500 bg-accent-50' : ''
                  }`}
                >
                  <div className="text-4xl mb-3">{type.icon}</div>
                  <h3 className="text-lg font-bold text-neutral-900 mb-1">
                    {type.label}
                  </h3>
                  <p className="text-sm text-neutral-600">
                    {type.description}
                  </p>
                </button>
              ))}
            </div>
          </motion.div>
        )

      case 'first-company':
        return (
          <motion.div
            key="first-company"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-md mx-auto"
          >
            <div className="text-5xl mb-4 text-center">🏢</div>
            <h2 className="text-3xl font-bold text-neutral-900 mb-2 text-center">
              הוסיפי חברה ראשונה
            </h2>
            <p className="text-neutral-600 mb-8 text-center">
              מותג או לקוח שאת עובדת איתו
            </p>

            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="שם החברה..."
              className="input-app mb-6"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCreateCompany()}
            />

            <div className="flex gap-3">
              <button onClick={handleSkip} className="btn-app-outline flex-1">
                דלגי
              </button>
              <button
                onClick={handleCreateCompany}
                disabled={!companyName.trim()}
                className="btn-app-primary flex-1"
              >
                הוסיפי
              </button>
            </div>
          </motion.div>
        )

      case 'first-event':
        return (
          <motion.div
            key="first-event"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-md mx-auto"
          >
            <div className="text-5xl mb-4 text-center">📅</div>
            <h2 className="text-3xl font-bold text-neutral-900 mb-2 text-center">
              תזכורת ראשונה
            </h2>
            <p className="text-neutral-600 mb-8 text-center">
              משהו שאת רוצה לזכור מחר
            </p>

            <input
              type="text"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              placeholder="למשל: צילום סטורי חדש"
              className="input-app mb-6"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCreateEvent()}
            />

            <div className="flex gap-3">
              <button onClick={handleSkip} className="btn-app-outline flex-1">
                דלגי
              </button>
              <button
                onClick={handleCreateEvent}
                disabled={!eventTitle.trim()}
                className="btn-app-primary flex-1"
              >
                הוסיפי
              </button>
            </div>
          </motion.div>
        )

      case 'first-goals':
        return (
          <motion.div
            key="first-goals"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-md mx-auto"
          >
            <div className="text-5xl mb-4 text-center">🎯</div>
            <h2 className="text-3xl font-bold text-neutral-900 mb-2 text-center">
              מה המטרות להיום?
            </h2>
            <p className="text-neutral-600 mb-8 text-center">
              1-3 דברים חשובים שאת רוצה להשיג
            </p>

            <div className="space-y-3 mb-6">
              {goals.map((goal, index) => (
                <input
                  key={index}
                  type="text"
                  value={goal}
                  onChange={(e) => {
                    const newGoals = [...goals]
                    newGoals[index] = e.target.value
                    setGoals(newGoals)
                  }}
                  placeholder={`מטרה ${index + 1}...`}
                  className="input-app"
                  autoFocus={index === 0}
                />
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={handleSkip} className="btn-app-outline flex-1">
                דלגי
              </button>
              <button
                onClick={handleCreateGoals}
                disabled={goals.every(g => !g.trim())}
                className="btn-app-primary flex-1"
              >
                סיימתי
              </button>
            </div>
          </motion.div>
        )

      case 'complete':
        return (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-lg mx-auto"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Check className="text-green-600" size={48} />
            </motion.div>

            <h1 className="text-4xl font-bold text-neutral-900 mb-4">
              את מוכנה! 🎉
            </h1>
            <p className="text-xl text-neutral-600 mb-8">
              כל הכלים שלך ממתינים לך בדשבורד
            </p>

            <button
              onClick={() => router.push('/dashboard')}
              className="btn-app-primary px-8 py-4 text-lg inline-flex items-center gap-2"
            >
              <Sparkles size={20} />
              בואי נתחיל לעבוד
            </button>
          </motion.div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent-50 via-white to-purple-50 flex flex-col">
      {/* Progress Bar */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-lg border-b border-neutral-100 z-10">
        <div className="h-1 bg-neutral-200">
          <motion.div
            className="h-full bg-gradient-to-r from-accent-500 to-accent-600"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Back button */}
        {currentStepIndex > 0 && currentStep !== 'complete' && (
          <div className="p-4">
            <button
              onClick={() => setCurrentStepIndex(currentStepIndex - 1)}
              className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900"
            >
              <ArrowLeft size={20} />
              <span>חזור</span>
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <AnimatePresence mode="wait">
          {renderStepContent()}
        </AnimatePresence>
      </div>

      {/* Skip button */}
      {currentStep !== 'welcome' && currentStep !== 'complete' && (
        <div className="p-4 text-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-neutral-500 hover:text-neutral-700 text-sm"
          >
            דלגי על ההדרכה
          </button>
        </div>
      )}
    </div>
  )
}
