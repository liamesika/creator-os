'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Calendar } from 'lucide-react'
import DemoButton from '@/components/marketing/DemoButton'

export default function BlogPostPage() {
  // This would normally come from a CMS or database
  const post = {
    title: '5 טיפים לניהול לקוחות יעיל כיוצר תוכן',
    date: '2024-12-10',
    category: 'ניהול',
    content: `
      <p>ניהול לקוחות הוא אחד האתגרים הגדולים ביותר של יוצרי תוכן. בין תיאום, תקשורת, ועמידה בלוחות זמנים - קל מאוד לאבד את השליטה.</p>

      <h2>1. שמרו על תיעוד מסודר</h2>
      <p>כל פגישה, כל החלטה, כל שינוי - תעדו הכל במקום אחד. זה יחסוך לכם המון בעיות בעתיד.</p>

      <h2>2. הגדירו גבולות ברורים</h2>
      <p>זמני תגובה, היקף עבודה, שעות עבודה - הכל צריך להיות ברור מראש. לקוחות מעריכים בהירות.</p>

      <h2>3. השתמשו בתבניות</h2>
      <p>תבניות לאימיילים, חוזים, הצעות מחיר - כל מה שחוזר על עצמו צריך להפוך לתבנית.</p>

      <h2>4. תקשרו באופן יזום</h2>
      <p>אל תחכו שהלקוח ישאל. עדכנו אותו לפני שהוא צריך לשאול. זה בונה אמון.</p>

      <h2>5. השתמשו בכלי ניהול מתאים</h2>
      <p>אקסל זה לא מספיק. אתם צריכים מערכת שבנויה במיוחד בשביל יוצרי תוכן - עם לקוחות, לוח שנה, משימות ויצירת תוכן במקום אחד.</p>
    `,
  }

  return (
    <>
      <article className="py-12 sm:py-14 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors mb-6"
          >
            <ArrowRight size={16} />
            <span>חזרה לבלוג</span>
          </Link>

          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex items-center gap-4 mb-4">
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                {post.category}
              </span>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar size={14} />
                <time dateTime={post.date}>
                  {new Date(post.date).toLocaleDateString('he-IL', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
              {post.title}
            </h1>
          </motion.header>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="prose prose-invert prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-10 p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 text-center shadow-lg"
          >
            <h3 className="text-xl font-bold mb-3 text-gray-900">
              רוצים לנהל את הלקוחות שלכם בצורה מקצועית?
            </h3>
            <p className="text-gray-600 mb-5">
              נסו את Creators OS - המערכת שבנויה במיוחד בשביל יוצרי תוכן
            </p>
            <DemoButton size="lg" />
          </motion.div>
        </div>
      </article>

      <style jsx global>{`
        .prose h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-top: 2rem;
          margin-bottom: 0.75rem;
          color: #111827;
        }
        .prose p {
          margin-bottom: 1.25rem;
          color: #4b5563;
          line-height: 1.75;
        }
      `}</style>
    </>
  )
}
