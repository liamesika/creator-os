/**
 * Tests for Deliverables Logic
 */

import type {
  Deliverable,
  DeliverableStatus,
} from '@/types/client-portal'

describe('Deliverables', () => {
  describe('Progress calculation', () => {
    it('should calculate progress percentage correctly', () => {
      const calculateProgress = (deliverable: Deliverable): number => {
        if (deliverable.quantity === 0) return 0
        return Math.round((deliverable.completedQuantity / deliverable.quantity) * 100)
      }

      const deliverable: Deliverable = {
        id: 'test-id',
        creatorUserId: 'user-id',
        companyId: 'company-id',
        month: '2024-01',
        title: 'Posts',
        quantity: 10,
        completedQuantity: 5,
        status: 'in_progress',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      expect(calculateProgress(deliverable)).toBe(50)
    })

    it('should handle zero quantity', () => {
      const calculateProgress = (deliverable: Deliverable): number => {
        if (deliverable.quantity === 0) return 0
        return Math.round((deliverable.completedQuantity / deliverable.quantity) * 100)
      }

      const deliverable: Deliverable = {
        id: 'test-id',
        creatorUserId: 'user-id',
        companyId: 'company-id',
        month: '2024-01',
        title: 'Posts',
        quantity: 0,
        completedQuantity: 0,
        status: 'planned',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      expect(calculateProgress(deliverable)).toBe(0)
    })

    it('should calculate 100% when fully completed', () => {
      const calculateProgress = (deliverable: Deliverable): number => {
        if (deliverable.quantity === 0) return 0
        return Math.round((deliverable.completedQuantity / deliverable.quantity) * 100)
      }

      const deliverable: Deliverable = {
        id: 'test-id',
        creatorUserId: 'user-id',
        companyId: 'company-id',
        month: '2024-01',
        title: 'Posts',
        quantity: 10,
        completedQuantity: 10,
        status: 'delivered',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      expect(calculateProgress(deliverable)).toBe(100)
    })
  })

  describe('Month format validation', () => {
    it('should validate correct month format YYYY-MM', () => {
      const isValidMonth = (month: string): boolean => {
        return /^\d{4}-\d{2}$/.test(month)
      }

      expect(isValidMonth('2024-01')).toBe(true)
      expect(isValidMonth('2024-12')).toBe(true)
      expect(isValidMonth('2025-06')).toBe(true)
    })

    it('should reject invalid month formats', () => {
      const isValidMonth = (month: string): boolean => {
        return /^\d{4}-\d{2}$/.test(month)
      }

      expect(isValidMonth('2024/01')).toBe(false)
      expect(isValidMonth('01-2024')).toBe(false)
      expect(isValidMonth('2024-1')).toBe(false)
      expect(isValidMonth('24-01')).toBe(false)
      expect(isValidMonth('January 2024')).toBe(false)
    })
  })

  describe('Status transitions', () => {
    const statusOrder: DeliverableStatus[] = ['planned', 'in_progress', 'delivered']

    it('should follow logical progression', () => {
      expect(statusOrder.indexOf('planned')).toBeLessThan(statusOrder.indexOf('in_progress'))
      expect(statusOrder.indexOf('in_progress')).toBeLessThan(statusOrder.indexOf('delivered'))
    })

    it('should determine if deliverable is complete', () => {
      const isComplete = (deliverable: Deliverable): boolean => {
        return deliverable.status === 'delivered' ||
          deliverable.completedQuantity >= deliverable.quantity
      }

      const incompleteDeliverable: Deliverable = {
        id: 'test-id',
        creatorUserId: 'user-id',
        companyId: 'company-id',
        month: '2024-01',
        title: 'Posts',
        quantity: 10,
        completedQuantity: 5,
        status: 'in_progress',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const completeDeliverable: Deliverable = {
        id: 'test-id',
        creatorUserId: 'user-id',
        companyId: 'company-id',
        month: '2024-01',
        title: 'Posts',
        quantity: 10,
        completedQuantity: 10,
        status: 'delivered',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      expect(isComplete(incompleteDeliverable)).toBe(false)
      expect(isComplete(completeDeliverable)).toBe(true)
    })
  })

  describe('Uniqueness constraint', () => {
    it('should identify duplicate deliverables by title+month+company', () => {
      const deliverables: Deliverable[] = [
        {
          id: 'del-1',
          creatorUserId: 'user-id',
          companyId: 'company-1',
          month: '2024-01',
          title: 'Posts',
          quantity: 10,
          completedQuantity: 0,
          status: 'planned',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]

      const isDuplicate = (newDel: { title: string; month: string; companyId: string }): boolean => {
        return deliverables.some(d =>
          d.title === newDel.title &&
          d.month === newDel.month &&
          d.companyId === newDel.companyId
        )
      }

      // Same title, month, company - should be duplicate
      expect(isDuplicate({ title: 'Posts', month: '2024-01', companyId: 'company-1' })).toBe(true)

      // Different month - not duplicate
      expect(isDuplicate({ title: 'Posts', month: '2024-02', companyId: 'company-1' })).toBe(false)

      // Different company - not duplicate
      expect(isDuplicate({ title: 'Posts', month: '2024-01', companyId: 'company-2' })).toBe(false)

      // Different title - not duplicate
      expect(isDuplicate({ title: 'Reels', month: '2024-01', companyId: 'company-1' })).toBe(false)
    })
  })

  describe('Aggregated stats', () => {
    it('should calculate total progress across deliverables', () => {
      const deliverables: Deliverable[] = [
        {
          id: 'del-1',
          creatorUserId: 'user-id',
          companyId: 'company-1',
          month: '2024-01',
          title: 'Posts',
          quantity: 10,
          completedQuantity: 5,
          status: 'in_progress',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'del-2',
          creatorUserId: 'user-id',
          companyId: 'company-1',
          month: '2024-01',
          title: 'Reels',
          quantity: 5,
          completedQuantity: 3,
          status: 'in_progress',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]

      const totalQuantity = deliverables.reduce((sum, d) => sum + d.quantity, 0)
      const totalCompleted = deliverables.reduce((sum, d) => sum + d.completedQuantity, 0)
      const overallProgress = Math.round((totalCompleted / totalQuantity) * 100)

      expect(totalQuantity).toBe(15)
      expect(totalCompleted).toBe(8)
      expect(overallProgress).toBe(53)
    })
  })
})
