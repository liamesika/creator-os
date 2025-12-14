/**
 * Agency Access Control Tests
 *
 * Tests for verifying agency routing and access control.
 */

describe('Agency Access Control', () => {
  describe('Route Protection', () => {
    const agencyRoutes = ['/agency', '/agency/members', '/agency/creators/uuid-123']
    const creatorRoutes = ['/dashboard', '/calendar', '/tasks', '/goals', '/companies']

    it('should identify agency routes correctly', () => {
      const isAgencyRoute = (path: string) => path.startsWith('/agency')

      agencyRoutes.forEach(route => {
        expect(isAgencyRoute(route)).toBe(true)
      })

      creatorRoutes.forEach(route => {
        expect(isAgencyRoute(route)).toBe(false)
      })
    })

    it('should redirect non-agency users from agency routes', () => {
      const user = { accountType: 'creator' }
      const currentPath = '/agency'

      const shouldRedirect = user.accountType !== 'agency' && currentPath.startsWith('/agency')
      expect(shouldRedirect).toBe(true)
    })

    it('should allow agency users to access agency routes', () => {
      const user = { accountType: 'agency' }
      const currentPath = '/agency'

      const shouldRedirect = user.accountType !== 'agency' && currentPath.startsWith('/agency')
      expect(shouldRedirect).toBe(false)
    })
  })

  describe('Navigation Items', () => {
    const creatorNavItems = [
      { href: '/dashboard', label: 'דשבורד' },
      { href: '/calendar', label: 'יומן' },
      { href: '/companies', label: 'חברות' },
      { href: '/tasks', label: 'משימות' },
      { href: '/goals', label: 'מטרות' },
    ]

    const agencyNavItems = [
      { href: '/agency', label: 'דשבורד סוכנות' },
      { href: '/agency/members', label: 'ניהול יוצרים' },
    ]

    it('should show creator nav items for creators', () => {
      const user = { accountType: 'creator' }
      const navItems = user.accountType === 'agency' ? agencyNavItems : creatorNavItems

      expect(navItems).toEqual(creatorNavItems)
      expect(navItems.some(item => item.href === '/dashboard')).toBe(true)
      expect(navItems.some(item => item.href === '/agency')).toBe(false)
    })

    it('should show agency nav items for agencies', () => {
      const user = { accountType: 'agency' }
      const navItems = user.accountType === 'agency' ? agencyNavItems : creatorNavItems

      expect(navItems).toEqual(agencyNavItems)
      expect(navItems.some(item => item.href === '/agency')).toBe(true)
      expect(navItems.some(item => item.href === '/dashboard')).toBe(false)
    })
  })

  describe('Creator Detail Access', () => {
    it('should only allow access to managed creators', () => {
      const agencyId = 'agency-123'
      const requestedCreatorId = 'creator-456'

      const memberships = [
        { agencyId: 'agency-123', creatorUserId: 'creator-456', status: 'active' },
      ]

      const hasAccess = memberships.some(
        m => m.agencyId === agencyId && m.creatorUserId === requestedCreatorId && m.status === 'active'
      )

      expect(hasAccess).toBe(true)
    })

    it('should deny access to unmanaged creators', () => {
      const agencyId = 'agency-123'
      const requestedCreatorId = 'other-creator'

      const memberships = [
        { agencyId: 'agency-123', creatorUserId: 'creator-456', status: 'active' },
      ]

      const hasAccess = memberships.some(
        m => m.agencyId === agencyId && m.creatorUserId === requestedCreatorId && m.status === 'active'
      )

      expect(hasAccess).toBe(false)
    })

    it('should deny access to removed creators', () => {
      const agencyId = 'agency-123'
      const requestedCreatorId = 'creator-456'

      const memberships = [
        { agencyId: 'agency-123', creatorUserId: 'creator-456', status: 'removed' },
      ]

      const hasAccess = memberships.some(
        m => m.agencyId === agencyId && m.creatorUserId === requestedCreatorId && m.status === 'active'
      )

      expect(hasAccess).toBe(false)
    })
  })
})
