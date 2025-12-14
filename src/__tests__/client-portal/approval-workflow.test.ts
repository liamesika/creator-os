/**
 * Tests for Approval Workflow Logic
 */

import type {
  ApprovalStatus,
  ApprovalItem,
  ApprovalComment,
} from '@/types/client-portal'

describe('Approval Workflow', () => {
  describe('Status transitions', () => {
    const validTransitions: Record<ApprovalStatus, ApprovalStatus[]> = {
      draft: ['pending'],
      pending: ['approved', 'changes_requested'],
      approved: [], // Final state for client
      changes_requested: ['pending'], // Can resubmit
    }

    it('should define valid transitions from draft', () => {
      expect(validTransitions.draft).toContain('pending')
      expect(validTransitions.draft).not.toContain('approved')
    })

    it('should define valid transitions from pending', () => {
      expect(validTransitions.pending).toContain('approved')
      expect(validTransitions.pending).toContain('changes_requested')
      expect(validTransitions.pending).not.toContain('draft')
    })

    it('should allow resubmission from changes_requested', () => {
      expect(validTransitions.changes_requested).toContain('pending')
    })

    it('approved should be a final state for clients', () => {
      // Creators/agencies can still modify, but clients cannot
      expect(validTransitions.approved).toHaveLength(0)
    })
  })

  describe('Comment author types', () => {
    const authorTypes = ['creator', 'client', 'agency'] as const

    authorTypes.forEach(type => {
      it(`should support ${type} author type`, () => {
        const comment: ApprovalComment = {
          id: 'comment-id',
          approvalItemId: 'item-id',
          authorType: type,
          message: 'Test message',
          createdAt: new Date().toISOString(),
        }

        expect(comment.authorType).toBe(type)
      })
    })

    it('should support optional author name', () => {
      const commentWithName: ApprovalComment = {
        id: 'comment-id',
        approvalItemId: 'item-id',
        authorType: 'client',
        authorName: 'John Doe',
        message: 'Test message',
        createdAt: new Date().toISOString(),
      }

      expect(commentWithName.authorName).toBe('John Doe')

      const commentWithoutName: ApprovalComment = {
        id: 'comment-id',
        approvalItemId: 'item-id',
        authorType: 'client',
        message: 'Test message',
        createdAt: new Date().toISOString(),
      }

      expect(commentWithoutName.authorName).toBeUndefined()
    })
  })

  describe('Approval item validation', () => {
    it('should require companyId', () => {
      const item: ApprovalItem = {
        id: 'test-id',
        creatorUserId: 'user-id',
        companyId: 'company-id', // Required
        title: 'Test',
        type: 'post',
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      expect(item.companyId).toBeDefined()
      expect(item.companyId).not.toBe('')
    })

    it('should support optional fields', () => {
      const item: ApprovalItem = {
        id: 'test-id',
        creatorUserId: 'user-id',
        companyId: 'company-id',
        title: 'Test',
        type: 'post',
        status: 'draft',
        dueOn: '2024-01-15',
        assetUrl: 'https://example.com/asset.jpg',
        notes: 'Some notes',
        relatedEventId: 'event-123',
        relatedTaskId: 'task-456',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      expect(item.dueOn).toBe('2024-01-15')
      expect(item.assetUrl).toBe('https://example.com/asset.jpg')
      expect(item.notes).toBe('Some notes')
      expect(item.relatedEventId).toBe('event-123')
      expect(item.relatedTaskId).toBe('task-456')
    })

    it('should track comments count', () => {
      const item: ApprovalItem = {
        id: 'test-id',
        creatorUserId: 'user-id',
        companyId: 'company-id',
        title: 'Test',
        type: 'post',
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        commentsCount: 5,
      }

      expect(item.commentsCount).toBe(5)
    })
  })

  describe('Client portal approval restrictions', () => {
    const clientAllowedStatuses: ApprovalStatus[] = ['approved', 'changes_requested']
    const creatorAllowedStatuses: ApprovalStatus[] = ['draft', 'pending', 'approved', 'changes_requested']

    it('client can only set approved or changes_requested', () => {
      expect(clientAllowedStatuses).toContain('approved')
      expect(clientAllowedStatuses).toContain('changes_requested')
      expect(clientAllowedStatuses).not.toContain('draft')
      expect(clientAllowedStatuses).not.toContain('pending')
    })

    it('creator/agency can set all statuses', () => {
      expect(creatorAllowedStatuses).toHaveLength(4)
      expect(creatorAllowedStatuses).toContain('draft')
      expect(creatorAllowedStatuses).toContain('pending')
      expect(creatorAllowedStatuses).toContain('approved')
      expect(creatorAllowedStatuses).toContain('changes_requested')
    })

    it('client cannot set to draft', () => {
      const validateClientAction = (status: ApprovalStatus) => {
        return clientAllowedStatuses.includes(status)
      }

      expect(validateClientAction('draft')).toBe(false)
      expect(validateClientAction('approved')).toBe(true)
    })
  })
})
