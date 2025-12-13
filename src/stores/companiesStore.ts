'use client'

import { create } from 'zustand'
import {
  Company,
  CompanyStatus,
  getContractStatus,
} from '@/types/company'
import { db } from '@/lib/supabase/database'
import { getCurrentUserIdSync } from '@/lib/supabase/auth-helpers'
import { toast } from 'sonner'
import { logActivity } from '@/lib/activity-logger'

interface CompaniesStore {
  companies: Company[]
  selectedCompany: Company | null
  isCreateModalOpen: boolean
  isProfileDrawerOpen: boolean
  editingCompany: Company | null
  isLoading: boolean
  isInitialized: boolean

  // Actions
  setSelectedCompany: (company: Company | null) => void
  openCreateModal: (company?: Company) => void
  closeCreateModal: () => void
  openProfileDrawer: (company: Company) => void
  closeProfileDrawer: () => void

  // Data loading
  initialize: (userId: string) => Promise<void>

  // CRUD
  createCompany: (company: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Company | null>
  updateCompany: (id: string, updates: Partial<Company>) => Promise<void>
  archiveCompany: (id: string) => Promise<void>
  restoreCompany: (id: string) => Promise<void>
  deleteCompany: (id: string) => Promise<void>

  // Queries
  getCompanyById: (id: string) => Company | undefined
  listCompanies: (filter?: 'all' | 'active' | 'archived') => Company[]
  searchCompanies: (query: string) => Company[]
  getActiveCompanies: () => Company[]
  getExpiringContracts: () => Company[]
  getTotalMonthlyRetainers: () => number
}

export const useCompaniesStore = create<CompaniesStore>((set, get) => ({
  companies: [],
  selectedCompany: null,
  isCreateModalOpen: false,
  isProfileDrawerOpen: false,
  editingCompany: null,
  isLoading: false,
  isInitialized: false,

  setSelectedCompany: (company) => set({ selectedCompany: company }),

  openCreateModal: (company) => set({
    isCreateModalOpen: true,
    editingCompany: company || null
  }),

  closeCreateModal: () => set({
    isCreateModalOpen: false,
    editingCompany: null
  }),

  openProfileDrawer: (company) => set({
    selectedCompany: company,
    isProfileDrawerOpen: true
  }),

  closeProfileDrawer: () => set({
    selectedCompany: null,
    isProfileDrawerOpen: false
  }),

  initialize: async (userId: string) => {
    if (get().isInitialized) return

    set({ isLoading: true })
    try {
      const companies = await db.getCompanies(userId)
      set({ companies, isInitialized: true })
    } catch (error) {
      console.error('Failed to load companies:', error)
      toast.error('שגיאה בטעינת החברות')
    } finally {
      set({ isLoading: false })
    }
  },

  createCompany: async (companyData) => {
    const userId = getCurrentUserIdSync()
    if (!userId) {
      toast.error('יש להתחבר כדי ליצור חברה')
      return null
    }

    try {
      const newCompany = await db.createCompany(userId, companyData)
      set((state) => ({
        companies: [...state.companies, newCompany]
      }))
      logActivity('company_created', newCompany.id, newCompany.name)
      toast.success('החברה נוספה בהצלחה')
      return newCompany
    } catch (error) {
      console.error('Failed to create company:', error)
      toast.error('שגיאה ביצירת החברה')
      return null
    }
  },

  updateCompany: async (id, updates) => {
    const prevState = get().companies
    const company = get().companies.find((c) => c.id === id)
    set((state) => ({
      companies: state.companies.map((company) =>
        company.id === id
          ? { ...company, ...updates, updatedAt: new Date() }
          : company
      ),
      selectedCompany:
        state.selectedCompany?.id === id
          ? { ...state.selectedCompany, ...updates, updatedAt: new Date() }
          : state.selectedCompany,
    }))

    try {
      await db.updateCompany(id, updates)
      logActivity('company_updated', id, company?.name)
      toast.success('החברה עודכנה בהצלחה')
    } catch (error) {
      console.error('Failed to update company:', error)
      toast.error('שגיאה בעדכון החברה')
      set({ companies: prevState })
    }
  },

  archiveCompany: async (id) => {
    const prevState = get().companies
    const company = get().companies.find((c) => c.id === id)
    set((state) => ({
      companies: state.companies.map((company) =>
        company.id === id
          ? { ...company, status: 'ARCHIVED' as CompanyStatus, updatedAt: new Date() }
          : company
      ),
    }))

    try {
      await db.updateCompany(id, { status: 'ARCHIVED' })
      logActivity('company_archived', id, company?.name)
      toast.success('החברה הועברה לארכיון')
    } catch (error) {
      console.error('Failed to archive company:', error)
      toast.error('שגיאה בהעברה לארכיון')
      set({ companies: prevState })
    }
  },

  restoreCompany: async (id) => {
    const prevState = get().companies
    const company = get().companies.find((c) => c.id === id)
    set((state) => ({
      companies: state.companies.map((company) =>
        company.id === id
          ? { ...company, status: 'ACTIVE' as CompanyStatus, updatedAt: new Date() }
          : company
      ),
    }))

    try {
      await db.updateCompany(id, { status: 'ACTIVE' })
      logActivity('company_restored', id, company?.name)
      toast.success('החברה שוחזרה מהארכיון')
    } catch (error) {
      console.error('Failed to restore company:', error)
      toast.error('שגיאה בשחזור החברה')
      set({ companies: prevState })
    }
  },

  deleteCompany: async (id) => {
    const prevState = get().companies
    const prevSelected = get().selectedCompany
    const prevDrawerOpen = get().isProfileDrawerOpen

    set((state) => ({
      companies: state.companies.filter((company) => company.id !== id),
      selectedCompany:
        state.selectedCompany?.id === id ? null : state.selectedCompany,
      isProfileDrawerOpen:
        state.selectedCompany?.id === id ? false : state.isProfileDrawerOpen,
    }))

    try {
      await db.deleteCompany(id)
      toast.success('החברה נמחקה')
    } catch (error) {
      console.error('Failed to delete company:', error)
      toast.error('שגיאה במחיקת החברה')
      set({
        companies: prevState,
        selectedCompany: prevSelected,
        isProfileDrawerOpen: prevDrawerOpen
      })
    }
  },

  getCompanyById: (id) => {
    return get().companies.find((company) => company.id === id)
  },

  listCompanies: (filter = 'all') => {
    const companies = get().companies
    if (filter === 'active') {
      return companies.filter((c) => c.status === 'ACTIVE')
    }
    if (filter === 'archived') {
      return companies.filter((c) => c.status === 'ARCHIVED')
    }
    return companies
  },

  searchCompanies: (query) => {
    const lowerQuery = query.toLowerCase()
    return get().companies.filter(
      (company) =>
        company.name.toLowerCase().includes(lowerQuery) ||
        company.contactName?.toLowerCase().includes(lowerQuery) ||
        company.contactEmail?.toLowerCase().includes(lowerQuery)
    )
  },

  getActiveCompanies: () => {
    return get().companies.filter((c) => c.status === 'ACTIVE')
  },

  getExpiringContracts: () => {
    return get().companies.filter((company) => {
      if (company.status !== 'ACTIVE') return false
      const status = getContractStatus(company.contract)
      return status === 'expiring'
    })
  },

  getTotalMonthlyRetainers: () => {
    return get()
      .companies.filter((c) => c.status === 'ACTIVE')
      .reduce((total, company) => {
        if (company.paymentTerms.paymentModel === 'MONTHLY') {
          return total + (company.paymentTerms.monthlyRetainerAmount || 0)
        }
        return total
      }, 0)
  },
}))
