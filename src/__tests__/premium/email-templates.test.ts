import {
  getRandomMotivation,
  generateDailyDigestHTML,
  generateAgencyDigestHTML,
} from '@/lib/email/templates'
import type { DailyDigestContent, AgencyDigestContent } from '@/types/premium'

describe('Email Templates', () => {
  describe('getRandomMotivation', () => {
    it('should return a non-empty string', () => {
      const motivation = getRandomMotivation()
      expect(typeof motivation).toBe('string')
      expect(motivation.length).toBeGreaterThan(0)
    })

    it('should return Hebrew text', () => {
      const motivation = getRandomMotivation()
      // Hebrew characters are in Unicode range 0x0590-0x05FF
      const hasHebrew = /[\u0590-\u05FF]/.test(motivation)
      expect(hasHebrew).toBe(true)
    })
  })

  describe('generateDailyDigestHTML', () => {
    const mockContent: DailyDigestContent = {
      userId: 'user-1',
      userName: 'ישראל ישראלי',
      userEmail: 'israel@example.com',
      date: '2024-03-15',
      topTasks: [
        { id: 'task-1', title: 'משימה ראשונה', priority: 'HIGH' },
        { id: 'task-2', title: 'משימה שנייה', priority: 'MEDIUM' },
      ],
      todayEvents: [
        { id: 'event-1', title: 'פגישה עם לקוח', time: '10:00' },
        { id: 'event-2', title: 'שיחת וידאו', time: '14:00' },
      ],
      healthScore: 42,
      healthStatus: 'busy',
      healthInsight: 'יום עמוס, תעדפו משימות',
      motivationalMessage: 'כל יום הוא הזדמנות חדשה',
    }

    it('should generate valid HTML', () => {
      const html = generateDailyDigestHTML(mockContent)

      expect(html).toContain('<!DOCTYPE html>')
      expect(html).toContain('</html>')
      expect(html).toContain('dir="rtl"')
    })

    it('should include user name', () => {
      const html = generateDailyDigestHTML(mockContent)
      expect(html).toContain('ישראל ישראלי')
    })

    it('should include health score', () => {
      const html = generateDailyDigestHTML(mockContent)
      expect(html).toContain('42')
    })

    it('should include tasks', () => {
      const html = generateDailyDigestHTML(mockContent)
      expect(html).toContain('משימה ראשונה')
      expect(html).toContain('משימה שנייה')
    })

    it('should include events', () => {
      const html = generateDailyDigestHTML(mockContent)
      expect(html).toContain('פגישה עם לקוח')
      expect(html).toContain('10:00')
    })

    it('should include motivational message when provided', () => {
      const html = generateDailyDigestHTML(mockContent)
      expect(html).toContain('כל יום הוא הזדמנות חדשה')
    })

    it('should not include motivational section when empty', () => {
      const contentWithoutMotivation = { ...mockContent, motivationalMessage: '' }
      const html = generateDailyDigestHTML(contentWithoutMotivation)
      expect(html).not.toContain('כל יום הוא הזדמנות חדשה')
    })

    it('should include health insight', () => {
      const html = generateDailyDigestHTML(mockContent)
      expect(html).toContain('יום עמוס, תעדפו משימות')
    })

    it('should include CTA link to focus mode', () => {
      const html = generateDailyDigestHTML(mockContent)
      expect(html).toContain('/focus')
      expect(html).toContain('מצב פוקוס')
    })
  })

  describe('generateAgencyDigestHTML', () => {
    const mockContent: AgencyDigestContent = {
      agencyId: 'agency-1',
      agencyName: 'סוכנות הכוכבים',
      agencyEmail: 'agency@example.com',
      date: '2024-03-15',
      totalCreators: 5,
      overloadedCreators: [
        {
          creatorId: 'creator-1',
          creatorName: 'יוסי כהן',
          creatorEmail: 'yossi@example.com',
          score: 85,
          status: 'overloaded',
          insights: [],
        },
      ],
      busyCreators: [
        {
          creatorId: 'creator-2',
          creatorName: 'שרה לוי',
          creatorEmail: 'sara@example.com',
          score: 55,
          status: 'busy',
          insights: [],
        },
      ],
      weeklyTrend: 'stable',
    }

    it('should generate valid HTML', () => {
      const html = generateAgencyDigestHTML(mockContent)

      expect(html).toContain('<!DOCTYPE html>')
      expect(html).toContain('</html>')
      expect(html).toContain('dir="rtl"')
    })

    it('should include agency stats', () => {
      const html = generateAgencyDigestHTML(mockContent)
      expect(html).toContain('5') // total creators
    })

    it('should include overloaded creators', () => {
      const html = generateAgencyDigestHTML(mockContent)
      expect(html).toContain('יוסי כהן')
      expect(html).toContain('85')
    })

    it('should include busy creators', () => {
      const html = generateAgencyDigestHTML(mockContent)
      expect(html).toContain('שרה לוי')
      expect(html).toContain('55')
    })

    it('should include trend emoji', () => {
      const html = generateAgencyDigestHTML(mockContent)
      expect(html).toContain('➡️') // stable trend
    })

    it('should include CTA link to control panel', () => {
      const html = generateAgencyDigestHTML(mockContent)
      expect(html).toContain('/agency/control')
      expect(html).toContain('לוח בקרה')
    })

    it('should show improving trend correctly', () => {
      const improving = { ...mockContent, weeklyTrend: 'improving' as const }
      const html = generateAgencyDigestHTML(improving)
      expect(html).toContain('📈')
    })

    it('should show declining trend correctly', () => {
      const declining = { ...mockContent, weeklyTrend: 'declining' as const }
      const html = generateAgencyDigestHTML(declining)
      expect(html).toContain('📉')
    })
  })
})
