/**
 * Email Templates
 * Beautiful, RTL-compatible email templates for CreatorsOS
 */

import type { DailyDigestContent, AgencyDigestContent, HealthStatus } from '@/types/premium'

// Motivational messages in Hebrew
const MOTIVATIONAL_MESSAGES = [
  'כל יום הוא הזדמנות חדשה ליצירה',
  'המיקוד שלך היום יביא הצלחה מחר',
  'אתה יותר מסוגל ממה שאתה חושב',
  'צעד אחד בכל פעם - וכך מגיעים רחוק',
  'היום הוא יום מושלם להתקדם',
  'האנרגיה שלך היא הכוח שלך',
  'כל משימה שהושלמה היא ניצחון',
  'תאמין בדרך - היא לוקחת אותך למקום הנכון',
  'הקסם קורה כשאתה מתחיל',
  'היום תעשה דברים נפלאים',
]

export function getRandomMotivation(): string {
  return MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)]
}

// Health status colors for email (inline CSS)
function getHealthStatusStyles(status: HealthStatus) {
  switch (status) {
    case 'calm':
      return { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0', label: 'רגוע' }
    case 'busy':
      return { bg: '#fffbeb', text: '#d97706', border: '#fde68a', label: 'עסוק' }
    case 'overloaded':
      return { bg: '#fef2f2', text: '#dc2626', border: '#fecaca', label: 'עמוס' }
  }
}

/**
 * Generate Daily Digest email HTML
 */
export function generateDailyDigestHTML(content: DailyDigestContent): string {
  const healthStyles = getHealthStatusStyles(content.healthStatus)
  const formattedDate = new Date(content.date).toLocaleDateString('he-IL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>הסיכום היומי שלך</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb; direction: rtl;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f9fafb;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 32px; border-radius: 16px 16px 0 0; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">בוקר טוב, ${content.userName}</h1>
              <p style="margin: 8px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">${formattedDate}</p>
            </td>
          </tr>

          <!-- Motivational message -->
          ${content.motivationalMessage ? `
          <tr>
            <td style="padding: 24px 32px 0 32px;">
              <div style="background-color: #fef3c7; border-radius: 12px; padding: 16px; text-align: center;">
                <span style="font-size: 20px;">✨</span>
                <p style="margin: 8px 0 0 0; color: #92400e; font-size: 16px; font-style: italic;">${content.motivationalMessage}</p>
              </div>
            </td>
          </tr>
          ` : ''}

          <!-- Health Score -->
          <tr>
            <td style="padding: 24px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="background-color: ${healthStyles.bg}; border: 2px solid ${healthStyles.border}; border-radius: 12px; padding: 20px; text-align: center;">
                    <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">מדד הבריאות שלך</p>
                    <div style="font-size: 48px; font-weight: 700; color: ${healthStyles.text}; margin: 0;">${content.healthScore}</div>
                    <span style="display: inline-block; background-color: ${healthStyles.text}; color: #ffffff; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: 600; margin-top: 8px;">${healthStyles.label}</span>
                    ${content.healthInsight ? `<p style="margin: 16px 0 0 0; color: #4b5563; font-size: 14px;">${content.healthInsight}</p>` : ''}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Today's Events -->
          ${content.todayEvents.length > 0 ? `
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 18px; font-weight: 600;">
                <span style="margin-left: 8px;">📅</span>
                אירועים להיום
              </h2>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                ${content.todayEvents.map(event => `
                <tr>
                  <td style="padding: 12px; background-color: #f3f4f6; border-radius: 8px; margin-bottom: 8px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="color: #6366f1; font-weight: 600; font-size: 14px; width: 60px;">${event.time}</td>
                        <td style="color: #111827; font-size: 14px;">${event.title}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr><td style="height: 8px;"></td></tr>
                `).join('')}
              </table>
            </td>
          </tr>
          ` : ''}

          <!-- Top Tasks -->
          ${content.topTasks.length > 0 ? `
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 18px; font-weight: 600;">
                <span style="margin-left: 8px;">✓</span>
                משימות עיקריות
              </h2>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                ${content.topTasks.slice(0, 5).map(task => `
                <tr>
                  <td style="padding: 12px; background-color: #f3f4f6; border-radius: 8px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="width: 24px; vertical-align: top;">
                          <div style="width: 8px; height: 8px; border-radius: 50%; background-color: ${
                            task.priority === 'HIGH' ? '#dc2626' :
                            task.priority === 'MEDIUM' ? '#d97706' : '#9ca3af'
                          }; margin-top: 6px;"></div>
                        </td>
                        <td style="color: #111827; font-size: 14px;">${task.title}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr><td style="height: 8px;"></td></tr>
                `).join('')}
              </table>
            </td>
          </tr>
          ` : ''}

          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 32px 32px 32px; text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://app.creators-os.com'}/focus" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px;">
                התחל מצב פוקוס
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #f9fafb; border-radius: 0 0 16px 16px; text-align: center;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                אימייל זה נשלח מ-CreatorsOS
              </p>
              <p style="margin: 8px 0 0 0; color: #9ca3af; font-size: 12px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://app.creators-os.com'}/settings/notifications" style="color: #6366f1; text-decoration: none;">ניהול העדפות מייל</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
}

/**
 * Generate Agency Digest email HTML
 */
export function generateAgencyDigestHTML(content: AgencyDigestContent): string {
  const formattedDate = new Date(content.date).toLocaleDateString('he-IL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const trendEmoji = content.weeklyTrend === 'improving' ? '📈' :
                     content.weeklyTrend === 'declining' ? '📉' : '➡️'

  return `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>סיכום הסוכנות</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb; direction: rtl;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f9fafb;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 32px; border-radius: 16px 16px 0 0; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">סיכום הסוכנות</h1>
              <p style="margin: 8px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">${formattedDate}</p>
            </td>
          </tr>

          <!-- Stats Overview -->
          <tr>
            <td style="padding: 24px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="width: 50%; padding: 8px;">
                    <div style="background-color: #f3f4f6; border-radius: 12px; padding: 16px; text-align: center;">
                      <p style="margin: 0; color: #6b7280; font-size: 12px;">סה״כ יוצרים</p>
                      <p style="margin: 4px 0 0 0; color: #111827; font-size: 24px; font-weight: 700;">${content.totalCreators}</p>
                    </div>
                  </td>
                  <td style="width: 50%; padding: 8px;">
                    <div style="background-color: #f3f4f6; border-radius: 12px; padding: 16px; text-align: center;">
                      <p style="margin: 0; color: #6b7280; font-size: 12px;">מגמה שבועית</p>
                      <p style="margin: 4px 0 0 0; font-size: 24px;">${trendEmoji}</p>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Overloaded Creators Alert -->
          ${content.overloadedCreators.length > 0 ? `
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              <div style="background-color: #fef2f2; border: 2px solid #fecaca; border-radius: 12px; padding: 20px;">
                <h2 style="margin: 0 0 12px 0; color: #dc2626; font-size: 16px; font-weight: 600;">
                  <span style="margin-left: 8px;">🔥</span>
                  יוצרים בעומס גבוה (${content.overloadedCreators.length})
                </h2>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  ${content.overloadedCreators.map(creator => `
                  <tr>
                    <td style="padding: 8px 0;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                        <tr>
                          <td style="color: #111827; font-weight: 500;">${creator.creatorName}</td>
                          <td style="text-align: left; color: #dc2626; font-weight: 600;">ציון ${creator.score}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  `).join('')}
                </table>
              </div>
            </td>
          </tr>
          ` : ''}

          <!-- Busy Creators -->
          ${content.busyCreators.length > 0 ? `
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              <div style="background-color: #fffbeb; border: 2px solid #fde68a; border-radius: 12px; padding: 20px;">
                <h2 style="margin: 0 0 12px 0; color: #d97706; font-size: 16px; font-weight: 600;">
                  <span style="margin-left: 8px;">⚡</span>
                  יוצרים עסוקים (${content.busyCreators.length})
                </h2>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  ${content.busyCreators.slice(0, 5).map(creator => `
                  <tr>
                    <td style="padding: 8px 0;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                        <tr>
                          <td style="color: #111827; font-weight: 500;">${creator.creatorName}</td>
                          <td style="text-align: left; color: #d97706; font-weight: 600;">ציון ${creator.score}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  `).join('')}
                </table>
              </div>
            </td>
          </tr>
          ` : ''}

          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 32px 32px 32px; text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://app.creators-os.com'}/agency/control" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: #ffffff; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px;">
                פתח לוח בקרה
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #f9fafb; border-radius: 0 0 16px 16px; text-align: center;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                אימייל זה נשלח מ-CreatorsOS
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
}
