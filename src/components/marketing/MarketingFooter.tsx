'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, Sparkles, ArrowLeft } from 'lucide-react'
import Logo from '@/components/Logo'

export default function MarketingFooter() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    מוצר: [
      { label: 'תמחור', href: '/pricing' },
      { label: 'תמחור לסוכנויות', href: '/pricing/agencies' },
      { label: 'בלוג', href: '/blog' },
    ],
    חברה: [
      { label: 'אודות', href: '/about' },
      { label: 'קריירה', href: '/careers' },
      { label: 'צור קשר', href: '/contact' },
    ],
    משפטי: [
      { label: 'מדיניות פרטיות', href: '/privacy' },
      { label: 'תנאי שימוש', href: '/terms' },
    ],
  }

  return (
    <footer className="relative bg-gradient-to-b from-gray-50 to-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 sm:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
            {/* Brand Column */}
            <div className="lg:col-span-5">
              <Link href="/" className="inline-block mb-4">
                <Logo size="md" />
              </Link>
              <p className="text-base text-gray-600 leading-relaxed mb-6 max-w-md">
                מערכת ניהול מושלמת ליוצרי תוכן ומנהלי קהילה.
                <br />
                <span className="font-semibold text-gray-700">כל מה שצריך, במקום אחד.</span>
              </p>

              {/* Newsletter */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-5 border border-purple-100">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={16} className="text-purple-600" />
                  <h3 className="font-bold text-gray-900 text-sm">הישארו מעודכנים</h3>
                </div>
                <p className="text-xs text-gray-600 mb-3">
                  קבלו טיפים, עדכונים ותכונות חדשות ישירות למייל
                </p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="המייל שלכם"
                    className="flex-1 px-3 py-2 rounded-xl border border-purple-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all text-xs"
                    dir="ltr"
                  />
                  <button className="px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center gap-1 text-xs">
                    <span>הרשמה</span>
                    <ArrowLeft size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Links Columns */}
            <div className="lg:col-span-7">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 lg:gap-8">
                {Object.entries(footerLinks).map(([category, links]) => (
                  <div key={category}>
                    <h3 className="text-sm font-bold text-gray-900 mb-3">{category}</h3>
                    <ul className="space-y-2">
                      {links.map((link) => (
                        <li key={link.href}>
                          <Link
                            href={link.href}
                            className="text-sm text-gray-600 hover:text-purple-600 transition-colors inline-block"
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              © {currentYear} Creators OS. כל הזכויות שמורות.
            </p>

            <div className="flex items-center gap-6">
              <Link
                href="mailto:liamesika2121@gmail.com"
                className="group flex items-center gap-2 text-sm text-gray-600 hover:text-purple-600 transition-colors"
              >
                <Mail size={16} className="group-hover:scale-110 transition-transform" />
                <span dir="ltr">liamesika2121@gmail.com</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Gradient Accent */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-50" />
    </footer>
  )
}
