'use client'

import { motion } from 'framer-motion'
import { Shield } from 'lucide-react'

export default function PrivacyPage() {
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
            <Shield size={24} className="text-purple-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: 'linear-gradient(135deg, rgb(15,128,226) 0%, rgb(113,48,234) 100%)',
              }}
            >
              מדיניות פרטיות
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
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. מבוא</h2>
              <p className="text-gray-600 leading-relaxed">
                Creators OS ("אנחנו", "שלנו") מחויבת להגן על פרטיותכם. מדיניות פרטיות זו מסבירה כיצד אנו אוספים, משתמשים ומגנים על המידע האישי שלכם כאשר אתם משתמשים בפלטפורמה שלנו.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. איסוף מידע</h2>
              <p className="text-gray-600 leading-relaxed mb-3">
                אנו אוספים מספר סוגים של מידע:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>מידע אישי שאתם מספקים בעת ההרשמה (שם, אימייל, מספר טלפון)</li>
                <li>מידע שנוצר במהלך השימוש בשירות (לקוחות, פרויקטים, אירועים)</li>
                <li>מידע טכני (כתובת IP, סוג דפדפן, מערכת הפעלה)</li>
                <li>עוגיות ונתוני שימוש לשיפור החוויה</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. שימוש במידע</h2>
              <p className="text-gray-600 leading-relaxed mb-3">
                אנו משתמשים במידע שלכם עבור:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>אספקת ותחזוקה של השירות</li>
                <li>שיפור וייעול הפלטפורמה</li>
                <li>תמיכה טכנית ושירות לקוחות</li>
                <li>שליחת עדכונים ותקשורת שיווקית (בהסכמתכם)</li>
                <li>זיהוי ומניעת שימוש לא מורשה</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. שיתוף מידע</h2>
              <p className="text-gray-600 leading-relaxed">
                אנו לא מוכרים או משכירים את המידע האישי שלכם לצדדים שלישיים. אנו עשויים לשתף מידע רק במקרים הבאים:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 mt-3">
                <li>עם ספקי שירות שעוזרים לנו להפעיל את הפלטפורמה (Supabase, Vercel)</li>
                <li>כאשר נדרש על פי חוק או בתגובה לבקשה משפטית תקפה</li>
                <li>להגנה על הזכויות והבטיחות שלנו ושל המשתמשים</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. אבטחת מידע</h2>
              <p className="text-gray-600 leading-relaxed">
                אנו משתמשים באמצעי אבטחה טכניים וארגוניים להגנה על המידע שלכם, כולל הצפנה, אימות מאובטח, וגישה מוגבלת למערכות. עם זאת, אף שיטת העברה או אחסון אינה מאובטחת ב-100%.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. הזכויות שלכם</h2>
              <p className="text-gray-600 leading-relaxed mb-3">
                יש לכם זכות:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>לגשת למידע האישי שלכם</li>
                <li>לתקן או לעדכן מידע לא מדויק</li>
                <li>למחוק את החשבון והמידע שלכם</li>
                <li>להתנגד לעיבוד מידע מסוים</li>
                <li>לייצא את הנתונים שלכם</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. עוגיות</h2>
              <p className="text-gray-600 leading-relaxed">
                אנו משתמשים בעוגיות כדי לשפר את חווית השימוש, לזכור את ההעדפות שלכם, ולנתח את השימוש בשירות. אתם יכולים לשלוט בעוגיות דרך הגדרות הדפדפן שלכם.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. שינויים במדיניות</h2>
              <p className="text-gray-600 leading-relaxed">
                אנו עשויים לעדכן מדיניות פרטיות זו מעת לעת. נודיע לכם על שינויים משמעותיים באמצעות אימייל או הודעה בפלטפורמה.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. צור קשר</h2>
              <p className="text-gray-600 leading-relaxed">
                לשאלות או בקשות בנוגע למדיניות פרטיות זו, אנא פנו אלינו:
              </p>
              <p className="text-gray-700 font-medium mt-3" dir="ltr">
                Email: creators.os.ai@gmail.com
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
