'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutTemplate,
  Plus,
  Search,
  Calendar,
  ListTodo,
  Target,
  Clock,
  ChevronLeft,
  ChevronDown,
  Trash2,
  Edit2,
  Play,
  Sparkles,
  X,
  Check,
  Filter,
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import PremiumCard from '@/components/app/PremiumCard'
import type {
  Template,
  TemplateCategory,
  TemplateItem,
  CreateTemplatePayload,
  CreateTemplateItemPayload,
} from '@/types/templates'
import { TEMPLATE_CATEGORIES, getCategoryConfig, formatDayOffset, getItemTypeLabel, getItemTypeIcon } from '@/types/templates'

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showApplyModal, setShowApplyModal] = useState<Template | null>(null)
  const [applyDate, setApplyDate] = useState('')
  const [applying, setApplying] = useState(false)

  // Fetch templates
  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/templates')
      const data = await res.json()
      if (data.templates) {
        setTemplates(data.templates)
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
      toast.error('שגיאה בטעינת התבניות')
    } finally {
      setLoading(false)
    }
  }

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return templates.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [templates, searchQuery, selectedCategory])

  // Handle delete template
  const handleDelete = async (id: string) => {
    if (!confirm('האם למחוק את התבנית?')) return

    try {
      const res = await fetch(`/api/templates/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setTemplates(prev => prev.filter(t => t.id !== id))
        toast.success('התבנית נמחקה')
      } else {
        toast.error('שגיאה במחיקת התבנית')
      }
    } catch (error) {
      toast.error('שגיאה במחיקת התבנית')
    }
  }

  // Handle apply template
  const handleApply = async () => {
    if (!showApplyModal || !applyDate) return

    setApplying(true)
    try {
      const res = await fetch('/api/templates/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: showApplyModal.id,
          targetCreatorUserId: '', // Will be set by server from auth
          startDate: applyDate,
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        toast.success(`נוצרו ${data.summary.eventsCreated} אירועים, ${data.summary.tasksCreated} משימות, ${data.summary.goalsCreated} יעדים`)
        setShowApplyModal(null)
        setApplyDate('')
      } else {
        toast.error(data.error || 'שגיאה בהחלת התבנית')
      }
    } catch (error) {
      toast.error('שגיאה בהחלת התבנית')
    } finally {
      setApplying(false)
    }
  }

  // Handle template created
  const handleTemplateCreated = (template: Template) => {
    setTemplates(prev => [template, ...prev])
    setShowCreateModal(false)
    toast.success('התבנית נוצרה בהצלחה')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50/50 via-white to-violet-50/50" dir="rtl">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-neutral-200/50 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                <ChevronLeft size={20} className="text-neutral-500" />
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25">
                  <LayoutTemplate size={20} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-neutral-900">תבניות</h1>
                  <p className="text-xs text-neutral-500">חסוך זמן עם תבניות מוכנות</p>
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 transition-shadow flex items-center gap-2"
            >
              <Plus size={18} />
              תבנית חדשה
            </motion.button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-5xl mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="חיפוש תבניות..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>

          {/* Category filter */}
          <div className="relative">
            <Filter size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as TemplateCategory | 'all')}
              className="appearance-none pr-9 pl-10 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white cursor-pointer"
            >
              <option value="all">כל הקטגוריות</option>
              {Object.values(TEMPLATE_CATEGORIES).map(cat => (
                <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="max-w-5xl mx-auto px-4 pb-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-neutral-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredTemplates.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 mx-auto bg-neutral-100 rounded-2xl flex items-center justify-center mb-4">
              <LayoutTemplate size={32} className="text-neutral-400" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              {searchQuery || selectedCategory !== 'all' ? 'לא נמצאו תבניות' : 'אין תבניות עדיין'}
            </h3>
            <p className="text-neutral-500 mb-6">
              {searchQuery || selectedCategory !== 'all'
                ? 'נסה לשנות את החיפוש או הפילטר'
                : 'צור תבנית ראשונה כדי לחסוך זמן בתכנון'
              }
            </p>
            {!searchQuery && selectedCategory === 'all' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium rounded-xl shadow-lg"
              >
                <Plus size={18} className="inline ml-2" />
                צור תבנית ראשונה
              </button>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template, index) => (
              <TemplateCard
                key={template.id}
                template={template}
                index={index}
                onApply={() => {
                  setShowApplyModal(template)
                  // Set default date to today
                  const today = new Date().toISOString().split('T')[0]
                  setApplyDate(today)
                }}
                onDelete={() => handleDelete(template.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateTemplateModal
            onClose={() => setShowCreateModal(false)}
            onCreated={handleTemplateCreated}
          />
        )}
      </AnimatePresence>

      {/* Apply Modal */}
      <AnimatePresence>
        {showApplyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowApplyModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden"
            >
              <div className="p-6 border-b border-neutral-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-neutral-900">החל תבנית</h2>
                  <button
                    onClick={() => setShowApplyModal(null)}
                    className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                  >
                    <X size={20} className="text-neutral-500" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="p-4 bg-violet-50 rounded-xl">
                  <p className="font-medium text-neutral-900">{showApplyModal.title}</p>
                  <p className="text-sm text-neutral-600 mt-1">
                    {showApplyModal.items?.length || 0} פריטים יתווספו ללוח השנה שלך
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    תאריך התחלה
                  </label>
                  <input
                    type="date"
                    value={applyDate}
                    onChange={(e) => setApplyDate(e.target.value)}
                    className="w-full p-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                  <p className="text-xs text-neutral-500 mt-2">
                    הפריטים יתווספו ביחס לתאריך זה לפי ההגדרות בתבנית
                  </p>
                </div>

                <button
                  onClick={handleApply}
                  disabled={!applyDate || applying}
                  className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {applying ? (
                    <span>מחיל...</span>
                  ) : (
                    <>
                      <Play size={18} />
                      החל תבנית
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Template Card Component
interface TemplateCardProps {
  template: Template
  index: number
  onApply: () => void
  onDelete: () => void
}

function TemplateCard({ template, index, onApply, onDelete }: TemplateCardProps) {
  const categoryConfig = getCategoryConfig(template.category)
  const itemCounts = useMemo(() => {
    const items = template.items || []
    return {
      events: items.filter(i => i.itemType === 'event').length,
      tasks: items.filter(i => i.itemType === 'task').length,
      goals: items.filter(i => i.itemType === 'goal').length,
    }
  }, [template.items])

  return (
    <PremiumCard delay={index * 0.05} interactive>
      <div className="p-5">
        {/* Category badge */}
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${categoryConfig.bgColor} ${categoryConfig.color}`}>
          <span>{categoryConfig.icon}</span>
          {categoryConfig.label}
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-neutral-900 mt-3 mb-1">
          {template.title}
        </h3>
        {template.description && (
          <p className="text-sm text-neutral-500 line-clamp-2">{template.description}</p>
        )}

        {/* Item counts */}
        <div className="flex items-center gap-3 mt-4 text-xs text-neutral-500">
          {itemCounts.events > 0 && (
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {itemCounts.events}
            </span>
          )}
          {itemCounts.tasks > 0 && (
            <span className="flex items-center gap-1">
              <ListTodo size={12} />
              {itemCounts.tasks}
            </span>
          )}
          {itemCounts.goals > 0 && (
            <span className="flex items-center gap-1">
              <Target size={12} />
              {itemCounts.goals}
            </span>
          )}
          {template.isPublic && (
            <span className="flex items-center gap-1 text-violet-600">
              <Sparkles size={12} />
              ציבורי
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-neutral-100">
          <button
            onClick={(e) => { e.stopPropagation(); onApply() }}
            className="flex-1 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
          >
            <Play size={14} />
            החל
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete() }}
            className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </PremiumCard>
  )
}

