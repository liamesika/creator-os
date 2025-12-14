'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Users,
  UserPlus,
  UserMinus,
  ChevronRight,
  Mail,
  X,
  Loader2,
  AlertTriangle,
  ExternalLink,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useAgencyDemoStore } from '@/stores/agencyDemoStore'
import { getAgencyDemoMembers } from '@/lib/agency-demo-data'
import { showDemoActionToast } from '@/components/app/AgencyDemoBanner'
import { AgencyCard, AgencyCardHeader, AgencyRow, AgencyEmptyState } from '@/components/app/agency/AgencyCard'
import { MAX_CREATORS_PER_AGENCY, STATUS_CONFIGS } from '@/types/agency'
import type { AgencyMembership } from '@/types/agency'
import { toast } from 'sonner'

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
}

interface MemberWithDetails extends AgencyMembership {
  creator?: {
    id: string
    name: string
    email: string
  }
}

export default function AgencyMembersPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { isAgencyDemo } = useAgencyDemoStore()
  const [members, setMembers] = useState<MemberWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [memberToRemove, setMemberToRemove] = useState<MemberWithDetails | null>(null)

  useEffect(() => {
    // In demo mode, skip account type check
    if (!isAgencyDemo && user?.accountType !== 'agency') {
      router.push('/dashboard')
      return
    }
    loadMembers()
  }, [user, router, isAgencyDemo])

  const loadMembers = async () => {
    // In demo mode, use demo data
    if (isAgencyDemo) {
      setIsLoading(true)
      await new Promise(resolve => setTimeout(resolve, 400))
      setMembers(getAgencyDemoMembers())
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch('/api/agency/members')
      if (!response.ok) throw new Error('Failed to fetch members')
      const data = await response.json()
      setMembers(data.members || [])
    } catch (error) {
      console.error('Error loading members:', error)
      toast.error('שגיאה בטעינת החברים')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInvite = async (email: string) => {
    // Block in demo mode
    if (isAgencyDemo) {
      showDemoActionToast('הזמנת יוצר')
      setShowInviteModal(false)
      return false
    }

    try {
      const response = await fetch('/api/agency/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'שגיאה בהזמנת היוצר')
        return false
      }

      toast.success(data.message)
      setShowInviteModal(false)
      loadMembers()
      return true
    } catch (error) {
      console.error('Error inviting member:', error)
      toast.error('שגיאה בהזמנת היוצר')
      return false
    }
  }

  const handleRemove = async (membershipId: string) => {
    // Block in demo mode
    if (isAgencyDemo) {
      showDemoActionToast('הסרת יוצר')
      setMemberToRemove(null)
      return
    }

    try {
      const response = await fetch('/api/agency/members', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ membershipId }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'שגיאה בהסרת היוצר')
        return
      }

      toast.success(data.message)
      setMemberToRemove(null)
      loadMembers()
    } catch (error) {
      console.error('Error removing member:', error)
      toast.error('שגיאה בהסרת היוצר')
    }
  }

  const activeMembers = members.filter(m => m.status === 'active' || m.status === 'invited')
  const removedMembers = members.filter(m => m.status === 'removed')

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
            <Loader2 size={24} className="text-blue-600 animate-spin" />
          </div>
          <p className="text-sm text-neutral-500">טוען חברי הסוכנות...</p>
        </motion.div>
      </div>
    )
  }

  // In demo mode, skip account type check
  if (!isAgencyDemo && user?.accountType !== 'agency') {
    return null
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="min-h-screen"
    >
      <div className="fixed inset-0 bg-gradient-to-b from-neutral-50 via-white to-neutral-50/80 pointer-events-none" />

      <div className="relative p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
        {/* Back Button & Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <Link
            href="/agency"
            className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 mb-4 transition-colors"
          >
            <ChevronRight size={16} />
            חזרה לדשבורד
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
                ניהול יוצרים
              </h1>
              <p className="text-neutral-500 text-sm mt-1">
                {activeMembers.length} מתוך {MAX_CREATORS_PER_AGENCY} יוצרים
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowInviteModal(true)}
              disabled={activeMembers.length >= MAX_CREATORS_PER_AGENCY}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-accent-600 to-violet-600 text-white rounded-xl text-sm font-medium shadow-lg shadow-accent-600/25 hover:shadow-accent-600/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              <UserPlus size={16} strokeWidth={2.5} />
              <span>הזמן יוצר</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Capacity Warning */}
        <AnimatePresence>
          {activeMembers.length >= MAX_CREATORS_PER_AGENCY && (
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="show"
              exit="hidden"
              className="mb-6"
            >
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle size={18} className="text-amber-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-amber-800">
                      הגעת למגבלת היוצרים
                    </p>
                    <p className="text-sm text-amber-600 mt-1">
                      יש לך {activeMembers.length} יוצרים מתוך {MAX_CREATORS_PER_AGENCY} המותרים.
                      צור קשר לשדרוג החבילה.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Members */}
        <motion.div variants={itemVariants} className="mb-6">
          <AgencyCard delay={0.2} noPadding>
            <div className="p-5 sm:p-6">
              <AgencyCardHeader
                icon={Users}
                iconColor="text-blue-600"
                iconBgColor="bg-gradient-to-br from-blue-100 to-blue-50"
                title="יוצרים פעילים"
                subtitle={`${activeMembers.length} יוצרים`}
              />

              {activeMembers.length === 0 ? (
                <AgencyEmptyState
                  icon={Users}
                  title="עדיין אין יוצרים בסוכנות"
                  description="הזמן יוצרים לסוכנות שלך כדי לנהל את כל ההכנסות, החברות והביצועים שלהם במקום אחד מרכזי."
                  action={{
                    label: 'הזמן את היוצר הראשון',
                    onClick: () => setShowInviteModal(true),
                    icon: UserPlus,
                  }}
                  variant="premium"
                />
              ) : (
                <div className="space-y-3">
                  {activeMembers.map((member, index) => (
                    <MemberCard
                      key={member.id}
                      member={member}
                      index={index}
                      onRemove={() => setMemberToRemove(member)}
                    />
                  ))}
                </div>
              )}
            </div>
          </AgencyCard>
        </motion.div>

        {/* Removed Members */}
        <AnimatePresence>
          {removedMembers.length > 0 && (
            <motion.div variants={itemVariants}>
              <AgencyCard delay={0.3} noPadding>
                <div className="p-5 sm:p-6">
                  <AgencyCardHeader
                    icon={UserMinus}
                    iconColor="text-neutral-500"
                    iconBgColor="bg-gradient-to-br from-neutral-100 to-neutral-50"
                    title="יוצרים שהוסרו"
                    subtitle={`${removedMembers.length} יוצרים`}
                  />

                  <div className="space-y-3">
                    {removedMembers.map((member, index) => (
                      <MemberCard
                        key={member.id}
                        member={member}
                        index={index}
                        isRemoved
                      />
                    ))}
                  </div>
                </div>
              </AgencyCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Invite Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <InviteModal
            onClose={() => setShowInviteModal(false)}
            onInvite={handleInvite}
          />
        )}
      </AnimatePresence>

      {/* Remove Confirmation Modal */}
      <AnimatePresence>
        {memberToRemove && (
          <RemoveConfirmModal
            member={memberToRemove}
            onClose={() => setMemberToRemove(null)}
            onConfirm={() => handleRemove(memberToRemove.id)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

interface MemberCardProps {
  member: MemberWithDetails
  index: number
  isRemoved?: boolean
  onRemove?: () => void
}

function MemberCard({ member, index, isRemoved, onRemove }: MemberCardProps) {
  const name = member.creator?.name || member.inviteEmail?.split('@')[0] || 'יוצר'
  const email = member.creator?.email || member.inviteEmail || ''
  const statusConfig = STATUS_CONFIGS[member.status] || STATUS_CONFIGS.active

  return (
    <AgencyRow index={index} className={isRemoved ? 'opacity-60' : ''}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={!isRemoved ? { scale: 1.05 } : undefined}
            className={`w-11 h-11 rounded-xl flex items-center justify-center ${
              isRemoved
                ? 'bg-neutral-200'
                : 'bg-gradient-to-br from-accent-100 to-violet-100'
            }`}
          >
            <span className={`text-sm font-bold ${isRemoved ? 'text-neutral-500' : 'text-accent-700'}`}>
              {name.charAt(0).toUpperCase()}
            </span>
          </motion.div>
          <div>
            <div className="flex items-center gap-2">
              <p className={`font-semibold ${isRemoved ? 'text-neutral-500' : 'text-neutral-900'}`}>
                {name}
              </p>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusConfig.bgColor} ${statusConfig.color}`}>
                {statusConfig.label}
              </span>
            </div>
            <p className="text-xs text-neutral-500">{email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {member.status === 'active' && member.creator && (
            <Link href={`/agency/creators/${member.creator.id}`}>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-2.5 hover:bg-white rounded-xl transition-all duration-200"
              >
                <ExternalLink size={16} className="text-accent-600" />
              </motion.button>
            </Link>
          )}

          {!isRemoved && onRemove && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onRemove}
              className="p-2.5 hover:bg-red-50 rounded-xl transition-all duration-200"
            >
              <UserMinus size={16} className="text-red-500" />
            </motion.button>
          )}
        </div>
      </div>
    </AgencyRow>
  )
}

interface InviteModalProps {
  onClose: () => void
  onInvite: (email: string) => Promise<boolean>
}

function InviteModal({ onClose, onInvite }: InviteModalProps) {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsSubmitting(true)
    const success = await onInvite(email)
    setIsSubmitting(false)

    if (success) {
      setEmail('')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-100 to-violet-100 flex items-center justify-center">
                <UserPlus size={18} className="text-accent-600" />
              </div>
              <h2 className="text-xl font-bold text-neutral-900">
                הזמנת יוצר חדש
              </h2>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 rounded-xl transition-colors"
            >
              <X size={20} className="text-neutral-500" />
            </motion.button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                כתובת אימייל של היוצר
              </label>
              <div className="relative">
                <Mail size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="creator@example.com"
                  required
                  className="w-full pl-4 pr-10 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all duration-200"
                  dir="ltr"
                />
              </div>
              <p className="text-xs text-neutral-500 mt-2">
                אם היוצר כבר רשום במערכת, הוא יתווסף אוטומטית.
                אחרת, הוא יקבל הזמנה להצטרף.
              </p>
            </div>

            <motion.button
              type="submit"
              disabled={isSubmitting || !email}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-3 bg-gradient-to-r from-accent-600 to-violet-600 text-white rounded-xl font-semibold shadow-lg shadow-accent-600/25 hover:shadow-accent-600/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  שולח הזמנה...
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  שלח הזמנה
                </>
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </motion.div>
  )
}

interface RemoveConfirmModalProps {
  member: MemberWithDetails
  onClose: () => void
  onConfirm: () => void
}

function RemoveConfirmModal({ member, onClose, onConfirm }: RemoveConfirmModalProps) {
  const [isRemoving, setIsRemoving] = useState(false)
  const name = member.creator?.name || member.inviteEmail?.split('@')[0] || 'היוצר'

  const handleConfirm = async () => {
    setIsRemoving(true)
    await onConfirm()
    setIsRemoving(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl shadow-2xl max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 text-center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-100 to-red-50 flex items-center justify-center mx-auto mb-5"
          >
            <AlertTriangle size={28} className="text-red-500" />
          </motion.div>

          <h2 className="text-xl font-bold text-neutral-900 mb-2">
            הסרת יוצר מהסוכנות
          </h2>

          <p className="text-neutral-600 mb-6">
            האם אתה בטוח שברצונך להסיר את <strong>{name}</strong> מהסוכנות?
            לא תוכל לראות את הנתונים שלו יותר.
          </p>

          <div className="flex gap-3">
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 py-2.5 bg-neutral-100 text-neutral-700 rounded-xl font-medium hover:bg-neutral-200 transition-colors"
            >
              ביטול
            </motion.button>
            <motion.button
              onClick={handleConfirm}
              disabled={isRemoving}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isRemoving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  מסיר...
                </>
              ) : (
                'הסר יוצר'
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
