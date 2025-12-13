'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, Building2, Filter } from 'lucide-react'
import { useCompaniesStore } from '@/stores/companiesStore'
import CompanyCard from '@/components/companies/CompanyCard'
import CreateCompanyModal from '@/components/companies/CreateCompanyModal'
import CompanyProfileDrawer from '@/components/companies/CompanyProfileDrawer'
import PremiumEmptyState from '@/components/app/PremiumEmptyState'

type FilterType = 'all' | 'active' | 'archived'

const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
  { value: 'active', label: 'פעילות' },
  { value: 'archived', label: 'בארכיון' },
  { value: 'all', label: 'הכל' },
]

export default function CompaniesPage() {
  const {
    companies,
    isCreateModalOpen,
    isProfileDrawerOpen,
    selectedCompany,
    editingCompany,
    openCreateModal,
    closeCreateModal,
    openProfileDrawer,
    closeProfileDrawer,
  } = useCompaniesStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterType>('active')

  const filteredCompanies = useMemo(() => {
    let result = companies

    // Apply status filter
    if (activeFilter === 'active') {
      result = result.filter((c) => c.status === 'ACTIVE')
    } else if (activeFilter === 'archived') {
      result = result.filter((c) => c.status === 'ARCHIVED')
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.contactName?.toLowerCase().includes(query) ||
          c.contactEmail?.toLowerCase().includes(query)
      )
    }

    return result.sort((a, b) => a.name.localeCompare(b.name, 'he'))
  }, [companies, activeFilter, searchQuery])

  return (
    <div className="h-full flex flex-col">
      {/* Header - sticky on mobile */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-neutral-100/80 px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-800">חברות</h1>
            <p className="text-sm text-neutral-500 mt-0.5 hidden sm:block">
              ניהול מותגים, חוזים ותנאי תשלום
            </p>
          </div>

          {/* Desktop CTA */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => openCreateModal()}
            className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-accent-600 hover:bg-accent-700 text-white text-sm font-medium rounded-xl shadow-lg shadow-accent-500/20 transition-colors"
          >
            <Plus size={18} strokeWidth={2.5} />
            חברה חדשה
          </motion.button>
        </div>

        {/* Search and filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="חיפוש חברה..."
              className="w-full pr-10 pl-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all"
            />
          </div>

          {/* Filter chips */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1 -mb-1">
            {FILTER_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setActiveFilter(option.value)}
                className={`
                  flex-shrink-0 px-4 py-2 text-sm font-medium rounded-xl transition-all
                  ${activeFilter === option.value
                    ? 'bg-accent-600 text-white shadow-sm'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-4">
        <AnimatePresence mode="wait">
          {filteredCompanies.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex items-center justify-center"
            >
              {searchQuery || activeFilter !== 'active' ? (
                <div className="text-center py-12">
                  <p className="text-neutral-500">לא נמצאו תוצאות</p>
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setActiveFilter('active')
                    }}
                    className="mt-2 text-sm text-accent-600 hover:text-accent-700"
                  >
                    נקה חיפוש
                  </button>
                </div>
              ) : (
                <PremiumEmptyState
                  icon={Building2}
                  title="התחילו כאן"
                  description="הוסיפו את הלקוח הראשון שלכם"
                  actionLabel="הוסף לקוח"
                  onAction={() => openCreateModal()}
                  color="blue"
                />
              )}
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
            >
              {filteredCompanies.map((company, index) => (
                <CompanyCard
                  key={company.id}
                  company={company}
                  onClick={() => openProfileDrawer(company)}
                  delay={index * 0.05}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile FAB */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 20 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => openCreateModal()}
        className="sm:hidden fixed bottom-24 left-6 w-14 h-14 bg-accent-600 hover:bg-accent-700 text-white rounded-full shadow-lg shadow-accent-500/30 flex items-center justify-center z-40"
      >
        <Plus size={24} strokeWidth={2.5} />
      </motion.button>

      {/* Create/Edit Company Modal */}
      <CreateCompanyModal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        editingCompany={editingCompany}
      />

      {/* Company Profile Drawer */}
      <CompanyProfileDrawer
        isOpen={isProfileDrawerOpen}
        onClose={closeProfileDrawer}
        company={selectedCompany}
      />
    </div>
  )
}
