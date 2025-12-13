'use client'

import { motion } from 'framer-motion'
import { Sun, Moon, Target, CheckCircle2, TrendingUp, Star, ArrowUp } from 'lucide-react'

export default function GoalsSection() {
  return (
    <section id="goals" className="section-padding relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-50 to-white" />

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
            מטרות יומיות
          </span>
          <h2 className="heading-lg text-neutral-900 mb-4">
            כל יום מתחיל במטרה.{' '}
            <br className="hidden sm:block" />
            <span className="gradient-text">כל יום נסגר בהתקדמות</span>
          </h2>
          <p className="text-body max-w-2xl mx-auto">
            הגדר את המטרות שלך בבוקר, עקוב אחריהן במהלך היום,
            וסיים את היום עם תחושת הישג אמיתית.
          </p>
        </motion.div>

        {/* Split Cards - Morning & Evening */}
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {/* Morning Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-200/30 to-orange-200/30 blur-2xl rounded-3xl" />
            <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-neutral-100 overflow-hidden">
              {/* Header */}
              <div className="px-5 sm:px-6 py-4 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                    <Sun size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-800">תחילת יום</h3>
                    <p className="text-sm text-neutral-500">08:30 • יום שלישי</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 sm:p-6">
                <p className="text-sm text-neutral-500 mb-4">המטרות שלי להיום:</p>

                <div className="space-y-3">
                  {[
                    { text: 'לסיים לערוך את הסרטון לאינסטגרם', priority: 'גבוהה' },
                    { text: 'לענות ל-5 הודעות מלקוחות', priority: 'בינונית' },
                    { text: 'לתכנן את התוכן לשבוע הבא', priority: 'רגילה' },
                  ].map((goal, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors cursor-pointer"
                    >
                      <div className="w-5 h-5 rounded-full border-2 border-amber-400 flex items-center justify-center">
                        <Target size={10} className="text-amber-500" />
                      </div>
                      <span className="flex-1 text-sm text-neutral-700">{goal.text}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        goal.priority === 'גבוהה'
                          ? 'bg-red-100 text-red-600'
                          : goal.priority === 'בינונית'
                          ? 'bg-amber-100 text-amber-600'
                          : 'bg-neutral-100 text-neutral-500'
                      }`}>
                        {goal.priority}
                      </span>
                    </motion.div>
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-4 py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-xl font-medium text-sm shadow-lg shadow-amber-500/20"
                >
                  מתחיל את היום
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Evening Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-200/30 to-violet-200/30 blur-2xl rounded-3xl" />
            <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-neutral-100 overflow-hidden">
              {/* Header */}
              <div className="px-5 sm:px-6 py-4 bg-gradient-to-r from-indigo-50 to-violet-50 border-b border-indigo-100/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                    <Moon size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-800">סיום יום</h3>
                    <p className="text-sm text-neutral-500">20:30 • יום שלישי</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 sm:p-6">
                <p className="text-sm text-neutral-500 mb-4">סיכום היום:</p>

                <div className="space-y-3">
                  {[
                    { text: 'לסיים לערוך את הסרטון לאינסטגרם', done: true },
                    { text: 'לענות ל-5 הודעות מלקוחות', done: true },
                    { text: 'לתכנן את התוכן לשבוע הבא', done: false },
                  ].map((goal, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className={`flex items-center gap-3 p-3 rounded-xl ${
                        goal.done ? 'bg-green-50' : 'bg-neutral-50'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        goal.done
                          ? 'bg-green-500'
                          : 'border-2 border-neutral-300'
                      }`}>
                        {goal.done && <CheckCircle2 size={14} className="text-white" />}
                      </div>
                      <span className={`flex-1 text-sm ${
                        goal.done
                          ? 'text-neutral-500 line-through'
                          : 'text-neutral-700'
                      }`}>
                        {goal.text}
                      </span>
                    </motion.div>
                  ))}
                </div>

                {/* Progress */}
                <div className="mt-5 p-4 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-neutral-700">התקדמות היום</span>
                    <span className="text-sm font-bold text-indigo-600">67%</span>
                  </div>
                  <div className="h-2 bg-white rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: '67%' }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.6, duration: 0.8 }}
                      className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                    />
                  </div>
                  <p className="text-xs text-neutral-500 mt-2">
                    השלמת 2 מתוך 3 מטרות - יום מעולה!
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-12 grid grid-cols-3 gap-4 max-w-2xl mx-auto"
        >
          {[
            { icon: Star, value: '87%', label: 'השלמה שבועית', trend: '+12%' },
            { icon: Target, value: '21', label: 'מטרות שהושגו', trend: '+5' },
            { icon: TrendingUp, value: '14', label: 'ימים ברצף', trend: 'שיא!' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="text-center p-4 bg-white rounded-2xl border border-neutral-100 shadow-sm"
            >
              <div className="inline-flex p-2 bg-accent-50 rounded-xl mb-2">
                <stat.icon size={18} className="text-accent-600" />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-neutral-800">{stat.value}</p>
              <p className="text-xs text-neutral-500 mb-1">{stat.label}</p>
              <div className="inline-flex items-center gap-0.5 text-[10px] font-medium text-green-600">
                <ArrowUp size={10} />
                {stat.trend}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
