'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Mail, Send, CheckCircle, Phone, MessageCircle, Instagram } from 'lucide-react'
import DemoButton from '@/components/marketing/DemoButton'
import { trackEvent } from '@/lib/analytics'

const CONTACT_EMAIL = 'creators.os.ai@gmail.com'
const INSTAGRAM_URL = 'https://www.instagram.com/creators_osai'

export default function ContactPage() {
  const formRef = useRef<HTMLFormElement>(null)
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Submit form via FormSubmit
      const formData = new FormData(formRef.current!)

      await fetch(`https://formsubmit.co/ajax/${CONTACT_EMAIL}`, {
        method: 'POST',
        body: formData,
      })

      trackEvent('contact_submitted')
      setSubmitted(true)
    } catch (error) {
      console.error('Error submitting form:', error)
      // Still show success since FormSubmit may have received it
      setSubmitted(true)
    } finally {
      setIsSubmitting(false)
    }

    // Reset form after 5 seconds
    setTimeout(() => {
      if (formRef.current) formRef.current.reset()
      setSubmitted(false)
    }, 5000)
  }

  const handleWhatsApp = () => {
    const message = encodeURIComponent('שלום! אני מעוניין/ת לשמוע עוד על Creators OS')
    window.open(`https://wa.me/972587878676?text=${message}`, '_blank')
  }

  return (
    <>
      {/* Hero */}
      <section className="relative py-12 sm:py-16 bg-gradient-to-b from-[#F2F4FC] to-white overflow-hidden">
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
            {/* Icon Badge */}
            <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 border border-purple-200 mb-4">
              <Mail size={24} className="text-purple-600" />
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: 'linear-gradient(135deg, rgb(15,128,226) 0%, rgb(113,48,234) 100%)',
                }}
              >
                בואו נדבר
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              יש לכם שאלה? רוצים לשתף פעולה?
              <br />
              נשמח לשמוע מכם בכל דרך שנוחה לכם
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Methods + Form */}
      <section className="py-12 sm:py-14 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {/* Email Card */}
            <motion.a
              href={`mailto:${CONTACT_EMAIL}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="group relative bg-white rounded-2xl border border-gray-200 p-6 hover:border-purple-300 hover:shadow-xl transition-all duration-300"
            >
              <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Mail size={24} className="text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">אימייל</h3>
              <p className="text-sm text-gray-600 mb-2">שלחו לנו הודעה</p>
              <p className="text-sm text-purple-600 font-medium" dir="ltr">
                {CONTACT_EMAIL}
              </p>
            </motion.a>

            {/* Instagram Card */}
            <motion.a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="group relative bg-white rounded-2xl border border-gray-200 p-6 hover:border-pink-300 hover:shadow-xl transition-all duration-300"
            >
              <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Instagram size={24} className="text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Instagram</h3>
              <p className="text-sm text-gray-600 mb-2">עקבו אחרינו</p>
              <p className="text-sm text-pink-600 font-medium" dir="ltr">
                @creators_osai
              </p>
            </motion.a>

            {/* Phone Card */}
            <motion.a
              href="tel:+972587878676"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="group relative bg-white rounded-2xl border border-gray-200 p-6 hover:border-purple-300 hover:shadow-xl transition-all duration-300"
            >
              <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Phone size={24} className="text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">טלפון</h3>
              <p className="text-sm text-gray-600 mb-2">התקשרו אלינו</p>
              <p className="text-sm text-purple-600 font-medium" dir="ltr">
                +972 58-787-8676
              </p>
            </motion.a>

            {/* WhatsApp Card */}
            <motion.button
              onClick={handleWhatsApp}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="group relative bg-white rounded-2xl border border-gray-200 p-6 hover:border-green-300 hover:shadow-xl transition-all duration-300 text-right"
            >
              <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <MessageCircle size={24} className="text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">WhatsApp</h3>
              <p className="text-sm text-gray-600 mb-2">שלחו הודעה מהירה</p>
              <p className="text-sm text-green-600 font-medium">פתחו שיחה</p>
            </motion.button>
          </div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl mx-auto"
          >
            {!submitted ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-lg">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    שלחו לנו הודעה
                  </h2>
                  <p className="text-gray-600">
                    מלאו את הפרטים ונחזור אליכם בהקדם
                  </p>
                </div>

                <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                  {/* FormSubmit configuration */}
                  <input type="hidden" name="_subject" value="פנייה חדשה מ-Creators OS" />
                  <input type="hidden" name="_template" value="table" />
                  <input type="hidden" name="_captcha" value="false" />

                  {/* Name */}
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      שם מלא *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-300 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all text-gray-900"
                      placeholder="הכניסו את שמכם"
                    />
                  </div>

                  {/* Email & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        אימייל *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        className="w-full px-4 py-3.5 rounded-xl border border-gray-300 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all text-gray-900"
                        placeholder="your@email.com"
                        dir="ltr"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        טלפון (אופציונלי)
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        className="w-full px-4 py-3.5 rounded-xl border border-gray-300 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all text-gray-900"
                        placeholder="050-1234567"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  {/* Company Type */}
                  <div>
                    <label
                      htmlFor="companyType"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      סוג פעילות *
                    </label>
                    <select
                      id="companyType"
                      name="companyType"
                      defaultValue="creator"
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-300 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all text-gray-900"
                    >
                      <option value="creator">יוצר תוכן בודד</option>
                      <option value="agency">סוכנות / צוות</option>
                      <option value="company">חברה / מותג</option>
                      <option value="other">אחר</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      הודעה *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={6}
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-300 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all resize-none text-gray-900"
                      placeholder="ספרו לנו במה אתם מעוניינים..."
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold text-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>שולח...</span>
                      </>
                    ) : (
                      <>
                        <Send size={20} />
                        <span>שליחת הודעה</span>
                      </>
                    )}
                  </button>

                  <p className="text-sm text-gray-500 text-center">
                    * שדות חובה
                  </p>
                </form>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200 p-8 text-center shadow-lg"
              >
                <div className="inline-flex p-3 rounded-full bg-green-100 mb-4">
                  <CheckCircle size={36} className="text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">תודה רבה!</h3>
                <p className="text-base text-gray-700 mb-6">
                  ההודעה נפתחה בתוכנת האימייל שלכם.
                  <br />
                  נחזור אליכם בהקדם האפשרי.
                </p>
                <DemoButton size="lg" />
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Demo CTA */}
      {!submitted && (
        <section className="py-12 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold mb-3">
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage: 'linear-gradient(135deg, rgb(15,128,226) 0%, rgb(113,48,234) 100%)',
                  }}
                >
                  מעדיפים לראות לבד?
                </span>
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                נסו את מצב ההדגמה וגלו את כל התכונות של Creators OS
              </p>
              <DemoButton size="lg" />
            </motion.div>
          </div>
        </section>
      )}
    </>
  )
}
