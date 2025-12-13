'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Calendar,
  Sparkles,
  LineChart,
  Users,
  CheckCircle,
  ArrowLeft,
  Play,
  Target,
  Zap,
  Clock,
} from 'lucide-react'
import DemoButton from '@/components/marketing/DemoButton'

export default function HomePage() {
  const features = [
    {
      icon: Users,
      title: 'ניהול לקוחות',
      description: 'כל הלקוחות, החוזים והדדליינים במקום אחד מסודר',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Calendar,
      title: 'לוח שנה חכם',
      description: 'תזמון שבוע שלם בלחיצה עם תבניות מותאמות אישית',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Sparkles,
      title: 'יצירת תוכן AI',
      description: 'קפשנים, סקריפטים והוקים בבינה מלאכותית',
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: Target,
      title: 'מעקב יעדים',
      description: 'הגדרת יעדים שבועיים ועקיבה אחר התקדמות',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: LineChart,
      title: 'ציר פעילות',
      description: 'כל מה שקורה במערכת במקום אחד, תמיד בשליטה',
      color: 'from-indigo-500 to-purple-500',
    },
    {
      icon: CheckCircle,
      title: 'ניהול משימות',
      description: 'משימות מקושרות לאירועים עם תזכורות ומעקב',
      color: 'from-pink-500 to-rose-500',
    },
  ]

  const stats = [
    { number: '10x', label: 'זמן חסוך ביצירת תוכן', icon: Zap },
    { number: '100%', label: 'שליטה על הלקוחות', icon: Target },
    { number: '24/7', label: 'AI לשירותכם', icon: Sparkles },
  ]

  const steps = [
    { number: '1', title: 'הוסיפו לקוחות', description: 'ייבוא או הקמה מאפס תוך דקות' },
    { number: '2', title: 'תזמנו שבוע', description: 'תבניות חכמות שמתאימות לסגנון העבודה' },
    { number: '3', title: 'צרו תוכן', description: 'AI עוזר לכם לכתוב ולהפיק מהר יותר' },
  ]

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-b from-[#F2F4FC] to-white">
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

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 xl:gap-12 items-center">
            {/* Right: Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="order-2 lg:order-1 text-center lg:text-right"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200 text-purple-700 text-sm font-medium mb-5 shadow-sm"
              >
                <Sparkles size={16} className="text-purple-600" />
                <span>מערכת ניהול חכמה ליוצרי תוכן</span>
              </motion.div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 leading-[1.05]">
                <span
                  className="bg-clip-text text-transparent block"
                  style={{
                    backgroundImage: 'linear-gradient(135deg, rgb(15,128,226) 0%, rgb(113,48,234) 100%)',
                  }}
                >
                  כל מה שצריך
                  <br />
                  יוצר תוכן
                </span>
                <span className="block text-gray-900 mt-2">במקום אחד</span>
              </h1>

              {/* Subheadline */}
              <p className="text-lg sm:text-xl lg:text-xl text-gray-600 mb-6 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                ניהול לקוחות, תזמון חכם, יצירת תוכן AI ומעקב יעדים.
                <br className="hidden sm:block" />
                <span className="font-semibold text-gray-700">תפסיקו לעבוד עם 10 מערכות.</span>
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-6">
                <DemoButton size="lg" />
                <Link
                  href="/pricing"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold rounded-xl border-2 border-purple-300 text-purple-700 hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <Play size={20} className="group-hover:scale-110 transition-transform" fill="currentColor" />
                  <span>צפו בדמו</span>
                </Link>
              </div>

              {/* Social Proof */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex items-center flex-wrap justify-center lg:justify-start gap-4 sm:gap-6 text-sm text-gray-500"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle size={18} className="text-green-500" />
                  <span>התחלה מיידית</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={18} className="text-green-500" />
                  <span>ללא כרטיס אשראי</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={18} className="text-green-500" />
                  <span>ביטול בכל רגע</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Left: Dashboard Mockup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="order-1 lg:order-2 relative"
            >
              <div className="relative">
                {/* Main Dashboard Card */}
                <div className="relative rounded-3xl bg-white shadow-2xl border border-gray-200/50 overflow-hidden">
                  {/* Dashboard Header */}
                  <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-pink-600 px-6 py-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-white/30" />
                        <div className="w-3 h-3 rounded-full bg-white/30" />
                        <div className="w-3 h-3 rounded-full bg-white" />
                      </div>
                      <div className="text-white/80 text-xs font-medium">Creators OS</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Calendar size={20} className="text-white" />
                      </div>
                      <div>
                        <div className="text-white/70 text-xs mb-0.5">היום, 13 דצמבר</div>
                        <div className="text-white font-bold text-lg">4 פגישות מתוכננות</div>
                      </div>
                    </div>
                  </div>

                  {/* Dashboard Content */}
                  <div className="p-6 bg-gradient-to-b from-gray-50/50 to-white">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3 mb-5">
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-3 border border-blue-100">
                        <div className="flex items-center gap-2 mb-1">
                          <Users size={14} className="text-blue-600" />
                          <div className="text-blue-600 text-xs font-medium">לקוחות</div>
                        </div>
                        <div className="text-blue-900 font-bold text-xl">24</div>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-3 border border-purple-100">
                        <div className="flex items-center gap-2 mb-1">
                          <Sparkles size={14} className="text-purple-600" />
                          <div className="text-purple-600 text-xs font-medium">פוסטים</div>
                        </div>
                        <div className="text-purple-900 font-bold text-xl">156</div>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 border border-green-100">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle size={14} className="text-green-600" />
                          <div className="text-green-600 text-xs font-medium">משימות</div>
                        </div>
                        <div className="text-green-900 font-bold text-xl">8</div>
                      </div>
                    </div>

                    {/* Event Cards */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex-shrink-0 shadow-sm" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-gray-900 mb-0.5">צילום עם טכנולייף</div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock size={12} />
                            <span>10:00 - 12:00</span>
                          </div>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0 shadow-sm" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-gray-900 mb-0.5">עריכה ופרסום</div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock size={12} />
                            <span>14:00 - 16:00</span>
                          </div>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-purple-500" />
                      </div>

                      {/* AI Badge */}
                      <div className="flex items-center gap-2 px-3 py-2.5 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200">
                        <Sparkles size={16} className="text-orange-600" />
                        <span className="text-xs font-semibold text-orange-700">
                          AI יצר 3 קפשנים השבוע ✨
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Gradient Orbs */}
                <motion.div
                  animate={{ y: [0, -15, 0], opacity: [0.3, 0.5, 0.3] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 blur-3xl"
                />
                <motion.div
                  animate={{ y: [0, 15, 0], opacity: [0.3, 0.5, 0.3] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 blur-3xl"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-3 text-gray-900">
              כל מה שצריך יוצר תוכן מקצועי
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              פלטפורמה אחת. כל הכלים. אפס פשרות.
            </p>
          </motion.div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative bg-white rounded-2xl border border-gray-200 p-6 hover:border-purple-200 hover:shadow-xl transition-all duration-300"
              >
                {/* Icon */}
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon size={24} className="text-white" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover Gradient */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative bg-white rounded-2xl border border-gray-200 p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="inline-flex p-2 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 mb-3">
                  <stat.icon size={20} className="text-purple-600" />
                </div>
                <div
                  className="text-4xl font-bold mb-2 bg-clip-text text-transparent"
                  style={{
                    backgroundImage: 'linear-gradient(135deg, rgb(15,128,226) 0%, rgb(113,48,234) 100%)',
                  }}
                >
                  {stat.number}
                </div>
                <p className="text-base text-gray-600 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-3 text-gray-900">
              איך זה עובד?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              שלושה צעדים פשוטים להתחלה מושלמת
            </p>
          </motion.div>

          {/* Steps */}
          <div className="relative">
            {/* Connection Line (Desktop) */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-200 via-pink-200 to-purple-200 -translate-y-1/2" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              {steps.map((step, index) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="relative text-center"
                >
                  {/* Number Badge */}
                  <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 text-white text-2xl font-bold mb-4 shadow-xl mx-auto">
                    {step.number}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 blur-xl opacity-50" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-base text-gray-600">
                    {step.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: 'linear-gradient(135deg, rgb(15,128,226) 0%, rgb(113,48,234) 100%)',
                }}
              >
                מוכנים להתחיל?
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 mb-6 max-w-2xl mx-auto">
              הצטרפו ליוצרי תוכן שכבר עובדים חכם יותר
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
              <DemoButton size="lg" />
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 text-lg font-semibold text-purple-700 hover:text-purple-800 transition-colors"
              >
                <span>צרו קשר</span>
                <ArrowLeft size={20} />
              </Link>
            </div>

            <p className="text-sm text-gray-500">
              התחלה חינמית • ללא כרטיס אשראי • ביטול בכל רגע
            </p>
          </motion.div>
        </div>
      </section>
    </>
  )
}
