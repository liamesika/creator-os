'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  ChevronLeft,
  Edit3,
  Archive,
  Trash2,
  RotateCcw,
  FileText,
  ExternalLink,
  Calendar,
  CreditCard,
  Phone,
  Mail,
  User,
  Plus,
  Clock,
  Building2,
} from 'lucide-react'
import {
  Company,
  BRAND_TYPE_PRESETS,
  PAYMENT_MODEL_LABELS,
  PAYMENT_CYCLE_OPTIONS,
  CURRENCY_OPTIONS,
  getContractStatus,
  getContractStatusLabel,
  getContractStatusColor,
  formatCurrency,
} from '@/types/company'
import { CATEGORY_PRESETS } from '@/types/calendar'
import { useCompaniesStore } from '@/stores/companiesStore'
import { useCalendarStore } from '@/stores/calendarStore'
import { useTasksStore } from '@/stores/tasksStore'
import { toast } from 'sonner'

interface CompanyProfileDrawerProps {
  isOpen: boolean
  onClose: () => void
  company: Company | null
}

export default function CompanyProfileDrawer({
  isOpen,
  onClose,
  company,
}: CompanyProfileDrawerProps) {
  const {
    openCreateModal,
    archiveCompany,
    restoreCompany,
    deleteCompany,
    closeProfileDrawer,
  } = useCompaniesStore()
  const { getUpcomingEventsByCompany, openCreateModal: openEventModal } = useCalendarStore()
  const { openCreateModal: openTaskModal } = useTasksStore()

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  if (!company) return null

  const brandPreset = company.brandType ? BRAND_TYPE_PRESETS[company.brandType] : null
  const BrandIcon = brandPreset?.icon || Building2
  const contractStatus = getContractStatus(company.contract)
  const upcomingEvents = getUpcomingEventsByCompany(company.id, 5)
  const isArchived = company.status === 'ARCHIVED'

  const handleEdit = () => {
    closeProfileDrawer()
    openCreateModal(company)
  }

  const handleArchive = () => {
    archiveCompany(company.id)
  }

  const handleRestore = () => {
    restoreCompany(company.id)
  }

  const handleDelete = () => {
    deleteCompany(company.id)
    setShowDeleteConfirm(false)
    onClose()
  }

  const handleAddEvent = () => {
    onClose()
    openEventModal()
    // The company will be selected in the modal
  }

  const handleAddTask = () => {
    openTaskModal({
      title: `משימה עבור ${company.name}`,
      companyId: company.id,
      companyNameSnapshot: company.name,
      priority: 'MEDIUM',
      status: 'TODO',
    })
    onClose()
    toast.success('נפתח טופס משימה חדשה')
  }

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('he-IL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const getPaymentCycleLabel = (cycle?: string): string => {
    if (!cycle) return ''
    return PAYMENT_CYCLE_OPTIONS.find((o) => o.value === cycle)?.label || cycle
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
          />

          {/* Drawer - full screen on mobile */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 left-0 w-full sm:w-[420px] bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className={`${brandPreset?.bgColor || 'bg-neutral-100'} px-5 py-6`}>
              <div className="flex items-start justify-between mb-4">
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <ChevronLeft size={20} className={brandPreset?.color || 'text-neutral-600'} />
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleEdit}
                    className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                  >
                    <Edit3 size={18} className={brandPreset?.color || 'text-neutral-600'} />
                  </button>
                  {isArchived ? (
                    <button
                      onClick={handleRestore}
                      className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                    >
                      <RotateCcw size={18} className="text-emerald-600" />
                    </button>
                  ) : (
                    <button
                      onClick={handleArchive}
                      className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                    >
                      <Archive size={18} className="text-amber-600" />
                    </button>
                  )}
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                  >
                    <Trash2 size={18} className="text-red-500" />
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-3 rounded-xl bg-white/60">
                  <BrandIcon size={28} className={brandPreset?.color || 'text-neutral-600'} strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-bold text-neutral-800 truncate">{company.name}</h2>
                    {isArchived && (
                      <span className="text-[10px] font-medium text-neutral-500 bg-white/60 px-1.5 py-0.5 rounded">
                        בארכיון
                      </span>
                    )}
                  </div>
                  {brandPreset && (
                    <span className={`text-sm ${brandPreset.color}`}>{brandPreset.label}</span>
                  )}
                </div>
              </div>

              {/* Quick badges */}
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="text-xs font-medium text-blue-700 bg-blue-100/80 px-2.5 py-1 rounded-full">
                  {PAYMENT_MODEL_LABELS[company.paymentTerms.paymentModel]}
                </span>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getContractStatusColor(contractStatus)}`}>
                  {getContractStatusLabel(contractStatus)}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Contact info */}
              {(company.contactName || company.contactEmail || company.contactPhone) && (
                <div className="px-5 py-4 border-b border-neutral-100">
                  <h3 className="text-sm font-semibold text-neutral-700 mb-3 flex items-center gap-2">
                    <User size={16} className="text-neutral-400" />
                    פרטי קשר
                  </h3>
                  <div className="space-y-2">
                    {company.contactName && (
                      <p className="text-sm text-neutral-600">{company.contactName}</p>
                    )}
                    {company.contactEmail && (
                      <a
                        href={`mailto:${company.contactEmail}`}
                        className="flex items-center gap-2 text-sm text-accent-600 hover:text-accent-700"
                      >
                        <Mail size={14} />
                        <span dir="ltr">{company.contactEmail}</span>
                      </a>
                    )}
                    {company.contactPhone && (
                      <a
                        href={`tel:${company.contactPhone}`}
                        className="flex items-center gap-2 text-sm text-accent-600 hover:text-accent-700"
                      >
                        <Phone size={14} />
                        <span dir="ltr">{company.contactPhone}</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Payment Overview */}
              <div className="px-5 py-4 border-b border-neutral-100">
                <h3 className="text-sm font-semibold text-neutral-700 mb-3 flex items-center gap-2">
                  <CreditCard size={16} className="text-neutral-400" />
                  פרטי תשלום
                </h3>
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-neutral-600">מודל תשלום</span>
                    <span className="text-sm font-medium text-neutral-800">
                      {PAYMENT_MODEL_LABELS[company.paymentTerms.paymentModel]}
                    </span>
                  </div>

                  {company.paymentTerms.monthlyRetainerAmount && (
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-neutral-600">סכום חודשי</span>
                      <span className="text-lg font-bold text-emerald-600">
                        {formatCurrency(company.paymentTerms.monthlyRetainerAmount, company.paymentTerms.currency)}
                      </span>
                    </div>
                  )}

                  {company.paymentTerms.perPurchaseAmount && (
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-neutral-600">סכום לרכישה</span>
                      <span className="text-lg font-bold text-emerald-600">
                        {formatCurrency(company.paymentTerms.perPurchaseAmount, company.paymentTerms.currency)}
                      </span>
                    </div>
                  )}

                  {company.paymentTerms.perProjectAmount && (
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-neutral-600">סכום לפרויקט</span>
                      <span className="text-lg font-bold text-emerald-600">
                        {formatCurrency(company.paymentTerms.perProjectAmount, company.paymentTerms.currency)}
                      </span>
                    </div>
                  )}

                  {company.paymentTerms.hourlyRate && (
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-neutral-600">תעריף לשעה</span>
                      <span className="text-lg font-bold text-emerald-600">
                        {formatCurrency(company.paymentTerms.hourlyRate, company.paymentTerms.currency)}
                      </span>
                    </div>
                  )}

                  {company.paymentTerms.paymentCycle && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-600">מחזור תשלום</span>
                      <span className="text-sm font-medium text-neutral-800">
                        {getPaymentCycleLabel(company.paymentTerms.paymentCycle)}
                      </span>
                    </div>
                  )}

                  {company.paymentTerms.invoicingNotes && (
                    <p className="text-xs text-neutral-500 mt-3 pt-3 border-t border-emerald-200">
                      {company.paymentTerms.invoicingNotes}
                    </p>
                  )}
                </div>
              </div>

              {/* Contract */}
              <div className="px-5 py-4 border-b border-neutral-100">
                <h3 className="text-sm font-semibold text-neutral-700 mb-3 flex items-center gap-2">
                  <FileText size={16} className="text-neutral-400" />
                  חוזה
                </h3>

                {company.contract.contractType === 'NONE' ? (
                  <p className="text-sm text-neutral-500">אין חוזה מקושר</p>
                ) : (
                  <div className="space-y-3">
                    {/* Contract status badge */}
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${getContractStatusColor(contractStatus)}`}>
                      <span className="text-sm font-medium">{getContractStatusLabel(contractStatus)}</span>
                    </div>

                    {/* Contract content */}
                    {company.contract.contractType === 'FILE' && company.contract.contractFileMeta && (
                      <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl">
                        <FileText size={20} className="text-neutral-400" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-700 truncate">
                            {company.contract.contractFileMeta.name}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {(company.contract.contractFileMeta.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                    )}

                    {company.contract.contractType === 'LINK' && company.contract.contractLink && (
                      <a
                        href={company.contract.contractLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-accent-600 hover:text-accent-700"
                      >
                        <ExternalLink size={14} />
                        פתח קישור לחוזה
                      </a>
                    )}

                    {company.contract.contractType === 'TEXT' && company.contract.contractText && (
                      <div className="p-3 bg-neutral-50 rounded-xl">
                        <p className="text-sm text-neutral-600 whitespace-pre-wrap">
                          {company.contract.contractText}
                        </p>
                      </div>
                    )}

                    {/* Validity dates */}
                    {(company.contract.contractValidFrom || company.contract.contractValidUntil) && (
                      <div className="flex items-center gap-4 text-xs text-neutral-500">
                        {company.contract.contractValidFrom && (
                          <span>מתאריך: {formatDate(company.contract.contractValidFrom)}</span>
                        )}
                        {company.contract.contractValidUntil && (
                          <span>עד: {formatDate(company.contract.contractValidUntil)}</span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="px-5 py-4 border-b border-neutral-100">
                <div className="flex gap-2">
                  <button
                    onClick={handleAddEvent}
                    className="flex-1 px-4 py-2.5 bg-accent-50 text-accent-700 rounded-xl font-medium text-sm hover:bg-accent-100 transition-all flex items-center justify-center gap-2"
                  >
                    <Calendar size={16} />
                    הוסף אירוע
                  </button>
                  <button
                    onClick={handleAddTask}
                    className="flex-1 px-4 py-2.5 bg-blue-50 text-blue-700 rounded-xl font-medium text-sm hover:bg-blue-100 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus size={16} />
                    צור משימה
                  </button>
                </div>
              </div>

              {/* Linked Events */}
              <div className="px-5 py-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
                    <Calendar size={16} className="text-neutral-400" />
                    אירועים קרובים
                  </h3>
                </div>

                {upcomingEvents.length === 0 ? (
                  <p className="text-sm text-neutral-500">אין אירועים מתוכננים</p>
                ) : (
                  <div className="space-y-2">
                    {upcomingEvents.map((event) => {
                      const categoryPreset = CATEGORY_PRESETS[event.category]
                      const CategoryIcon = categoryPreset.icon

                      return (
                        <div
                          key={event.id}
                          className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl"
                        >
                          <div className={`p-2 rounded-lg ${categoryPreset.bgColor}`}>
                            <CategoryIcon size={16} className={categoryPreset.color} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-neutral-700 truncate">
                              {event.title}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-neutral-500">
                              <Clock size={12} />
                              <span>
                                {formatDate(event.date)} | {event.startTime}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Notes */}
              {company.notes && (
                <div className="px-5 py-4 border-t border-neutral-100">
                  <h3 className="text-sm font-semibold text-neutral-700 mb-2">הערות</h3>
                  <p className="text-sm text-neutral-600 whitespace-pre-wrap">{company.notes}</p>
                </div>
              )}
            </div>

            {/* Delete confirmation */}
            <AnimatePresence>
              {showDeleteConfirm && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute inset-x-0 bottom-0 bg-white border-t border-neutral-200 p-5 shadow-lg"
                >
                  <p className="text-sm text-neutral-700 mb-4 text-center">
                    האם למחוק את החברה &quot;{company.name}&quot;?
                    <br />
                    <span className="text-xs text-neutral-500">פעולה זו אינה ניתנת לביטול</span>
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 px-4 py-2.5 text-sm font-medium text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors"
                    >
                      ביטול
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors"
                    >
                      מחיקה
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
