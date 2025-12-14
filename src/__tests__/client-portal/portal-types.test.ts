/**
 * Tests for Client Portal Types
 */

import {
  APPROVAL_TYPE_CONFIG,
  APPROVAL_STATUS_CONFIG,
  DELIVERABLE_STATUS_CONFIG,
  generatePortalToken,
  type ApprovalItemType,
  type ApprovalStatus,
  type DeliverableStatus,
  type ApprovalItem,
  type Deliverable,
  type ClientPortal,
} from '@/types/client-portal'

describe('Client Portal Types', () => {
  describe('generatePortalToken', () => {
    it('should generate a 32-character token', () => {
      const token = generatePortalToken()
      expect(token).toHaveLength(32)
    })

    it('should only contain alphanumeric characters', () => {
      const token = generatePortalToken()
      expect(token).toMatch(/^[a-zA-Z0-9]+$/)
    })

    it('should generate unique tokens', () => {
      const tokens = new Set<string>()
      for (let i = 0; i < 100; i++) {
        tokens.add(generatePortalToken())
      }
      expect(tokens.size).toBe(100)
    })
  })

  describe('APPROVAL_TYPE_CONFIG', () => {
    const expectedTypes: ApprovalItemType[] = ['post', 'reel', 'story', 'tiktok', 'other']

    expectedTypes.forEach(type => {
      it(`should have config for ${type} type`, () => {
        const config = APPROVAL_TYPE_CONFIG[type]
        expect(config).toBeDefined()
        expect(config.label).toBeDefined()
        expect(config.icon).toBeDefined()
        expect(config.color).toBeDefined()
      })
    })

    it('should have Hebrew labels', () => {
      expect(APPROVAL_TYPE_CONFIG.post.label).toBe('פוסט')
      expect(APPROVAL_TYPE_CONFIG.reel.label).toBe('ריל')
      expect(APPROVAL_TYPE_CONFIG.story.label).toBe('סטורי')
      expect(APPROVAL_TYPE_CONFIG.tiktok.label).toBe('טיקטוק')
      expect(APPROVAL_TYPE_CONFIG.other.label).toBe('אחר')
    })
  })

  describe('APPROVAL_STATUS_CONFIG', () => {
    const expectedStatuses: ApprovalStatus[] = ['draft', 'pending', 'approved', 'changes_requested']

    expectedStatuses.forEach(status => {
      it(`should have config for ${status} status`, () => {
        const config = APPROVAL_STATUS_CONFIG[status]
        expect(config).toBeDefined()
        expect(config.label).toBeDefined()
        expect(config.color).toBeDefined()
        expect(config.bgColor).toBeDefined()
      })
    })

    it('should have appropriate color schemes', () => {
      expect(APPROVAL_STATUS_CONFIG.approved.color).toContain('emerald')
      expect(APPROVAL_STATUS_CONFIG.changes_requested.color).toContain('red')
      expect(APPROVAL_STATUS_CONFIG.pending.color).toContain('amber')
    })
  })

  describe('DELIVERABLE_STATUS_CONFIG', () => {
    const expectedStatuses: DeliverableStatus[] = ['planned', 'in_progress', 'delivered']

    expectedStatuses.forEach(status => {
      it(`should have config for ${status} status`, () => {
        const config = DELIVERABLE_STATUS_CONFIG[status]
        expect(config).toBeDefined()
        expect(config.label).toBeDefined()
        expect(config.color).toBeDefined()
        expect(config.bgColor).toBeDefined()
      })
    })

    it('should have appropriate color schemes', () => {
      expect(DELIVERABLE_STATUS_CONFIG.delivered.color).toContain('emerald')
      expect(DELIVERABLE_STATUS_CONFIG.in_progress.color).toContain('blue')
    })
  })

  describe('Type structures', () => {
    it('ApprovalItem should have correct shape', () => {
      const item: ApprovalItem = {
        id: 'test-id',
        creatorUserId: 'user-id',
        companyId: 'company-id',
        title: 'Test Approval',
        type: 'post',
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      expect(item.id).toBeDefined()
      expect(item.type).toBe('post')
      expect(item.status).toBe('pending')
    })

    it('Deliverable should have correct shape', () => {
      const deliverable: Deliverable = {
        id: 'test-id',
        creatorUserId: 'user-id',
        companyId: 'company-id',
        month: '2024-01',
        title: 'Instagram Posts',
        quantity: 10,
        completedQuantity: 5,
        status: 'in_progress',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      expect(deliverable.id).toBeDefined()
      expect(deliverable.quantity).toBe(10)
      expect(deliverable.completedQuantity).toBe(5)
      expect(deliverable.status).toBe('in_progress')
    })

    it('ClientPortal should have correct shape', () => {
      const portal: ClientPortal = {
        id: 'portal-id',
        creatorUserId: 'user-id',
        companyId: 'company-id',
        token: 'abc123xyz',
        isEnabled: true,
        createdAt: new Date().toISOString(),
      }

      expect(portal.id).toBeDefined()
      expect(portal.token).toBeDefined()
      expect(portal.isEnabled).toBe(true)
    })

    it('ClientPortal should support optional brand fields', () => {
      const portal: ClientPortal = {
        id: 'portal-id',
        creatorUserId: 'user-id',
        companyId: 'company-id',
        token: 'abc123xyz',
        isEnabled: true,
        brandName: 'Custom Brand',
        brandColor: '#7c3aed',
        createdAt: new Date().toISOString(),
      }

      expect(portal.brandName).toBe('Custom Brand')
      expect(portal.brandColor).toBe('#7c3aed')
    })
  })
})
