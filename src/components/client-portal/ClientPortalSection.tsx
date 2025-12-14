'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Globe,
  Copy,
  RefreshCw,
  ExternalLink,
  Check,
  X,
  Loader2,
  Shield,
} from 'lucide-react'
import { toast } from 'sonner'
import type { ClientPortal } from '@/types/client-portal'

interface ClientPortalSectionProps {
  companyId: string
  companyName: string
}

export default function ClientPortalSection({ companyId, companyName }: ClientPortalSectionProps) {
  const [portal, setPortal] = useState<ClientPortal | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [rotating, setRotating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showRotateConfirm, setShowRotateConfirm] = useState(false)

  const fetchPortal = async () => {
    try {
      const res = await fetch(`/api/companies/${companyId}/portal`)
      const data = await res.json()
      if (data.portal) {
        setPortal(data.portal)
      }
    } catch (error) {
      console.error('Error fetching portal:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPortal()
  }, [companyId])

  const handleCreatePortal = async () => {
    setCreating(true)
    try {
      const res = await fetch('/api/client-portal/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          brandName: companyName,
        }),
      })

      const data = await res.json()
      if (res.ok && data.portal) {
        setPortal({
          id: data.portal.id,
          creatorUserId: data.portal.creator_user_id,
          companyId: data.portal.company_id,
          token: data.portal.token,
          isEnabled: data.portal.is_enabled,
          brandName: data.portal.brand_name,
          brandColor: data.portal.brand_color,
          createdAt: data.portal.created_at,
        })
        toast.success('פורטל לקוח נוצר בהצלחה')
      } else {
        toast.error(data.error || 'שגיאה ביצירת פורטל')
      }
    } catch (error) {
      toast.error('שגיאה ביצירת פורטל')
    } finally {
      setCreating(false)
    }
  }

  const handleTogglePortal = async () => {
    if (!portal) return

    try {
      const res = await fetch(`/api/companies/${companyId}/portal`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isEnabled: !portal.isEnabled }),
      })

      if (res.ok) {
        setPortal(prev => prev ? { ...prev, isEnabled: !prev.isEnabled } : null)
        toast.success(portal.isEnabled ? 'פורטל כובה' : 'פורטל הופעל')
      }
    } catch (error) {
      toast.error('שגיאה בעדכון פורטל')
    }
  }

  const handleRotateToken = async () => {
    if (!portal) return

    setRotating(true)
    try {
      const res = await fetch('/api/client-portal/rotate-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId }),
      })

      const data = await res.json()
      if (res.ok && data.portal) {
        setPortal(prev => prev ? { ...prev, token: data.portal.token } : null)
        toast.success('הטוקן רוענן - הקישור הישן לא יעבוד יותר')
        setShowRotateConfirm(false)
      } else {
        toast.error(data.error || 'שגיאה ברענון טוקן')
      }
    } catch (error) {
      toast.error('שגיאה ברענון טוקן')
    } finally {
      setRotating(false)
    }
  }

  const handleCopyLink = () => {
    if (!portal) return
    const link = `${window.location.origin}/portal/${portal.token}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    toast.success('הקישור הועתק!')
    setTimeout(() => setCopied(false), 2000)
  }

  const portalLink = portal ? `${typeof window !== 'undefined' ? window.location.origin : ''}/portal/${portal.token}` : ''

  if (loading) {
    return (
      <div className="px-5 py-4 border-b border-neutral-100">
        <div className="flex items-center justify-center py-4">
          <Loader2 size={20} className="animate-spin text-neutral-400" />
        </div>
      </div>
    )
  }

  return (
    <div className="px-5 py-4 border-b border-neutral-100">
      <h3 className="text-sm font-semibold text-neutral-700 mb-3 flex items-center gap-2">
        <Globe size={16} className="text-neutral-400" />
        פורטל לקוח
      </h3>

      {!portal ? (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCreatePortal}
          disabled={creating}
          className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium rounded-xl shadow-lg shadow-violet-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {creating ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              יוצר פורטל...
            </>
          ) : (
            <>
              <Globe size={18} />
              צור פורטל לקוח
            </>
          )}
        </motion.button>
      ) : (
        <div className="space-y-3">
          {/* Status toggle */}
          <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${portal.isEnabled ? 'bg-emerald-500' : 'bg-neutral-300'}`} />
              <span className="text-sm text-neutral-700">
                {portal.isEnabled ? 'פורטל פעיל' : 'פורטל כבוי'}
              </span>
            </div>
            <button
              onClick={handleTogglePortal}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                portal.isEnabled ? 'bg-emerald-500' : 'bg-neutral-300'
              }`}
            >
              <motion.div
                animate={{ x: portal.isEnabled ? 24 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute top-0.5 right-0.5 w-5 h-5 bg-white rounded-full shadow-sm"
              />
            </button>
          </div>

          {/* Portal link */}
          <div className="p-3 bg-violet-50 rounded-xl border border-violet-100">
            <p className="text-xs text-violet-600 font-medium mb-2 text-center">קישור לפורטל</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={portalLink}
                readOnly
                className="flex-1 bg-white border border-violet-200 rounded-lg px-3 py-2 text-xs text-neutral-600 truncate text-center"
                dir="ltr"
              />
              <button
                onClick={handleCopyLink}
                className="p-2 bg-white border border-violet-200 rounded-lg hover:bg-violet-100 transition-colors"
              >
                {copied ? (
                  <Check size={16} className="text-emerald-600" />
                ) : (
                  <Copy size={16} className="text-violet-600" />
                )}
              </button>
              <a
                href={portalLink}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white border border-violet-200 rounded-lg hover:bg-violet-100 transition-colors"
              >
                <ExternalLink size={16} className="text-violet-600" />
              </a>
            </div>
          </div>

          {/* Security: Rotate token */}
          <button
            onClick={() => setShowRotateConfirm(true)}
            className="w-full flex items-center justify-center gap-2 p-2 text-sm text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
          >
            <Shield size={14} />
            רענן קישור (ביטול קישור קודם)
          </button>

          {/* Rotate confirmation */}
          <AnimatePresence>
            {showRotateConfirm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 bg-amber-50 border border-amber-200 rounded-xl"
              >
                <p className="text-xs text-amber-700 mb-3 text-center">
                  רענון הקישור יבטל את הקישור הקודם.
                  <br />
                  הלקוח יצטרך לקבל קישור חדש.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowRotateConfirm(false)}
                    className="flex-1 px-3 py-2 text-xs font-medium text-neutral-600 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50"
                  >
                    ביטול
                  </button>
                  <button
                    onClick={handleRotateToken}
                    disabled={rotating}
                    className="flex-1 px-3 py-2 text-xs font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 disabled:opacity-50 flex items-center justify-center gap-1"
                  >
                    {rotating ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <RefreshCw size={14} />
                    )}
                    רענן
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
