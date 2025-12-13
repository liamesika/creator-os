'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Briefcase, Mail } from 'lucide-react'

export default function CareersPage() {
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
              <Briefcase className="text-purple-400" size={32} />
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              קריירה ב-Creators OS
            </h1>
            <p className="text-lg sm:text-xl text-neutral-300 max-w-2xl mx-auto">
              בונים את העתיד של ניהול תוכן ליוצרים
            </p>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section className="pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">
              מי אנחנו
            </h2>
            <div className="space-y-4 text-neutral-300">
              <p>
                Creators OS היא סטארט-אפ ישראלי שבונה את מערכת ההפעלה הבאה
                עבור יוצרי תוכן ומנהלי קהילה.
              </p>
              <p>
                אנחנו מאמינים שיוצרי תוכן מקצועיים זקוקים לכלים מקצועיים -
                לא פתרונות זמניים או מערכות כלליות שלא בנויות בשבילם.
              </p>
              <p>
                אנחנו צוות קטן, ממוקד ומסור למשימה - לבנות את הפלטפורמה
                הטובה ביותר עבור יוצרי תוכן.
              </p>
            </div>
          </motion.div>

          {/* Current Openings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-16"
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">
              משרות פתוחות
            </h2>
            <div className="p-8 rounded-2xl bg-neutral-900 border border-neutral-800 text-center">
              <p className="text-neutral-400 mb-6">
                אין משרות פתוחות כרגע, אבל תמיד מעניין אותנו לשמוע מאנשי
                מקצוע מוכשרים.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold transition-all"
              >
                <Mail size={20} />
                <span>שלחו מועמדות כללית</span>
              </Link>
            </div>
          </motion.div>

          {/* Values */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">
              איך זה לעבוד איתנו
            </h2>
            <div className="space-y-6">
              <div className="p-6 rounded-xl bg-neutral-900 border border-neutral-800">
                <h3 className="text-lg font-semibold mb-2">עבודה מרחוק</h3>
                <p className="text-neutral-400">
                  אנחנו מאמינים בעבודה מרחוק. תעבדו מהמקום שהכי נוח לכם.
                </p>
              </div>
              <div className="p-6 rounded-xl bg-neutral-900 border border-neutral-800">
                <h3 className="text-lg font-semibold mb-2">השפעה אמיתית</h3>
                <p className="text-neutral-400">
                  בצוות קטן, כל אחד משפיע באמת. הרעיונות והעבודה שלכם משנים
                  את המוצר.
                </p>
              </div>
              <div className="p-6 rounded-xl bg-neutral-900 border border-neutral-800">
                <h3 className="text-lg font-semibold mb-2">צמיחה וכישורים</h3>
                <p className="text-neutral-400">
                  נחשפים לטכנולוגיות חדשות, לומדים כל הזמן, וגדלים יחד עם
                  המוצר.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
