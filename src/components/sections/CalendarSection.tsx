'use client'

import { motion } from 'framer-motion'
import {
  Camera,
  MessageCircle,
  Video,
  FileText,
  Megaphone,
  Users,
  Clock,
  Bell,
  ChevronLeft,
} from 'lucide-react'

const eventCategories = [
  { icon: Camera, label: 'צילומים', color: 'bg-pink-500', lightColor: 'bg-pink-100' },
  { icon: Video, label: 'עריכת וידאו', color: 'bg-red-500', lightColor: 'bg-red-100' },
  { icon: FileText, label: 'כתיבת תוכן', color: 'bg-blue-500', lightColor: 'bg-blue-100' },
  { icon: Megaphone, label: 'פרסום', color: 'bg-orange-500', lightColor: 'bg-orange-100' },
  { icon: Users, label: 'פגישות', color: 'bg-green-500', lightColor: 'bg-green-100' },
  { icon: MessageCircle, label: 'תקשורת', color: 'bg-purple-500', lightColor: 'bg-purple-100' },
]

const calendarEvents = [
  { time: '09:00', title: 'צילומים לקמפיין', category: 'צילומים', color: 'border-r-pink-500', duration: '2 שעות' },
  { time: '11:30', title: 'עריכת סרטון יוטיוב', category: 'עריכת וידאו', color: 'border-r-red-500', duration: '3 שעות' },
  { time: '15:00', title: 'פגישת זום עם לקוח', category: 'פגישות', color: 'border-r-green-500', duration: '1 שעה' },
  { time: '17:00', title: 'כתיבת פוסט לאינסטגרם', category: 'כתיבת תוכן', color: 'border-r-blue-500', duration: '45 דק׳' },
]

export default function CalendarSection() {
  return (
    <section id="calendar" className="section-padding relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-white" />

      <div className="container-custom relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="order-2 lg:order-1"
          >
            <span className="inline-block text-sm font-semibold text-accent-600 mb-3">
              יומן חכם
            </span>
            <h2 className="heading-lg text-neutral-900 mb-5">
              יומן שמבין{' '}
              <span className="gradient-text">יוצרים</span>
            </h2>
            <p className="text-body mb-8">
              לא עוד אירועים כלליים — כל פעולה מקבלת הקשר, קטגוריה ייעודית,
              תזכורות חכמות ומשימות אוטומטיות.
            </p>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-2 mb-8">
              {eventCategories.map((cat, index) => (
                <motion.div
                  key={cat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white border border-neutral-200 rounded-full shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className={`w-5 h-5 rounded-full ${cat.color} flex items-center justify-center`}>
                    <cat.icon size={10} className="text-white" />
                  </div>
                  <span className="text-sm text-neutral-700">{cat.label}</span>
                </motion.div>
              ))}
            </div>

            {/* Feature highlights */}
            <div className="space-y-4">
              {[
                { icon: Clock, text: 'תזמון אוטומטי לפי סוג המשימה' },
                { icon: Bell, text: 'תזכורות חכמות שמתחשבות בהקשר' },
                { icon: ChevronLeft, text: 'משימות מתעדכנות אוטומטית מאירועים' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-accent-50 flex items-center justify-center">
                    <item.icon size={16} className="text-accent-600" />
                  </div>
                  <span className="text-neutral-700">{item.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Calendar Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="order-1 lg:order-2"
          >
            <div className="relative">
              {/* Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent-200/30 to-primary-200/30 blur-3xl" />

              {/* Calendar Card */}
              <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden">
                {/* Header */}
                <div className="px-5 sm:px-6 py-4 bg-neutral-50 border-b border-neutral-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-neutral-800">ינואר 2024</h3>
                      <p className="text-sm text-neutral-500">יום שלישי, 15</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-neutral-200 rounded-lg transition-colors">
                        <ChevronLeft size={18} className="text-neutral-600 rotate-180" />
                      </button>
                      <button className="p-2 hover:bg-neutral-200 rounded-lg transition-colors">
                        <ChevronLeft size={18} className="text-neutral-600" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Events List */}
                <div className="p-4 sm:p-5 space-y-3">
                  {calendarEvents.map((event, index) => (
                    <motion.div
                      key={event.time}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4 + index * 0.1, duration: 0.3 }}
                      whileHover={{ x: -4 }}
                      className={`bg-neutral-50 rounded-xl p-3 sm:p-4 border-r-4 ${event.color} cursor-pointer hover:bg-neutral-100 transition-colors`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-neutral-800 text-sm sm:text-base">
                            {event.title}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-neutral-500">{event.time}</span>
                            <span className="text-xs text-neutral-400">•</span>
                            <span className="text-xs text-neutral-500">{event.duration}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-medium text-neutral-500 bg-white px-2 py-1 rounded-lg border border-neutral-100">
                          {event.category}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Footer - Add Event */}
                <div className="px-4 sm:px-5 pb-4 sm:pb-5">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 bg-accent-50 text-accent-600 rounded-xl font-medium text-sm hover:bg-accent-100 transition-colors"
                  >
                    + הוספת אירוע חדש
                  </motion.button>
                </div>
              </div>

              {/* Floating notification */}
              <motion.div
                initial={{ opacity: 0, y: 20, x: -20 }}
                whileInView={{ opacity: 1, y: 0, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8, duration: 0.4 }}
                className="absolute -bottom-4 -right-4 sm:-right-8 bg-white rounded-xl shadow-lg border border-neutral-100 p-3 max-w-[200px]"
              >
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Bell size={12} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-neutral-700">תזכורת עבורך</p>
                    <p className="text-[10px] text-neutral-500 mt-0.5">פגישת זום בעוד 30 דקות</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
