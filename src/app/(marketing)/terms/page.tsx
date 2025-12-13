'use client'

import { motion } from 'framer-motion'
import { FileText } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="py-12 sm:py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 border border-purple-200 mb-4">
            <FileText size={24} className="text-purple-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: 'linear-gradient(135deg, rgb(15,128,226) 0%, rgb(113,48,234) 100%)',
              }}
            >
              תנאי שימוש
            </span>
          </h1>
          <p className="text-lg text-gray-600">
            עדכון אחרון: דצמבר 2024
          </p>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="prose prose-gray max-w-none"
        >
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. קבלת התנאים</h2>
              <p className="text-gray-600 leading-relaxed">
                ברוכים הבאים ל-Creators OS. על ידי גישה לשירות או שימוש בו, אתם מסכימים לתנאים אלה. אם אינכם מסכימים לתנאים, אנא הימנעו משימוש בשירות.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. שימוש בשירות</h2>
              <p className="text-gray-600 leading-relaxed mb-3">
                אתם מתחייבים:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>לספק מידע מדויק ועדכני בעת ההרשמה</li>
                <li>לשמור על סודיות פרטי החשבון שלכם</li>
                <li>להשתמש בשירות בהתאם לחוק ולתנאים אלה</li>
                <li>לא להעביר או למכור את החשבון שלכם לצד שלישי</li>
                <li>לא להשתמש בשירות למטרות בלתי חוקיות או זדוניות</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. רישיונות ותכנים</h2>
              <p className="text-gray-600 leading-relaxed mb-3">
                <strong>התוכן שלכם:</strong> אתם שומרים על כל הזכויות לתוכן שאתם יוצרים ומעלים לשירות. אתם מעניקים לנו רישיון מוגבל לאחסן ולעבד את התוכן שלכם לצורך אספקת השירות.
              </p>
              <p className="text-gray-600 leading-relaxed">
                <strong>השירות שלנו:</strong> כל התוכן, העיצוב, והפונקציונליות של Creators OS הם רכושנו ומוגנים בזכויות יוצרים וסימני מסחר.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. תשלומים ומנויים</h2>
              <p className="text-gray-600 leading-relaxed mb-3">
                <strong>תמחור:</strong> אנו מציעים תוכניות חינמיות ובתשלום. מחירים עשויים להשתנות בהתראה מראש.
              </p>
              <p className="text-gray-600 leading-relaxed mb-3">
                <strong>חיובים:</strong> חיובים עבור תוכניות בתשלום מתבצעים באופן חודשי או שנתי, בהתאם לבחירתכם.
              </p>
              <p className="text-gray-600 leading-relaxed">
                <strong>ביטולים והחזרים:</strong> תוכלו לבטל את המנוי בכל עת. החזרים ניתנים בהתאם למדיניות ההחזרים שלנו.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. מגבלות שימוש</h2>
              <p className="text-gray-600 leading-relaxed mb-3">
                אסור לבצע פעולות הבאות:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>ניסיון לפרוץ, לפגוע או להפריע לתפעול השירות</li>
                <li>שימוש אוטומטי בשירות (בוטים, סקריפטים) ללא אישור</li>
                <li>העתקה או שכפול של חלקים מהשירות</li>
                <li>העלאת תוכן פוגעני, מטעה או בלתי חוקי</li>
                <li>איסוף מידע על משתמשים אחרים ללא הסכמתם</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. הגבלת אחריות</h2>
              <p className="text-gray-600 leading-relaxed">
                השירות מסופק "כפי שהוא" ו"כפי שזמין". אנו לא מתחייבים שהשירות יהיה ללא הפרעות או שגיאות. באף מקרה לא נהיה אחראים לנזקים עקיפים, מקריים או תוצאתיים הנובעים משימוש בשירות.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. סיום חשבון</h2>
              <p className="text-gray-600 leading-relaxed">
                אנו שומרים לעצמנו את הזכות להשעות או לסיים את החשבון שלכם במקרה של הפרת תנאים אלה, שימוש בלתי הולם, או פעילות בלתי חוקית.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. שינויים בתנאים</h2>
              <p className="text-gray-600 leading-relaxed">
                אנו עשויים לעדכן תנאים אלה מעת לעת. נודיע לכם על שינויים משמעותיים באמצעות אימייל או הודעה בפלטפורמה. המשך שימוש בשירות לאחר השינויים מהווה הסכמה לתנאים החדשים.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. דין וסמכות שיפוט</h2>
              <p className="text-gray-600 leading-relaxed">
                תנאים אלה כפופים לדיני מדינת ישראל. כל סכסוך יידון בבתי המשפט המוסמכים בישראל.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. צור קשר</h2>
              <p className="text-gray-600 leading-relaxed">
                לשאלות או בקשות בנוגע לתנאי שימוש אלה, אנא פנו אלינו:
              </p>
              <p className="text-gray-700 font-medium mt-3" dir="ltr">
                Email: liamesika2121@gmail.com
                <br />
                Phone: +972 58-787-8676
              </p>
            </section>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-12 p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 text-center"
        >
          <h3 className="text-xl font-bold mb-3 text-gray-900">יש לכם שאלות?</h3>
          <p className="text-gray-600 mb-5">
            אנחנו כאן כדי לעזור ולענות על כל שאלה
          </p>
          <a
            href="/contact"
            className="inline-block px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold transition-all shadow-md hover:shadow-lg"
          >
            צרו קשר
          </a>
        </motion.div>
      </div>
    </div>
  )
}
