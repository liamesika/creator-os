import {
  formatEarnings,
  getMonthName,
  getYearMonth,
  MAX_CREATORS_PER_AGENCY,
  ROLE_CONFIGS,
  STATUS_CONFIGS,
} from '@/types/agency'

describe('Agency Types', () => {
  describe('formatEarnings', () => {
    it('should format ILS currency correctly', () => {
      expect(formatEarnings(1000, 'ILS')).toBe('₪1,000')
      expect(formatEarnings(1500.50, 'ILS')).toBe('₪1,500.5')
    })

    it('should format USD currency correctly', () => {
      expect(formatEarnings(1000, 'USD')).toBe('$1,000')
    })

    it('should format EUR currency correctly', () => {
      expect(formatEarnings(1000, 'EUR')).toBe('€1,000')
    })

    it('should use ILS as default currency', () => {
      expect(formatEarnings(1000)).toBe('₪1,000')
    })

    it('should handle zero correctly', () => {
      expect(formatEarnings(0)).toBe('₪0')
    })
  })

  describe('getMonthName', () => {
    it('should return Hebrew month names', () => {
      expect(getMonthName(new Date(2024, 0, 1))).toBe('ינואר')
      expect(getMonthName(new Date(2024, 5, 1))).toBe('יוני')
      expect(getMonthName(new Date(2024, 11, 1))).toBe('דצמבר')
    })
  })

  describe('getYearMonth', () => {
    it('should return YYYY-MM format', () => {
      expect(getYearMonth(new Date(2024, 0, 15))).toBe('2024-01')
      expect(getYearMonth(new Date(2024, 11, 1))).toBe('2024-12')
    })

    it('should pad single-digit months', () => {
      expect(getYearMonth(new Date(2024, 2, 1))).toBe('2024-03')
    })
  })

  describe('Constants', () => {
    it('should have MAX_CREATORS_PER_AGENCY set to 40', () => {
      expect(MAX_CREATORS_PER_AGENCY).toBe(40)
    })

    it('should have ROLE_CONFIGS for all roles', () => {
      expect(ROLE_CONFIGS.creator).toBeDefined()
      expect(ROLE_CONFIGS.manager).toBeDefined()
      expect(ROLE_CONFIGS.admin).toBeDefined()
    })

    it('should have STATUS_CONFIGS for all statuses', () => {
      expect(STATUS_CONFIGS.active).toBeDefined()
      expect(STATUS_CONFIGS.invited).toBeDefined()
      expect(STATUS_CONFIGS.removed).toBeDefined()
    })
  })
})
