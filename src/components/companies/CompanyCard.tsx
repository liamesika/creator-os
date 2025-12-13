'use client'

import { motion } from 'framer-motion'
import { Calendar, Archive } from 'lucide-react'
import {
  Company,
  BRAND_TYPE_PRESETS,
  PAYMENT_MODEL_LABELS,
  getContractStatus,
  getContractStatusLabel,
  getContractStatusColor,
  formatCurrency,
} from '@/types/company'
import { useCalendarStore } from '@/stores/calendarStore'
import { CATEGORY_PRESETS } from '@/types/calendar'

interface CompanyCardProps {
  company: Company
  onClick: () => void
  delay?: number
}

export default function CompanyCard({ company, onClick, delay = 0 }: CompanyCardProps) {
  const { getUpcomingEventsByCompany } = useCalendarStore()
  const nextEvents = getUpcomingEventsByCompany(company.id, 1)
  const nextEvent = nextEvents[0]

  const brandPreset = company.brandType ? BRAND_TYPE_PRESETS[company.brandType] : null
  const BrandIcon = brandPreset?.icon
  const contractStatus = getContractStatus(company.contract)
  const isArchived = company.status === 'ARCHIVED'

  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        w-full text-right bg-white rounded-2xl border border-neutral-100
        shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06)]
        hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.1)]
        transition-all duration-300 p-4 sm:p-5
        ${isArchived ? 'opacity-60' : ''}
      `}
    >
      <div className="flex items-start gap-3">
        {/* Brand icon */}
        <div className={`p-2.5 rounded-xl ${brandPreset?.bgColor || 'bg-neutral-100'} flex-shrink-0`}>
          {BrandIcon ? (
            <BrandIcon size={20} className={brandPreset?.color} strokeWidth={1.5} />
          ) : (
            <div className="w-5 h-5 rounded-full bg-neutral-300" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Company name and status */}
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-neutral-800 truncate">{company.name}</h3>
            {isArchived && (
              <span className="flex items-center gap-1 text-[10px] font-medium text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">
                <Archive size={10} />
                בארכיון
              </span>
            )}
          </div>

          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-1.5 mb-3">
            {/* Payment model badge */}
            <span className="text-[11px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              {PAYMENT_MODEL_LABELS[company.paymentTerms.paymentModel]}
            </span>

            {/* Contract status badge */}
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${getContractStatusColor(contractStatus)}`}>
              {getContractStatusLabel(contractStatus)}
            </span>

            {/* Amount badge if monthly */}
            {company.paymentTerms.paymentModel === 'MONTHLY' && company.paymentTerms.monthlyRetainerAmount && (
              <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                {formatCurrency(company.paymentTerms.monthlyRetainerAmount, company.paymentTerms.currency)}/חודש
              </span>
            )}
          </div>

          {/* Next event preview */}
          {nextEvent && (
            <div className="flex items-center gap-2 text-xs text-neutral-500 bg-neutral-50 rounded-lg px-2.5 py-2">
              <Calendar size={12} className="flex-shrink-0" />
              <span className="truncate">
                {nextEvent.title}
              </span>
              <span className="text-neutral-400 flex-shrink-0">
                {new Date(nextEvent.date).toLocaleDateString('he-IL', { day: 'numeric', month: 'short' })}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.button>
  )
}
