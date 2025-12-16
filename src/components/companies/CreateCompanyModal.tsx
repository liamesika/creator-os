'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  ChevronLeft,
  ChevronRight,
  Building2,
  Store,
  User,
  FileText,
  Link as LinkIcon,
  FileUp,
  CreditCard,
  Check,
  Upload,
  Calendar,
  AlertCircle,
} from 'lucide-react'
import {
  Company,
  BrandType,
  ContractType,
  PaymentModel,
  BRAND_TYPE_PRESETS,
  PAYMENT_MODEL_LABELS,
  PAYMENT_CYCLE_OPTIONS,
  CURRENCY_OPTIONS,
  createDefaultCompany,
  getContractStatus,
} from '@/types/company'
import { useCompaniesStore } from '@/stores/companiesStore'

interface CreateCompanyModalProps {
  isOpen: boolean
  onClose: () => void
  editingCompany: Company | null
}

type Step = 1 | 2 | 3 | 4

const STEPS = [
  { number: 1, title: 'פרטים בסיסיים', icon: Building2 },
  { number: 2, title: 'חוזה', icon: FileText },
  { number: 3, title: 'תנאי תשלום', icon: CreditCard },
  { number: 4, title: 'סיכום', icon: Check },
]

export default function CreateCompanyModal({
  isOpen,
  onClose,
  editingCompany,
}: CreateCompanyModalProps) {
  const { createCompany, updateCompany } = useCompaniesStore()

  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [formData, setFormData] = useState(createDefaultCompany())
  const [errors, setErrors] = useState<Record<string, string>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isEditing = !!editingCompany

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1)
      setErrors({})
      if (editingCompany) {
        setFormData({
          name: editingCompany.name,
          brandType: editingCompany.brandType,
          contactName: editingCompany.contactName,
          contactEmail: editingCompany.contactEmail,
          contactPhone: editingCompany.contactPhone,
          notes: editingCompany.notes,
          contract: { ...editingCompany.contract },
          paymentTerms: { ...editingCompany.paymentTerms },
          status: editingCompany.status,
        })
      } else {
        setFormData(createDefaultCompany())
      }
    }
  }, [isOpen, editingCompany])

  const validateStep = (step: Step): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!formData.name.trim()) {
        newErrors.name = 'שם החברה הוא שדה חובה'
      }
      if (formData.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
        newErrors.contactEmail = 'כתובת אימייל לא תקינה'
      }
    }

    if (step === 2) {
      if (formData.contract.contractType === 'LINK' && !formData.contract.contractLink) {
        newErrors.contractLink = 'נדרש קישור לחוזה'
      }
      if (formData.contract.contractType === 'TEXT' && !formData.contract.contractText) {
        newErrors.contractText = 'נדרש תוכן החוזה'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 4) {
        setCurrentStep((prev) => (prev + 1) as Step)
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step)
    }
  }

  const handleSubmit = () => {
    if (isEditing && editingCompany) {
      updateCompany(editingCompany.id, formData)
    } else {
      createCompany(formData)
    }
    onClose()
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setFormData((prev) => ({
          ...prev,
          contract: {
            ...prev.contract,
            contractType: 'FILE',
            contractFileMeta: {
              name: file.name,
              size: file.size,
              uploadedAt: new Date(),
              data: reader.result as string,
            },
          },
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...updates }))
  }

  const updateContract = (updates: Partial<typeof formData.contract>) => {
    setFormData((prev) => ({
      ...prev,
      contract: { ...prev.contract, ...updates },
    }))
  }

  const updatePaymentTerms = (updates: Partial<typeof formData.paymentTerms>) => {
    setFormData((prev) => ({
      ...prev,
      paymentTerms: { ...prev.paymentTerms, ...updates },
    }))
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {/* Company name */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                שם החברה / מותג *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => updateFormData({ name: e.target.value })}
                placeholder="לדוגמה: פוקס אופנה"
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all ${
                  errors.name ? 'border-red-300 bg-red-50' : 'border-neutral-200'
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Brand type */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                סוג
              </label>
              <div className="grid grid-cols-3 gap-2">
                {Object.values(BRAND_TYPE_PRESETS).map((preset) => {
                  const Icon = preset.icon
                  const isSelected = formData.brandType === preset.id
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => updateFormData({ brandType: preset.id })}
                      className={`
                        flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all
                        ${isSelected
                          ? `${preset.bgColor} border-current ${preset.color}`
                          : 'border-neutral-200 hover:border-neutral-300'
                        }
                      `}
                    >
                      <Icon size={24} strokeWidth={1.5} />
                      <span className="text-sm font-medium">{preset.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Contact info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  איש קשר
                </label>
                <input
                  type="text"
                  value={formData.contactName || ''}
                  onChange={(e) => updateFormData({ contactName: e.target.value })}
                  placeholder="שם מלא"
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  טלפון
                </label>
                <input
                  type="tel"
                  value={formData.contactPhone || ''}
                  onChange={(e) => updateFormData({ contactPhone: e.target.value })}
                  placeholder="050-0000000"
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                אימייל
              </label>
              <input
                type="email"
                value={formData.contactEmail || ''}
                onChange={(e) => updateFormData({ contactEmail: e.target.value })}
                placeholder="email@company.com"
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 ${
                  errors.contactEmail ? 'border-red-300 bg-red-50' : 'border-neutral-200'
                }`}
                dir="ltr"
              />
              {errors.contactEmail && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {errors.contactEmail}
                </p>
              )}
            </div>
          </motion.div>
        )

      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {/* Contract type */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                סוג חוזה
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { type: 'NONE' as ContractType, label: 'אין חוזה', icon: X },
                  { type: 'FILE' as ContractType, label: 'קובץ', icon: FileUp },
                  { type: 'LINK' as ContractType, label: 'קישור', icon: LinkIcon },
                  { type: 'TEXT' as ContractType, label: 'טקסט', icon: FileText },
                ].map(({ type, label, icon: Icon }) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => updateContract({ contractType: type })}
                    className={`
                      flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-right
                      ${formData.contract.contractType === type
                        ? 'border-accent-500 bg-accent-50 text-accent-700'
                        : 'border-neutral-200 hover:border-neutral-300'
                      }
                    `}
                  >
                    <Icon size={20} strokeWidth={1.5} />
                    <span className="font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Contract content based on type */}
            {formData.contract.contractType === 'FILE' && (
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                />
                {formData.contract.contractFileMeta ? (
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <FileText size={24} className="text-emerald-600" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-emerald-700 truncate">
                        {formData.contract.contractFileMeta.name}
                      </p>
                      <p className="text-xs text-emerald-600">
                        {(formData.contract.contractFileMeta.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-sm text-emerald-600 hover:text-emerald-700"
                    >
                      החלף
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex flex-col items-center gap-2 p-8 border-2 border-dashed border-neutral-300 rounded-xl hover:border-accent-400 hover:bg-accent-50/50 transition-all"
                  >
                    <Upload size={32} className="text-neutral-400" />
                    <span className="text-sm text-neutral-600">לחצי להעלאת קובץ</span>
                    <span className="text-xs text-neutral-400">PDF, DOC, DOCX</span>
                  </button>
                )}
              </div>
            )}

            {formData.contract.contractType === 'LINK' && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  קישור לחוזה
                </label>
                <input
                  type="url"
                  value={formData.contract.contractLink || ''}
                  onChange={(e) => updateContract({ contractLink: e.target.value })}
                  placeholder="https://..."
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 ${
                    errors.contractLink ? 'border-red-300 bg-red-50' : 'border-neutral-200'
                  }`}
                  dir="ltr"
                />
                {errors.contractLink && (
                  <p className="mt-1 text-xs text-red-500">{errors.contractLink}</p>
                )}
              </div>
            )}

            {formData.contract.contractType === 'TEXT' && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  תוכן החוזה
                </label>
                <textarea
                  value={formData.contract.contractText || ''}
                  onChange={(e) => updateContract({ contractText: e.target.value })}
                  placeholder="פרטי ההסכם..."
                  rows={4}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 resize-none ${
                    errors.contractText ? 'border-red-300 bg-red-50' : 'border-neutral-200'
                  }`}
                />
                {errors.contractText && (
                  <p className="mt-1 text-xs text-red-500">{errors.contractText}</p>
                )}
              </div>
            )}

            {/* Contract validity dates */}
            {formData.contract.contractType !== 'NONE' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    <Calendar size={14} className="inline ml-1" />
                    תוקף מתאריך
                  </label>
                  <input
                    type="date"
                    value={
                      formData.contract.contractValidFrom
                        ? new Date(formData.contract.contractValidFrom).toISOString().split('T')[0]
                        : ''
                    }
                    onChange={(e) =>
                      updateContract({
                        contractValidFrom: e.target.value ? new Date(e.target.value) : undefined,
                      })
                    }
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    עד תאריך
                  </label>
                  <input
                    type="date"
                    value={
                      formData.contract.contractValidUntil
                        ? new Date(formData.contract.contractValidUntil).toISOString().split('T')[0]
                        : ''
                    }
                    onChange={(e) =>
                      updateContract({
                        contractValidUntil: e.target.value ? new Date(e.target.value) : undefined,
                      })
                    }
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500"
                  />
                </div>
              </div>
            )}

            {/* Expiring soon warning */}
            {formData.contract.contractValidUntil &&
              getContractStatus(formData.contract) === 'expiring' && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <AlertCircle size={18} className="text-amber-600" />
                  <span className="text-sm text-amber-700">החוזה יפוג בקרוב</span>
                </div>
              )}
          </motion.div>
        )

      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {/* Payment model */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                מודל תשלום
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(Object.entries(PAYMENT_MODEL_LABELS) as [PaymentModel, string][]).map(
                  ([model, label]) => (
                    <button
                      key={model}
                      type="button"
                      onClick={() => updatePaymentTerms({ paymentModel: model })}
                      className={`
                        p-3 rounded-xl border-2 text-sm font-medium transition-all
                        ${formData.paymentTerms.paymentModel === model
                          ? 'border-accent-500 bg-accent-50 text-accent-700'
                          : 'border-neutral-200 hover:border-neutral-300 text-neutral-600'
                        }
                      `}
                    >
                      {label}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Amount fields based on model */}
            {formData.paymentTerms.paymentModel === 'MONTHLY' && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  סכום חודשי
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={formData.paymentTerms.monthlyRetainerAmount || ''}
                    onChange={(e) =>
                      updatePaymentTerms({
                        monthlyRetainerAmount: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    placeholder="0"
                    className="flex-1 px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500"
                    dir="ltr"
                  />
                  <select
                    value={formData.paymentTerms.currency}
                    onChange={(e) => updatePaymentTerms({ currency: e.target.value })}
                    className="px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 bg-white"
                  >
                    {CURRENCY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {formData.paymentTerms.paymentModel === 'PER_PURCHASE' && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  סכום לרכישה
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={formData.paymentTerms.perPurchaseAmount || ''}
                    onChange={(e) =>
                      updatePaymentTerms({
                        perPurchaseAmount: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    placeholder="0"
                    className="flex-1 px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500"
                    dir="ltr"
                  />
                  <select
                    value={formData.paymentTerms.currency}
                    onChange={(e) => updatePaymentTerms({ currency: e.target.value })}
                    className="px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 bg-white"
                  >
                    {CURRENCY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {formData.paymentTerms.paymentModel === 'PER_PROJECT' && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  סכום לפרויקט
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={formData.paymentTerms.perProjectAmount || ''}
                    onChange={(e) =>
                      updatePaymentTerms({
                        perProjectAmount: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    placeholder="0"
                    className="flex-1 px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500"
                    dir="ltr"
                  />
                  <select
                    value={formData.paymentTerms.currency}
                    onChange={(e) => updatePaymentTerms({ currency: e.target.value })}
                    className="px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 bg-white"
                  >
                    {CURRENCY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {formData.paymentTerms.paymentModel === 'HOURLY' && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  תעריף לשעה
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={formData.paymentTerms.hourlyRate || ''}
                    onChange={(e) =>
                      updatePaymentTerms({
                        hourlyRate: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    placeholder="0"
                    className="flex-1 px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500"
                    dir="ltr"
                  />
                  <select
                    value={formData.paymentTerms.currency}
                    onChange={(e) => updatePaymentTerms({ currency: e.target.value })}
                    className="px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 bg-white"
                  >
                    {CURRENCY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Payment cycle */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                מחזור תשלום
              </label>
              <select
                value={formData.paymentTerms.paymentCycle || ''}
                onChange={(e) => updatePaymentTerms({ paymentCycle: e.target.value })}
                className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 bg-white"
              >
                <option value="">בחר...</option>
                {PAYMENT_CYCLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Invoicing notes */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                הערות לחשבונית
              </label>
              <textarea
                value={formData.paymentTerms.invoicingNotes || ''}
                onChange={(e) => updatePaymentTerms({ invoicingNotes: e.target.value })}
                placeholder="הערות נוספות לתשלום..."
                rows={2}
                className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 resize-none"
              />
            </div>
          </motion.div>
        )

      case 4:
        return (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {/* Summary card */}
            <div className="bg-gradient-to-br from-accent-50 to-blue-50 rounded-2xl p-5 border border-accent-100">
              <div className="flex items-center gap-3 mb-4">
                {formData.brandType && BRAND_TYPE_PRESETS[formData.brandType] && (
                  <div className={`p-2.5 rounded-xl ${BRAND_TYPE_PRESETS[formData.brandType].bgColor}`}>
                    {(() => {
                      const Icon = BRAND_TYPE_PRESETS[formData.brandType!].icon
                      return <Icon size={24} className={BRAND_TYPE_PRESETS[formData.brandType!].color} />
                    })()}
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-lg text-neutral-800">{formData.name || 'ללא שם'}</h3>
                  {formData.brandType && (
                    <span className="text-sm text-neutral-500">
                      {BRAND_TYPE_PRESETS[formData.brandType].label}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-3 text-sm">
                {formData.contactName && (
                  <div className="flex justify-between">
                    <span className="text-neutral-500">איש קשר</span>
                    <span className="text-neutral-700">{formData.contactName}</span>
                  </div>
                )}
                {formData.contactEmail && (
                  <div className="flex justify-between">
                    <span className="text-neutral-500">אימייל</span>
                    <span className="text-neutral-700" dir="ltr">{formData.contactEmail}</span>
                  </div>
                )}
                {formData.contactPhone && (
                  <div className="flex justify-between">
                    <span className="text-neutral-500">טלפון</span>
                    <span className="text-neutral-700" dir="ltr">{formData.contactPhone}</span>
                  </div>
                )}

                <div className="border-t border-accent-200 pt-3 mt-3">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">חוזה</span>
                    <span className="text-neutral-700">
                      {formData.contract.contractType === 'NONE'
                        ? 'אין חוזה'
                        : formData.contract.contractType === 'FILE'
                          ? formData.contract.contractFileMeta?.name || 'קובץ'
                          : formData.contract.contractType === 'LINK'
                            ? 'קישור'
                            : 'טקסט'}
                    </span>
                  </div>
                </div>

                <div className="border-t border-accent-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">מודל תשלום</span>
                    <span className="text-neutral-700">
                      {PAYMENT_MODEL_LABELS[formData.paymentTerms.paymentModel]}
                    </span>
                  </div>
                  {formData.paymentTerms.monthlyRetainerAmount && (
                    <div className="flex justify-between mt-1">
                      <span className="text-neutral-500">סכום חודשי</span>
                      <span className="text-emerald-600 font-medium">
                        {CURRENCY_OPTIONS.find((c) => c.value === formData.paymentTerms.currency)?.symbol}
                        {formData.paymentTerms.monthlyRetainerAmount.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                הערות כלליות
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => updateFormData({ notes: e.target.value })}
                placeholder="הערות נוספות על החברה..."
                rows={3}
                className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 resize-none"
              />
            </div>
          </motion.div>
        )
    }
  }

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.left = '0'
      document.body.style.right = '0'
      document.body.style.overflow = 'hidden'
    } else {
      const scrollY = document.body.style.top
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.left = ''
      document.body.style.right = ''
      document.body.style.overflow = ''
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1)
      }
    }

    return () => {
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.left = ''
      document.body.style.right = ''
      document.body.style.overflow = ''
    }
  }, [isOpen])

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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            aria-hidden="true"
          />

          {/* Modal Container - centers the modal */}
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
            style={{ height: '100dvh' }}
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, y: '100%', scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: '100%', scale: 0.95 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="create-company-title"
              className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[calc(100dvh-env(safe-area-inset-top))] sm:max-h-[calc(100dvh-48px)] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
              <h2 className="text-lg font-semibold text-neutral-800">
                {isEditing ? 'עריכת חברה' : 'חברה חדשה'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-neutral-100 rounded-xl transition-colors"
              >
                <X size={20} className="text-neutral-500" />
              </button>
            </div>

            {/* Step indicators */}
            <div className="px-5 py-3 border-b border-neutral-100">
              <div className="flex items-center justify-between">
                {STEPS.map((step, index) => {
                  const isActive = currentStep === step.number
                  const isCompleted = currentStep > step.number
                  const Icon = step.icon

                  return (
                    <div key={step.number} className="flex items-center">
                      <button
                        onClick={() => {
                          if (isCompleted || isActive) setCurrentStep(step.number as Step)
                        }}
                        disabled={!isCompleted && !isActive}
                        className={`
                          flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all
                          ${isActive
                            ? 'bg-accent-100 text-accent-700'
                            : isCompleted
                              ? 'text-accent-600 hover:bg-accent-50'
                              : 'text-neutral-400'
                          }
                        `}
                      >
                        <Icon size={16} />
                        <span className="text-xs font-medium hidden sm:inline">{step.title}</span>
                        <span className="text-xs font-medium sm:hidden">{step.number}</span>
                      </button>
                      {index < STEPS.length - 1 && (
                        <div
                          className={`w-4 sm:w-8 h-0.5 mx-1 ${
                            isCompleted ? 'bg-accent-400' : 'bg-neutral-200'
                          }`}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">
              <AnimatePresence mode="wait">{renderStepContent()}</AnimatePresence>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-neutral-100 bg-neutral-50/50">
              <button
                onClick={handleBack}
                disabled={currentStep === 1}
                className={`
                  flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-colors
                  ${currentStep === 1
                    ? 'text-neutral-300 cursor-not-allowed'
                    : 'text-neutral-600 hover:bg-neutral-100'
                  }
                `}
              >
                <ChevronRight size={18} />
                הקודם
              </button>

              {currentStep < 4 ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-accent-600 hover:bg-accent-700 rounded-xl shadow-lg shadow-accent-500/20 transition-colors"
                >
                  הבא
                  <ChevronLeft size={18} />
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-lg shadow-emerald-500/20 transition-colors"
                >
                  <Check size={18} />
                  {isEditing ? 'שמירה' : 'יצירת חברה'}
                </motion.button>
              )}
            </div>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
