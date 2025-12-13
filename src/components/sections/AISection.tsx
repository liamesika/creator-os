'use client'

import { motion } from 'framer-motion'
import { Sparkles, MessageSquare, Lightbulb, Type, Send } from 'lucide-react'

const aiExamples = [
  {
    type: 'story',
    label: 'טקסט לסטורי',
    prompt: 'כתוב טקסט קצר לסטורי על השקת מוצר חדש',
    response: '🚀 סוף סוף! אחרי חודשים של עבודה קשה, המוצר החדש שלנו יוצא לדרך. בסטורי הבא אספר לכם על הפיצ׳ר שאני הכי מתלהב ממנו...',
  },
  {
    type: 'idea',
    label: 'רעיון לצילום',
    prompt: 'תן לי רעיון יצירתי לצילום מוצר אופנה',
    response: '📸 צילום בתנועה עם בד זורם - השתמשי במאוורר עדין כדי ליצור תנועה קלילה בבד הבגד, תאורה רכה מהצד עם צל דרמטי',
  },
  {
    type: 'cta',
    label: 'CTA אפקטיבי',
    prompt: 'כתוב CTA לפוסט על סדנה חדשה',
    response: '✨ המקומות מוגבלים ל-20 משתתפים בלבד. לחצו על הלינק בביו להרשמה - נשארו רק 6 מקומות אחרונים!',
  },
]

export default function AISection() {
  return (
    <section id="ai" className="section-padding relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white to-violet-50/30" />

      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.3 }}
          viewport={{ once: true }}
          className="absolute top-20 right-10 w-64 h-64 bg-violet-200 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.2 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="absolute bottom-20 left-10 w-48 h-48 bg-purple-200 rounded-full blur-3xl"
        />
      </div>

      <div className="container-custom relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="order-2 lg:order-2"
          >
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-violet-600 mb-3">
              <Sparkles size={14} />
              עזרה חכמה
            </span>
            <h2 className="heading-lg text-neutral-900 mb-5">
              רעיונות וטקסטים —{' '}
              <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                בדיוק כשצריך
              </span>
            </h2>
            <p className="text-body mb-8">
              ה-AI של Creators OS לא מחליף אותך — הוא עוזר לך. קבל רעיונות, טקסטים
              והצעות שמותאמים בדיוק לסגנון שלך ולקהל שלך.
            </p>

            {/* Feature bullets */}
            <div className="space-y-4">
              {[
                { icon: Type, text: 'טקסטים לסטוריז ופוסטים' },
                { icon: Lightbulb, text: 'רעיונות לצילום ותוכן' },
                { icon: MessageSquare, text: 'פתיחים וקריאות לפעולה' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
                    <item.icon size={18} className="text-violet-600" />
                  </div>
                  <span className="text-neutral-700 font-medium">{item.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Chat UI Mockup */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="order-1 lg:order-1"
          >
            <div className="relative">
              {/* Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-violet-300/30 to-purple-300/30 blur-3xl" />

              {/* Chat Container */}
              <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden">
                {/* Header */}
                <div className="px-5 sm:px-6 py-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                      <Sparkles size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">AI Assistant</h3>
                      <p className="text-sm text-white/80">מוכן לעזור</p>
                    </div>
                    <div className="mr-auto flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-xs text-white/80">פעיל</span>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="p-4 sm:p-5 space-y-4 bg-neutral-50/50 min-h-[300px]">
                  {aiExamples.map((example, index) => (
                    <motion.div
                      key={example.type}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4 + index * 0.15 }}
                      className="space-y-3"
                    >
                      {/* User message */}
                      <div className="flex justify-start">
                        <div className="max-w-[85%] bg-white rounded-2xl rounded-br-md px-4 py-3 shadow-sm border border-neutral-100">
                          <p className="text-sm text-neutral-700">{example.prompt}</p>
                        </div>
                      </div>

                      {/* AI response */}
                      <div className="flex justify-end">
                        <div className="max-w-[85%] bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl rounded-bl-md px-4 py-3 shadow-lg">
                          <p className="text-sm text-white leading-relaxed">{example.response}</p>
                          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/20">
                            <span className="text-[10px] text-white/70 bg-white/10 px-2 py-0.5 rounded-full">
                              {example.label}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Input */}
                <div className="px-4 sm:px-5 py-4 bg-white border-t border-neutral-100">
                  <div className="flex items-center gap-3 bg-neutral-100 rounded-xl px-4 py-3">
                    <input
                      type="text"
                      placeholder="שאל אותי משהו..."
                      className="flex-1 bg-transparent text-sm text-neutral-700 placeholder-neutral-400 outline-none"
                      disabled
                    />
                    <button className="w-8 h-8 rounded-lg bg-violet-500 flex items-center justify-center hover:bg-violet-600 transition-colors">
                      <Send size={14} className="text-white" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 1 }}
                className="absolute -bottom-3 -left-3 bg-white rounded-xl shadow-lg border border-neutral-100 px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-violet-500" />
                  <span className="text-xs font-medium text-neutral-600">GPT-4 מובנה</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
