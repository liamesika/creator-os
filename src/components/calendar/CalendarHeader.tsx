'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, Plus, Calendar, Building2, X, Check } from 'lucide-react'
import { CalendarView } from '@/types/calendar'
import { useCalendarStore } from '@/stores/calendarStore'
import { useCompaniesStore } from '@/stores/companiesStore'

interface CalendarHeaderProps {
  onCreateEvent: () => void
}

const HEBREW_MONTHS = [
  'ינואר',
  'פברואר',
  'מרץ',
  'אפריל',
  'מאי',
  'יוני',
  'יולי',
  'אוגוסט',
  'ספטמבר',
  'אוקטובר',
  'נובמבר',
  'דצמבר',
]

const VIEW_OPTIONS: { value: CalendarView; label: string }[] = [
  { value: 'month', label: 'חודש' },
  { value: 'week', label: 'שבוע' },
  { value: 'day', label: 'יום' },
]

export default function CalendarHeader({ onCreateEvent }: CalendarHeaderProps) {
  const { selectedDate, currentView, companyFilter, setSelectedDate, setCurrentView, setCompanyFilter } =
    useCalendarStore()
  const { companies } = useCompaniesStore()
  const [showCompanyFilter, setShowCompanyFilter] = useState(false)
  const filterRef = useRef<HTMLDivElement>(null)

  const activeCompanies = companies.filter((c) => c.status === 'ACTIVE')
  const selectedCompany = companyFilter
    ? companies.find((c) => c.id === companyFilter)
    : null

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowCompanyFilter(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const navigatePrev = () => {
    const newDate = new Date(selectedDate)
    if (currentView === 'month') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else if (currentView === 'week') {
      newDate.setDate(newDate.getDate() - 7)
    } else {
      newDate.setDate(newDate.getDate() - 1)
    }
    setSelectedDate(newDate)
  }

  const navigateNext = () => {
    const newDate = new Date(selectedDate)
    if (currentView === 'month') {
      newDate.setMonth(newDate.getMonth() + 1)
    } else if (currentView === 'week') {
      newDate.setDate(newDate.getDate() + 7)
    } else {
      newDate.setDate(newDate.getDate() + 1)
    }
    setSelectedDate(newDate)
  }

  const goToToday = () => {
    setSelectedDate(new Date())
  }

  const formatHeaderDate = (): string => {
    const month = HEBREW_MONTHS[selectedDate.getMonth()]
    const year = selectedDate.getFullYear()

    if (currentView === 'day') {
      return `${selectedDate.getDate()} ${month} ${year}`
    }

    return `${month} ${year}`
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
      <div className="flex items-center gap-3">
        {/* Navigation */}
        <div className="flex items-center gap-1">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={navigateNext}
            className="p-2 hover:bg-neutral-100 rounded-xl transition-colors"
          >
            <ChevronRight size={20} className="text-neutral-600" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={navigatePrev}
            className="p-2 hover:bg-neutral-100 rounded-xl transition-colors"
          >
            <ChevronLeft size={20} className="text-neutral-600" />
          </motion.button>
        </div>

        {/* Current date */}
        <h2 className="text-xl font-bold text-neutral-800">{formatHeaderDate()}</h2>

        {/* Today button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={goToToday}
          className="px-3 py-1.5 text-sm font-medium text-accent-600 hover:bg-accent-50 rounded-lg transition-colors"
        >
          היום
        </motion.button>
      </div>

      <div className="flex items-center gap-3">
        {/* Company filter - Desktop */}
        <div className="relative hidden sm:block" ref={filterRef}>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCompanyFilter(!showCompanyFilter)}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-xl transition-all text-sm
              ${companyFilter
                ? 'bg-violet-50 text-violet-700 border border-violet-200'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }
            `}
          >
            <Building2 size={16} />
            <span className="max-w-[120px] truncate">
              {selectedCompany?.name || 'כל החברות'}
            </span>
            {companyFilter && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setCompanyFilter(null)
                }}
                className="p-0.5 hover:bg-violet-200 rounded-full"
              >
                <X size={14} />
              </button>
            )}
          </motion.button>

          {/* Dropdown */}
          <AnimatePresence>
            {showCompanyFilter && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full mt-2 left-0 w-64 bg-white rounded-xl shadow-xl border border-neutral-100 z-50 overflow-hidden"
              >
                <div className="p-2 border-b border-neutral-100">
                  <p className="text-xs text-neutral-500 px-2">סינון לפי חברה</p>
                </div>
                <div className="max-h-64 overflow-y-auto p-2">
                  <button
                    onClick={() => {
                      setCompanyFilter(null)
                      setShowCompanyFilter(false)
                    }}
                    className={`
                      w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-right transition-colors
                      ${!companyFilter ? 'bg-violet-50 text-violet-700' : 'hover:bg-neutral-50'}
                    `}
                  >
                    <Building2 size={16} className="text-neutral-400" />
                    <span className="flex-1 text-sm">כל החברות</span>
                    {!companyFilter && <Check size={16} className="text-violet-600" />}
                  </button>
                  {activeCompanies.map((company) => (
                    <button
                      key={company.id}
                      onClick={() => {
                        setCompanyFilter(company.id)
                        setShowCompanyFilter(false)
                      }}
                      className={`
                        w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-right transition-colors
                        ${companyFilter === company.id ? 'bg-violet-50 text-violet-700' : 'hover:bg-neutral-50'}
                      `}
                    >
                      <Building2 size={16} className="text-violet-500" />
                      <span className="flex-1 text-sm truncate">{company.name}</span>
                      {companyFilter === company.id && <Check size={16} className="text-violet-600" />}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Company filter - Mobile */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCompanyFilter(true)}
          className={`
            sm:hidden p-2.5 rounded-xl transition-all
            ${companyFilter
              ? 'bg-violet-50 text-violet-600'
              : 'bg-neutral-100 text-neutral-500'
            }
          `}
        >
          <Building2 size={20} />
        </motion.button>

        {/* View switcher */}
        <div className="flex items-center bg-neutral-100 rounded-xl p-1">
          {VIEW_OPTIONS.map((option) => (
            <motion.button
              key={option.value}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentView(option.value)}
              className={`
                px-4 py-1.5 text-sm font-medium rounded-lg transition-all
                ${currentView === option.value
                  ? 'bg-white text-neutral-800 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-700'
                }
              `}
            >
              {option.label}
            </motion.button>
          ))}
        </div>

        {/* Create event button - Desktop */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onCreateEvent}
          className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-accent-600 hover:bg-accent-700 text-white text-sm font-medium rounded-xl shadow-lg shadow-accent-500/20 transition-colors"
        >
          <Plus size={18} strokeWidth={2.5} />
          אירוע חדש
        </motion.button>
      </div>

      {/* Mobile company filter bottom sheet */}
      <AnimatePresence>
        {showCompanyFilter && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCompanyFilter(false)}
              className="sm:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="sm:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[70vh] flex flex-col"
            >
              {/* Handle */}
              <div className="flex justify-center py-3">
                <div className="w-10 h-1 bg-neutral-200 rounded-full" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 pb-3 border-b border-neutral-100">
                <h3 className="text-lg font-bold text-neutral-800">סינון לפי חברה</h3>
                <button
                  onClick={() => setShowCompanyFilter(false)}
                  className="p-2 hover:bg-neutral-100 rounded-xl transition-colors"
                >
                  <X size={20} className="text-neutral-500" />
                </button>
              </div>

              {/* Companies list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                <button
                  onClick={() => {
                    setCompanyFilter(null)
                    setShowCompanyFilter(false)
                  }}
                  className={`
                    w-full flex items-center gap-3 p-4 rounded-xl transition-colors
                    ${!companyFilter ? 'bg-violet-50 border-2 border-violet-200' : 'bg-neutral-50 hover:bg-neutral-100'}
                  `}
                >
                  <div className="p-2 bg-neutral-200 rounded-lg">
                    <Building2 size={18} className="text-neutral-600" />
                  </div>
                  <span className="flex-1 text-right font-medium text-neutral-800">כל החברות</span>
                  {!companyFilter && <Check size={20} className="text-violet-600" />}
                </button>
                {activeCompanies.map((company) => (
                  <button
                    key={company.id}
                    onClick={() => {
                      setCompanyFilter(company.id)
                      setShowCompanyFilter(false)
                    }}
                    className={`
                      w-full flex items-center gap-3 p-4 rounded-xl transition-colors
                      ${companyFilter === company.id ? 'bg-violet-50 border-2 border-violet-200' : 'bg-neutral-50 hover:bg-neutral-100'}
                    `}
                  >
                    <div className="p-2 bg-violet-100 rounded-lg">
                      <Building2 size={18} className="text-violet-600" />
                    </div>
                    <span className="flex-1 text-right font-medium text-neutral-800">{company.name}</span>
                    {companyFilter === company.id && <Check size={20} className="text-violet-600" />}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
