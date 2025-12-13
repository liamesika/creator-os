import type { Metadata } from 'next'
import { Inter, Heebo } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import { Toaster } from 'sonner'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const heebo = Heebo({
  subsets: ['hebrew', 'latin'],
  variable: '--font-heebo',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Creators OS | מערכת ניהול חכמה ליוצרי תוכן',
  description: 'שליטה מלאה בזמן, בתוכן ובשגרה שלך. Creators OS מרכזת את כל ניהול היום שלך במקום אחד — בלי עומס, בלי בלגן.',
  keywords: ['creators', 'content creators', 'productivity', 'task management', 'calendar', 'יוצרי תוכן'],
  authors: [{ name: 'Creators OS' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Creators OS',
  },
  openGraph: {
    title: 'Creators OS | מערכת ניהול חכמה ליוצרי תוכן',
    description: 'שליטה מלאה בזמן, בתוכן ובשגרה שלך',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="he" dir="rtl" className={`${inter.variable} ${heebo.variable}`}>
      <body className="font-hebrew">
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster position="top-center" richColors dir="rtl" />
      </body>
    </html>
  )
}
