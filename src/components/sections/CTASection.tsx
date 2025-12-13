'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Check, Loader2, Sparkles } from 'lucide-react'

export default function CTASection() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setStatus('loading')

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setStatus('success')
    setEmail('')
  }

  return (
    <section id="join" className="section-padding relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900" />

      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.15 }}
          viewport={{ once: true }}
          className="absolute -top-40 -right-40 w-96 h-96 bg-accent-500 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-500 rounded-full blur-3xl"
        />
      </div>

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full mb-8"
          >
            <Sparkles size={16} className="text-accent-400" />
            <span className="text-sm font-medium text-white/90">גישה מוקדמת זמינה עכשיו</span>
          </motion.div>

          {/* Headline */}
          <h2 className="heading-lg text-white mb-5">
            זה לא עוד כלי —{' '}
            <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-accent-400 to-primary-400 bg-clip-text text-transparent">
              זו שיטת עבודה
            </span>
          </h2>

          <p className="text-lg text-neutral-300 mb-10 max-w-xl mx-auto">
            הצטרפו לרשימת ההמתנה וקבלו גישה מוקדמת חינמית למערכת
          </p>

          {/* Email Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            onSubmit={handleSubmit}
            className="max-w-md mx-auto"
          >
            {status === 'success' ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-center gap-3 py-4 px-6 bg-green-500/20 border border-green-500/30 rounded-2xl text-green-400"
              >
                <Check size={20} />
                <span className="font-medium">נרשמת בהצלחה! נעדכן אותך בקרוב</span>
              </motion.div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="האימייל שלך"
                    className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 outline-none focus:border-accent-400 transition-colors text-right"
                    required
                    disabled={status === 'loading'}
                  />
                </div>
                <motion.button
                  type="submit"
                  disabled={status === 'loading'}
                  whileHover={{ scale: status === 'loading' ? 1 : 1.02 }}
                  whileTap={{ scale: status === 'loading' ? 1 : 0.98 }}
                  className="px-8 py-4 bg-gradient-to-r from-accent-500 to-accent-600 text-white font-medium rounded-xl shadow-lg shadow-accent-500/25 hover:shadow-xl hover:shadow-accent-500/30 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {status === 'loading' ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <>
                      הצטרפות מוקדמת
                      <ArrowLeft size={18} />
                    </>
                  )}
                </motion.button>
              </div>
            )}
          </motion.form>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-neutral-400"
          >
            <div className="flex items-center gap-2">
              <Check size={16} className="text-green-400" />
              <span>ללא כרטיס אשראי</span>
            </div>
            <div className="flex items-center gap-2">
              <Check size={16} className="text-green-400" />
              <span>גישה מוקדמת חינמית</span>
            </div>
            <div className="flex items-center gap-2">
              <Check size={16} className="text-green-400" />
              <span>ללא ספאם</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
