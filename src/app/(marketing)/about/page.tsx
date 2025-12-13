'use client'

import { motion } from 'framer-motion'
import { Target, Lightbulb, Users, Heart, Zap, Shield } from 'lucide-react'
import DemoButton from '@/components/marketing/DemoButton'

export default function AboutPage() {
  const values = [
    {
      icon: Lightbulb,
      title: 'פשטות',
      description: 'כלים טובים צריכים להיות אינטואיטיביים. לא צריך הדרכה כדי להשתמש ב-Creators OS.',
      color: 'from-yellow-500 to-orange-500',
    },
    {
      icon: Users,
      title: 'התמקדות במשתמש',
      description: 'כל תכונה מגיעה מצורך אמיתי. אנחנו מקשיבים ובונים את מה שצריך.',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Shield,
      title: 'איכות',
      description: 'אנחנו לא משחררים תכונות שלא עובדות מצוין. כל פיצ\'ר עובר בדיקות קפדניות.',
      color: 'from-green-500 to-emerald-500',
    },
  ]

  return (
    <>
      {/* Hero */}
      <section className="relative py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-[#F2F4FC] to-white overflow-hidden">
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

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200 text-purple-700 text-sm font-medium mb-5">
              <Heart size={16} className="text-purple-600" />
              <span>הסיפור שלנו</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 leading-tight">
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: 'linear-gradient(135deg, rgb(15,128,226) 0%, rgb(113,48,234) 100%)',
                }}
              >
                בונים את העתיד
                <br />
                של יצירת תוכן
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              אנחנו בונים את מערכת הניהול המושלמת ליוצרי תוכן ומנהלי קהילה.
              <br className="hidden sm:block" />
              <span className="font-semibold text-gray-700">מקום אחד. כל הכלים. אפס פשרות.</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-center">
            {/* Icon */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-2 lg:order-1"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-red-100 to-orange-100 rounded-3xl blur-3xl opacity-30" />
                <div className="relative bg-gradient-to-br from-red-50 to-orange-50 rounded-3xl p-8 border border-red-100">
                  <Lightbulb size={80} className="text-red-500 mx-auto" />
                </div>
              </div>
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-1 lg:order-2"
            >
              <div className="inline-flex px-4 py-2 rounded-full bg-red-100 text-red-700 text-sm font-semibold mb-4">
                הבעיה
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                הכאוס שלא נגמר
              </h2>
              <div className="space-y-3 text-base text-gray-600 leading-relaxed">
                <p>
                  יוצרי תוכן ומנהלי קהילה עובדים היום עם <strong className="text-gray-900">עשרות כלים שונים</strong>:
                  אקסל ללקוחות, גוגל קלנדר לאירועים, טודויסט למשימות, נושן לתוכן, ועוד ועוד.
                </p>
                <p>
                  התוצאה? <strong className="text-gray-900">כאוס מוחלט.</strong> מידע מפוזר. זמן מבוזבז על מעבר בין
                  מערכות. וחוסר בקרה על העבודה.
                </p>
                <p>
                  למרות שיש עשרות מערכות ניהול פרויקטים, <strong className="text-gray-900">אף אחת לא בנויה במיוחד</strong> עבור
                  צורכי יוצרי התוכן - ניהול לקוחות, תזמון תוכן, יצירה, וביצוע.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-center">
            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-semibold mb-4">
                החזון
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                הפלטפורמה האחת
              </h2>
              <div className="space-y-3 text-base text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-900">Creators OS</strong> נבנה כדי לתת ליוצרי תוכן את הכלי האחד שבו הם
                  צריכים - מקום אחד לנהל לקוחות, לתזמן תוכן, לעקוב אחרי משימות, ולייצר תוכן באמצעות AI.
                </p>
                <p>
                  אנחנו מאמינים שיוצרי תוכן מקצועיים צריכים <strong className="text-gray-900">כלים מקצועיים.</strong> לא
                  פתרונות זמניים. לא עשרות מערכות מפוזרות. אלא פלטפורמה אחת, חזקה, שנבנתה במיוחד בשבילם.
                </p>
                <p>
                  המטרה שלנו היא להפוך את Creators OS ל<strong className="text-gray-900">מערכת ההפעלה הסטנדרטית</strong> של
                  כל יוצר תוכן ומנהל קהילה מקצועי.
                </p>
              </div>
            </motion.div>

            {/* Icon */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-1 lg:order-2"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl blur-3xl opacity-30" />
                <div className="relative bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8 border border-purple-100">
                  <Target size={80} className="text-purple-600 mx-auto" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
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
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: 'linear-gradient(135deg, rgb(15,128,226) 0%, rgb(113,48,234) 100%)',
                }}
              >
                הערכים שלנו
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              העקרונות שמנחים אותנו בכל החלטה
            </p>
          </motion.div>

          {/* Values Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative bg-white rounded-2xl border border-gray-200 p-6 hover:border-purple-200 hover:shadow-xl transition-all duration-300"
              >
                {/* Icon */}
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${value.color} mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <value.icon size={24} className="text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {value.description}
                </p>

                {/* Hover Gradient */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${value.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex p-3 rounded-2xl bg-white shadow-lg mb-4">
              <Zap size={36} className="text-purple-600" />
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: 'linear-gradient(135deg, rgb(15,128,226) 0%, rgb(113,48,234) 100%)',
                }}
              >
                הצטרפו למהפכה
              </span>
            </h2>

            <p className="text-lg sm:text-xl text-gray-600 mb-6 max-w-2xl mx-auto">
              הפכו לחלק מקהילת יוצרי התוכן שכבר עובדים חכם יותר
            </p>

            <DemoButton size="lg" />

            <p className="mt-4 text-sm text-gray-500">
              התחלה חינמית • ללא כרטיס אשראי • ביטול בכל רגע
            </p>
          </motion.div>
        </div>
      </section>
    </>
  )
}
