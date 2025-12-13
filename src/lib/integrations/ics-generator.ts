/**
 * ICS Feed Generator
 *
 * Generates iCalendar (.ics) feeds for Apple Calendar and other calendar apps
 */

import { CalendarEvent } from '@/types/calendar'

/**
 * Formats a date for ICS format (YYYYMMDDTHHMMSS)
 */
function formatICSDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return `${year}${month}${day}T${hours}${minutes}${seconds}`
}

/**
 * Escapes special characters in ICS text fields
 */
function escapeICSText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}

/**
 * Generates an ICS file from calendar events
 */
export function generateICSFeed(events: CalendarEvent[], feedName: string = 'Creators OS'): string {
  const now = new Date()
  const lines: string[] = []

  // Calendar header
  lines.push('BEGIN:VCALENDAR')
  lines.push('VERSION:2.0')
  lines.push('PRODID:-//Creators OS//Calendar Feed//HE')
  lines.push('CALSCALE:GREGORIAN')
  lines.push('METHOD:PUBLISH')
  lines.push(`X-WR-CALNAME:${escapeICSText(feedName)}`)
  lines.push('X-WR-TIMEZONE:Asia/Jerusalem')
  lines.push(`X-WR-CALDESC:${escapeICSText('לוח השנה שלכם מ-Creators OS')}`)

  // Add each event
  for (const event of events) {
    // Combine date with time strings to create full DateTime
    const eventDate = new Date(event.date)
    const [startHour, startMin] = event.startTime.split(':').map(Number)
    const [endHour, endMin] = event.endTime.split(':').map(Number)

    const startDate = new Date(eventDate)
    startDate.setHours(startHour, startMin, 0, 0)

    const endDate = new Date(eventDate)
    endDate.setHours(endHour, endMin, 0, 0)

    const createdDate = new Date(event.createdAt)
    const modifiedDate = new Date(event.updatedAt)

    lines.push('BEGIN:VEVENT')
    lines.push(`UID:${event.id}@creators-os.com`)
    lines.push(`DTSTAMP:${formatICSDate(now)}`)
    lines.push(`DTSTART:${formatICSDate(startDate)}`)
    lines.push(`DTEND:${formatICSDate(endDate)}`)
    lines.push(`CREATED:${formatICSDate(createdDate)}`)
    lines.push(`LAST-MODIFIED:${formatICSDate(modifiedDate)}`)
    lines.push(`SUMMARY:${escapeICSText(event.title)}`)

    if (event.notes) {
      lines.push(`DESCRIPTION:${escapeICSText(event.notes)}`)
    }

    // Add category
    const categoryMap: Record<string, string> = {
      'CONTENT_CREATION': 'יצירת תוכן',
      'MEETING': 'פגישה',
      'DEADLINE': 'דדליין',
      'PLANNING': 'תכנון',
      'ADMIN': 'משרדי',
    }
    const categoryName = categoryMap[event.category] || event.category
    lines.push(`CATEGORIES:${escapeICSText(categoryName)}`)

    // Add company name if present
    if (event.companyNameSnapshot) {
      lines.push(`LOCATION:${escapeICSText(event.companyNameSnapshot)}`)
    }

    // Add reminders
    if (event.reminders && event.reminders.length > 0) {
      for (const reminder of event.reminders) {
        lines.push('BEGIN:VALARM')
        lines.push('ACTION:DISPLAY')
        lines.push(`DESCRIPTION:${escapeICSText(event.title)}`)
        lines.push(`TRIGGER:-PT${reminder.minutesBefore}M`)
        lines.push('END:VALARM')
      }
    }

    lines.push('END:VEVENT')
  }

  // Calendar footer
  lines.push('END:VCALENDAR')

  return lines.join('\r\n')
}

/**
 * Generates a single ICS event (for download)
 */
export function generateSingleICSEvent(event: CalendarEvent): string {
  return generateICSFeed([event], event.title)
}

/**
 * Downloads an ICS file
 */
export function downloadICSFile(icsContent: string, filename: string = 'calendar.ics') {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
