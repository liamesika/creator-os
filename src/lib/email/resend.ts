/**
 * Resend Email Integration
 * Handles sending emails via Resend API
 *
 * To enable email functionality:
 * 1. Run: npm install resend
 * 2. Set RESEND_API_KEY environment variable
 */

interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  from?: string
  replyTo?: string
}

interface SendEmailResult {
  success: boolean
  id?: string
  error?: string
}

/**
 * Check if Resend is configured
 */
export function isResendConfigured(): boolean {
  return !!process.env.RESEND_API_KEY
}

/**
 * Send an email using Resend
 *
 * This is a stub that works without the resend package installed.
 * In production, install resend and update this function to use it.
 */
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  const { to, subject, html, from, replyTo } = options

  // Check if configured
  if (!isResendConfigured()) {
    console.warn('Resend not configured. Set RESEND_API_KEY environment variable.')
    return { success: false, error: 'Email service not configured' }
  }

  // Default from address
  const fromAddress = from || process.env.EMAIL_FROM || 'CreatorsOS <noreply@creators-os.com>'

  try {
    // Make direct API call to Resend instead of using SDK
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        reply_to: replyTo,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Resend API error:', errorData)
      return {
        success: false,
        error: errorData.message || `HTTP ${response.status}`,
      }
    }

    const data = await response.json()
    return { success: true, id: data.id }
  } catch (error) {
    console.error('Failed to send email:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
