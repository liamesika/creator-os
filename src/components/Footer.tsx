'use client'

import { motion } from 'framer-motion'
import Logo from './Logo'
import { Instagram, Twitter, Linkedin, Mail } from 'lucide-react'

const footerLinks = {
  product: [
    { label: 'תכונות', href: '#features' },
    { label: 'יומן חכם', href: '#calendar' },
    { label: 'מטרות יומיות', href: '#goals' },
    { label: 'AI', href: '#ai' },
  ],
  company: [
    { label: 'אודות', href: '#' },
    { label: 'בלוג', href: '#' },
    { label: 'קריירה', href: '#' },
  ],
  legal: [
    { label: 'תנאי שימוש', href: '#' },
    { label: 'פרטיות', href: '#' },
  ],
}

const socialLinks = [
  { icon: Instagram, href: 'https://www.instagram.com/creators_osai', label: 'Instagram', external: true },
  { icon: Twitter, href: '#', label: 'Twitter', external: false },
  { icon: Linkedin, href: '#', label: 'LinkedIn', external: false },
  { icon: Mail, href: 'mailto:creators.os.ai@gmail.com', label: 'Email', external: false },
]

export default function Footer() {
  return (
    <footer className="bg-neutral-50 border-t border-neutral-100">
      <div className="container-custom py-12 sm:py-16">
        {/* Main footer content */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Logo size="md" />
            <p className="mt-4 text-sm text-neutral-500 max-w-xs">
              מערכת ניהול חכמה ליוצרי תוכן. שליטה מלאה בזמן, בתוכן ובשגרה שלך.
            </p>
            {/* Contact Info */}
            <div className="mt-4 space-y-2">
              <a
                href="mailto:creators.os.ai@gmail.com"
                className="flex items-center gap-2 text-sm text-neutral-500 hover:text-accent-600 transition-colors"
              >
                <Mail size={14} />
                <span dir="ltr">creators.os.ai@gmail.com</span>
              </a>
              <a
                href="https://www.instagram.com/creators_osai"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-neutral-500 hover:text-accent-600 transition-colors"
              >
                <Instagram size={14} />
                <span dir="ltr">@creators_osai</span>
              </a>
            </div>

            {/* Social links */}
            <div className="flex gap-3 mt-6">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target={social.external ? '_blank' : undefined}
                  rel={social.external ? 'noopener noreferrer' : undefined}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-500 hover:text-accent-600 hover:border-accent-200 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon size={18} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Product links */}
          <div>
            <h4 className="font-semibold text-neutral-900 mb-4">מוצר</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-neutral-500 hover:text-accent-600 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h4 className="font-semibold text-neutral-900 mb-4">חברה</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-neutral-500 hover:text-accent-600 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal links */}
          <div>
            <h4 className="font-semibold text-neutral-900 mb-4">משפטי</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-neutral-500 hover:text-accent-600 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-neutral-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-neutral-500">
              © {new Date().getFullYear()} Creators OS. כל הזכויות שמורות.
            </p>
            <p className="text-sm text-neutral-400">
              נבנה עם ❤️ עבור יוצרי תוכן
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
