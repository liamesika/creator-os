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
  Check,
  Clock,
  X,
  Loader2,
  AlertTriangle,
  Copy,
  ExternalLink,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import PremiumCard from '@/components/app/PremiumCard'
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
  const [members, setMembers] = useState<MemberWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [memberToRemove, setMemberToRemove] = useState<MemberWithDetails | null>(null)

  useEffect(() => {
    if (user?.accountType !== 'agency') {
      router.push('/dashboard')
      return
    }
    loadMembers()
  }, [user, router])

  const loadMembers = async () => {
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
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={32} className="text-accent-600 animate-spin" />
          <p className="text-sm text-neutral-500 text-center">טוען חברי הסוכנות...</p>
        </div>
      </div>
    )
  }

  if (user?.accountType !== 'agency') {
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
            className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 mb-4"
          >
            <ChevronRight size={16} />
            חזרה לדשבורד
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-center sm:text-right">
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
                ניהול יוצרים
              </h1>
              <p className="text-neutral-500 text-sm mt-1">
                {activeMembers.length} מתוך {MAX_CREATORS_PER_AGENCY} יוצרים
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowInviteModal(true)}
              disabled={activeMembers.length >= MAX_CREATORS_PER_AGENCY}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-accent-600 text-white rounded-xl text-sm font-medium shadow-lg shadow-accent-600/20 hover:bg-accent-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UserPlus size={16} strokeWidth={2.5} />
              <span>הזמן יוצר</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Capacity Warning */}
        {activeMembers.length >= MAX_CREATORS_PER_AGENCY && (
          <motion.div variants={itemVariants} className="mb-6">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-center sm:text-right">
                  <p className="font-medium text-amber-800">
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

        {/* Active Members */}
        <motion.div variants={itemVariants} className="mb-6">
          <PremiumCard delay={0.2}>
            <div className="p-5 sm:p-6">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                  <Users size={18} className="text-blue-600" strokeWidth={2} />
                </div>
                <div className="text-center">
                  <h2 className="font-semibold text-neutral-900">יוצרים פעילים</h2>
                  <p className="text-xs text-neutral-400">{activeMembers.length} יוצרים</p>
                </div>
              </div>

              {activeMembers.length === 0 ? (
                <div className="text-center py-8">
                  <Users size={48} className="text-neutral-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-neutral-900 mb-2 text-center">
                    עדיין אין יוצרים
                  </h3>
                  <p className="text-neutral-600 mb-6 text-center">
                    הזמן יוצרים לסוכנות שלך כדי להתחיל לנהל אותם
                  </p>
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-accent-600 text-white rounded-xl font-bold hover:bg-accent-700 transition-colors"
                  >
                    <UserPlus size={20} />
                    הזמן יוצר ראשון
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeMembers.map((member, index) => (
                    <MemberRow
                      key={member.id}
                      member={member}
                      index={index}
                      onRemove={() => setMemberToRemove(member)}
                    />
                  ))}
                </div>
              )}
            </div>
          </PremiumCard>
        </motion.div>

        {/* Removed Members */}
        {removedMembers.length > 0 && (
          <motion.div variants={itemVariants}>
            <PremiumCard delay={0.3}>
              <div className="p-5 sm:p-6">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neutral-100 to-neutral-50 flex items-center justify-center">
                    <UserMinus size={18} className="text-neutral-500" strokeWidth={2} />
                  </div>
                  <div className="text-center">
                    <h2 className="font-semibold text-neutral-700">יוצרים שהוסרו</h2>
                    <p className="text-xs text-neutral-400">{removedMembers.length} יוצרים</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {removedMembers.map((member, index) => (
                    <MemberRow
                      key={member.id}
                      member={member}
                      index={index}
                      isRemoved
                    />
                  ))}
                </div>
              </div>
            </PremiumCard>
          </motion.div>
        )}
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

interface MemberRowProps {
  member: MemberWithDetails
  index: number
  isRemoved?: boolean
  onRemove?: () => void
}

function MemberRow({ member, index, isRemoved, onRemove }: MemberRowProps) {
  const name = member.creator?.name || member.inviteEmail?.split('@')[0] || 'יוצר'
  const email = member.creator?.email || member.inviteEmail || ''
  const statusConfig = STATUS_CONFIGS[member.status]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index }}
      className={`flex items-center justify-between p-4 rounded-xl ${
        isRemoved ? 'bg-neutral-50/50' : 'bg-neutral-50 hover:bg-neutral-100'
      } transition-colors`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          isRemoved
            ? 'bg-neutral-200'
            : 'bg-gradient-to-br from-accent-100 to-violet-100'
        }`}>
          <span className={`text-sm font-bold ${isRemoved ? 'text-neutral-500' : 'text-accent-700'}`}>
            {name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="text-center sm:text-right">
          <p className={`font-medium ${isRemoved ? 'text-neutral-500' : 'text-neutral-900'}`}>
            {name}
          </p>
          <div className="flex items-center gap-2">
            <p className="text-xs text-neutral-500">{email}</p>
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${statusConfig.bgColor} ${statusConfig.color}`}>
              {statusConfig.label}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {member.status === 'active' && member.creator && (
          <Link href={`/agency/creators/${member.creator.id}`}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <ExternalLink size={16} className="text-accent-600" />
            </motion.button>
          </Link>
        )}

        {!isRemoved && onRemove && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRemove}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
          >
            <UserMinus size={16} className="text-red-500" />
          </motion.button>
        )}
      </div>
    </motion.div>
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
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-neutral-900 text-center flex-1">
              הזמנת יוצר חדש
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-neutral-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5 text-center">
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
                  className="w-full pl-4 pr-10 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 text-center"
                  dir="ltr"
                />
              </div>
              <p className="text-xs text-neutral-500 mt-2 text-center">
                אם היוצר כבר רשום במערכת, הוא יתווסף אוטומטית.
                אחרת, הוא יקבל הזמנה להצטרף.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !email}
              className="w-full py-3 bg-accent-600 text-white rounded-xl font-semibold hover:bg-accent-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
            </button>
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
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-xl max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={32} className="text-red-500" />
          </div>

          <h2 className="text-xl font-bold text-neutral-900 mb-2">
            הסרת יוצר מהסוכנות
          </h2>

          <p className="text-neutral-600 mb-6">
            האם אתה בטוח שברצונך להסיר את <strong>{name}</strong> מהסוכנות?
            לא תוכל לראות את הנתונים שלו יותר.
          </p>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 bg-neutral-100 text-neutral-700 rounded-xl font-medium hover:bg-neutral-200 transition-colors"
            >
              ביטול
            </button>
            <button
              onClick={handleConfirm}
              disabled={isRemoving}
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
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
