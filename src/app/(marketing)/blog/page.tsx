'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Calendar, ArrowLeft } from 'lucide-react'

export default function BlogPage() {
  // Placeholder blog posts
  const posts = [
    {
      id: '1',
      title: '5 טיפים לניהול לקוחות יעיל כיוצר תוכן',
      excerpt: 'כיצד לנהל מספר לקוחות במקביל מבלי להשתגע - המדריך המלא ליוצרי תוכן',
      date: '2024-12-10',
      category: 'ניהול',
      slug: '5-tips-client-management',
    },
    {
      id: '2',
      title: 'איך לתכנן שבוע תוכן מושלם',
      excerpt: 'המתודולוגיה שתעזור לכם לתכנן, לייצר ולפרסם תוכן בצורה עקבית',
      date: '2024-12-05',
      category: 'תכנון',
      slug: 'perfect-content-week',
    },
    {
      id: '3',
      title: 'למה AI לא יחליף אתכם (ואיך להשתמש בו נכון)',
      excerpt: 'המדריך המעשי לשימוש בבינה מלאכותית ביצירת תוכן מבלי לאבד את הקול האותנטי שלכם',
      date: '2024-11-28',
      category: 'טכנולוגיה',
      slug: 'ai-content-creation',
    },
  ]

  return (
    <>
      {/* Hero */}
      <section className="py-20 sm:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              הבלוג של Creators OS
            </h1>
            <p className="text-lg sm:text-xl text-neutral-300 max-w-2xl mx-auto">
              טיפים, אסטרטגיות ותובנות ליוצרי תוכן ומנהלי קהילה
            </p>
          </motion.div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {posts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link
                  href={`/blog/${post.slug}`}
                  className="block p-6 sm:p-8 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-purple-500/50 transition-all group"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      {post.category}
                    </span>
                    <div className="flex items-center gap-2 text-sm text-neutral-500">
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
                  <h2 className="text-2xl font-bold mb-3 group-hover:text-purple-400 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-neutral-400 mb-4">{post.excerpt}</p>
                  <div className="flex items-center gap-2 text-purple-400 font-medium">
                    <span>קרא עוד</span>
                    <ArrowLeft size={16} />
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>

          {/* Empty State Message */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-12 text-center text-neutral-500"
          >
            <p>פוסטים נוספים בקרוב...</p>
          </motion.div>
        </div>
      </section>
    </>
  )
}