// Create Template Modal
interface CreateTemplateModalProps {
  onClose: () => void
  onCreated: (template: Template) => void
}

function CreateTemplateModal({ onClose, onCreated }: CreateTemplateModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<TemplateCategory>('custom')
  const [isPublic, setIsPublic] = useState(false)
  const [items, setItems] = useState<CreateTemplateItemPayload[]>([])
  const [saving, setSaving] = useState(false)

  // Add item form state
  const [showAddItem, setShowAddItem] = useState(false)
  const [newItemType, setNewItemType] = useState<'event' | 'task' | 'goal'>('task')
  const [newItemTitle, setNewItemTitle] = useState('')
  const [newItemDayOffset, setNewItemDayOffset] = useState(0)
  const [newItemTime, setNewItemTime] = useState('')
  const [newItemPriority, setNewItemPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM')

  const handleAddItem = () => {
    if (!newItemTitle.trim()) return

    const newItem: CreateTemplateItemPayload = {
      itemType: newItemType,
      title: newItemTitle.trim(),
      dayOffset: newItemDayOffset,
      timeOfDay: newItemType === 'event' && newItemTime ? newItemTime + ':00' : undefined,
      priority: newItemType === 'task' ? newItemPriority : undefined,
      sortOrder: items.length,
    }

    setItems(prev => [...prev, newItem])
    setNewItemTitle('')
    setNewItemDayOffset(0)
    setNewItemTime('')
    setShowAddItem(false)
  }

  const handleRemoveItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('יש להזין שם לתבנית')
      return
    }

    setSaving(true)
    try {
      const payload: CreateTemplatePayload = {
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        isPublic,
        items,
      }

      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (res.ok && data.template) {
        onCreated(data.template)
      } else {
        toast.error(data.error || 'שגיאה ביצירת התבנית')
      }
    } catch (error) {
      toast.error('שגיאה ביצירת התבנית')
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl max-w-2xl w-full my-8 overflow-hidden"
        dir="rtl"
      >
        {/* Header */}
        <div className="p-6 border-b border-neutral-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-neutral-900">תבנית חדשה</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-neutral-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">שם התבנית *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="לדוגמה: צילום שבועי"
              className="w-full p-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">תיאור</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="תיאור קצר של התבנית..."
              rows={2}
              className="w-full p-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">קטגוריה</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(TEMPLATE_CATEGORIES).map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`p-3 rounded-xl border-2 transition-all text-right ${
                    category === cat.id
                      ? 'border-violet-500 bg-violet-50'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <span className="text-lg">{cat.icon}</span>
                  <span className="mr-2 font-medium text-neutral-900">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Public toggle */}
          <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
            <div>
              <p className="font-medium text-neutral-900">תבנית ציבורית</p>
              <p className="text-sm text-neutral-500">אחרים יוכלו לראות ולהשתמש בתבנית</p>
            </div>
            <button
              onClick={() => setIsPublic(!isPublic)}
              className={`w-12 h-7 rounded-full transition-colors relative ${
                isPublic ? 'bg-violet-600' : 'bg-neutral-300'
              }`}
            >
              <span className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-all ${
                isPublic ? 'right-1' : 'left-1'
              }`} />
            </button>
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-neutral-700">פריטים בתבנית</label>
              <button
                onClick={() => setShowAddItem(true)}
                className="text-sm text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1"
              >
                <Plus size={14} />
                הוסף פריט
              </button>
            </div>

            {items.length === 0 && !showAddItem ? (
              <div className="p-6 border-2 border-dashed border-neutral-200 rounded-xl text-center">
                <p className="text-neutral-500 text-sm">אין פריטים עדיין</p>
                <button
                  onClick={() => setShowAddItem(true)}
                  className="text-violet-600 text-sm font-medium mt-2"
                >
                  הוסף פריט ראשון
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{getItemTypeIcon(item.itemType)}</span>
                      <div>
                        <p className="font-medium text-neutral-900">{item.title}</p>
                        <p className="text-xs text-neutral-500">
                          {getItemTypeLabel(item.itemType)} • {formatDayOffset(item.dayOffset)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(index)}
                      className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add item form */}
            {showAddItem && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3 p-4 border border-violet-200 bg-violet-50/50 rounded-xl space-y-3"
              >
                <div className="flex gap-2">
                  {(['task', 'event', 'goal'] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => setNewItemType(type)}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                        newItemType === type
                          ? 'bg-violet-600 text-white'
                          : 'bg-white text-neutral-600 hover:bg-neutral-100'
                      }`}
                    >
                      {getItemTypeIcon(type)} {getItemTypeLabel(type)}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  value={newItemTitle}
                  onChange={(e) => setNewItemTitle(e.target.value)}
                  placeholder="כותרת הפריט..."
                  className="w-full p-2.5 border border-neutral-200 rounded-lg text-sm"
                />

                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-xs text-neutral-600 mb-1">יום יחסי</label>
                    <input
                      type="number"
                      value={newItemDayOffset}
                      onChange={(e) => setNewItemDayOffset(parseInt(e.target.value) || 0)}
                      className="w-full p-2 border border-neutral-200 rounded-lg text-sm"
                    />
                  </div>
                  {newItemType === 'event' && (
                    <div className="flex-1">
                      <label className="block text-xs text-neutral-600 mb-1">שעה</label>
                      <input
                        type="time"
                        value={newItemTime}
                        onChange={(e) => setNewItemTime(e.target.value)}
                        className="w-full p-2 border border-neutral-200 rounded-lg text-sm"
                      />
                    </div>
                  )}
                  {newItemType === 'task' && (
                    <div className="flex-1">
                      <label className="block text-xs text-neutral-600 mb-1">עדיפות</label>
                      <select
                        value={newItemPriority}
                        onChange={(e) => setNewItemPriority(e.target.value as any)}
                        className="w-full p-2 border border-neutral-200 rounded-lg text-sm bg-white"
                      >
                        <option value="LOW">נמוכה</option>
                        <option value="MEDIUM">בינונית</option>
                        <option value="HIGH">גבוהה</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleAddItem}
                    disabled={!newItemTitle.trim()}
                    className="flex-1 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg disabled:opacity-50"
                  >
                    <Check size={14} className="inline ml-1" />
                    הוסף
                  </button>
                  <button
                    onClick={() => {
                      setShowAddItem(false)
                      setNewItemTitle('')
                    }}
                    className="px-4 py-2 text-neutral-600 text-sm hover:bg-neutral-100 rounded-lg"
                  >
                    ביטול
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-neutral-100 bg-neutral-50">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 border border-neutral-300 text-neutral-700 font-medium rounded-xl hover:bg-neutral-100 transition-colors"
            >
              ביטול
            </button>
            <button
              onClick={handleSave}
              disabled={!title.trim() || saving}
              className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'שומר...' : 'צור תבנית'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
