'use client'

import { motion } from 'framer-motion'
import {
  Calendar,
  CheckCircle2,
  Clock,
  Target,
  TrendingUp,
  Zap,
  MessageSquare,
  Bell,
  ChevronLeft,
} from 'lucide-react'

export default function DashboardMockup() {
  return (
    <div className="relative perspective-1000">
      <motion.div
        initial={{ rotateX: 5, rotateY: -5 }}
        animate={{ rotateX: 0, rotateY: 0 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="relative preserve-3d"
      >
        {/* Main Dashboard Container */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden">
          {/* Top Bar */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-neutral-50 border-b border-neutral-100">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-400" />
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-400" />
              </div>
              <span className="text-xs sm:text-sm text-neutral-400 font-medium hidden sm:inline">Creators OS</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Bell size={16} className="text-neutral-400" />
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-accent-100 flex items-center justify-center">
                <span className="text-[10px] sm:text-xs font-medium text-accent-600">מ</span>
              </div>
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Greeting & Date */}
            <div className="flex items-start justify-between">
              <div>
                <motion.h2
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-lg sm:text-xl font-bold text-neutral-800"
                >
                  בוקר טוב, מיכל
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-xs sm:text-sm text-neutral-500 mt-0.5"
                >
                  יום שלישי, 15 בינואר
                </motion.p>
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.7, type: 'spring' }}
                className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 bg-accent-50 rounded-lg"
              >
                <TrendingUp size={14} className="text-accent-600" />
                <span className="text-xs font-medium text-accent-700">87% ביצוע</span>
              </motion.div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              {[
                { icon: Target, label: 'מטרות', value: '2/3', color: 'text-accent-600', bg: 'bg-accent-50' },
                { icon: CheckCircle2, label: 'משימות', value: '8/12', color: 'text-green-600', bg: 'bg-green-50' },
                { icon: Clock, label: 'שעות', value: '4.5', color: 'text-primary-600', bg: 'bg-primary-50' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                  className="bg-neutral-50 rounded-lg sm:rounded-xl p-2.5 sm:p-4 text-center"
                >
                  <div className={`inline-flex p-1.5 sm:p-2 ${stat.bg} rounded-lg mb-1.5 sm:mb-2`}>
                    <stat.icon size={14} className={stat.color} />
                  </div>
                  <p className="text-base sm:text-lg font-bold text-neutral-800">{stat.value}</p>
                  <p className="text-[10px] sm:text-xs text-neutral-500">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Today's Goals */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="bg-gradient-to-br from-accent-50 to-accent-100/50 rounded-xl sm:rounded-2xl p-3 sm:p-4"
            >
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="flex items-center gap-2">
                  <Zap size={16} className="text-accent-600" />
                  <span className="text-xs sm:text-sm font-semibold text-neutral-800">המטרות של היום</span>
                </div>
                <ChevronLeft size={14} className="text-neutral-400" />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                {[
                  { text: 'לסיים את הסרטון לאינסטגרם', done: true },
                  { text: 'לענות ל-5 הודעות מלקוחות', done: true },
                  { text: 'לתכנן את התוכן לשבוע הבא', done: false },
                ].map((goal, i) => (
                  <div key={i} className="flex items-center gap-2 sm:gap-3">
                    <div
                      className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        goal.done
                          ? 'bg-accent-600 border-accent-600'
                          : 'border-neutral-300 bg-white'
                      }`}
                    >
                      {goal.done && (
                        <motion.svg
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 1.3 + i * 0.1 }}
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </motion.svg>
                      )}
                    </div>
                    <span
                      className={`text-xs sm:text-sm ${
                        goal.done ? 'text-neutral-500 line-through' : 'text-neutral-700'
                      }`}
                    >
                      {goal.text}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Mini Calendar Preview */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 }}
              className="flex items-center gap-2 sm:gap-3 bg-neutral-50 rounded-xl p-2.5 sm:p-3"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-lg sm:rounded-xl flex flex-col items-center justify-center border border-neutral-100">
                <span className="text-[10px] text-neutral-400">ינו</span>
                <span className="text-sm sm:text-base font-bold text-neutral-800">15</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-500" />
                  <span className="text-xs sm:text-sm font-medium text-neutral-700">פגישה עם לקוח</span>
                  <span className="text-[10px] sm:text-xs text-neutral-400 mr-auto">14:00</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span className="text-xs sm:text-sm font-medium text-neutral-700">צילומים לקמפיין</span>
                  <span className="text-[10px] sm:text-xs text-neutral-400 mr-auto">16:30</span>
                </div>
              </div>
            </motion.div>

            {/* AI Suggestion */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
              className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl border border-violet-100"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
                <MessageSquare size={14} className="text-violet-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-neutral-700">הצעה מ-AI</p>
                <p className="text-[10px] sm:text-xs text-neutral-500 mt-0.5">
                  "השעות הכי טובות שלך לעבודה יצירתית הן 10:00-13:00"
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Floating elements */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.6 }}
          className="absolute -left-4 sm:-left-8 top-1/4 bg-white rounded-xl shadow-lg border border-neutral-100 p-2.5 sm:p-3 hidden sm:block"
        >
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-accent-600" />
            <span className="text-xs font-medium text-neutral-600">3 אירועים היום</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.7 }}
          className="absolute -right-4 sm:-right-6 bottom-1/4 bg-white rounded-xl shadow-lg border border-neutral-100 p-2.5 sm:p-3 hidden sm:block"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium text-neutral-600">נשלחה תזכורת</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
