import { NextRequest, NextResponse } from 'next/server'
import { generateICSFeed } from '@/lib/integrations/ics-generator'

/**
 * ICS Feed Endpoint
 *
 * Serves calendar events in ICS format for Apple Calendar and other apps
 *
 * In production, this would:
 * 1. Validate the feedId against stored feed URLs in Supabase
 * 2. Fetch the user's events from the database
 * 3. Generate and return the ICS feed
 *
 * For demo mode, it returns a sample feed
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { feedId: string } }
) {
  try {
    const feedId = params.feedId

    if (!feedId) {
      return new NextResponse('Feed ID required', { status: 400 })
    }

    // In production:
    // 1. Look up feedId in integrations table
    // 2. Get userId from integration
    // 3. Fetch user's events
    // 4. Generate ICS feed

    // For now, return demo events
    const demoEvents = [
      {
        id: 'demo-event-1',
        title: 'פגישה עם לקוח',
        description: 'פגישת תכנון לקמפיין חדש',
        startTime: new Date('2025-01-15T10:00:00'),
        endTime: new Date('2025-01-15T11:00:00'),
        category: 'MEETING',
        companyName: 'חברת הדוגמה',
        reminders: [{ enabled: true, minutesBefore: 15, type: 'notification' }],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'demo-event-2',
        title: 'יצירת תוכן',
        description: 'כתיבת פוסט לאינסטגרם',
        startTime: new Date('2025-01-16T14:00:00'),
        endTime: new Date('2025-01-16T16:00:00'),
        category: 'CONTENT_CREATION',
        companyName: 'חברת הדוגמה',
        reminders: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    const icsContent = generateICSFeed(demoEvents as any, 'Creators OS')

    return new NextResponse(icsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'inline; filename="creators-os-calendar.ics"',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  } catch (error) {
    console.error('ICS feed generation error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
