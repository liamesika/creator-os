'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Copy, Edit, Trash2, Plus, Loader2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useAIContentStore } from '@/stores/aiContentStore'
import { useCompaniesStore } from '@/stores/companiesStore'
import { useFreemiumLimits } from '@/hooks/useFreemiumLimits'
import { AI_TEMPLATES, TONE_OPTIONS, type AITemplate, type AITone } from '@/types/ai-content'
import { toast } from 'sonner'

export default function AIContentPage() {
  const { user } = useAuth()
  const {
    generations,
    isGenerating,
    initialize,
    generateContent,
    deleteGeneration,
    getGenerationsThisMonth,
  } = useAIContentStore()
  const { companies } = useCompaniesStore()
  const { limits } = useFreemiumLimits()

  const [selectedTemplate, setSelectedTemplate] = useState<AITemplate | null>(null)
  const [topic, setTopic] = useState('')
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('')
  const [tone, setTone] = useState<AITone>('casual')
  const [showOutput, setShowOutput] = useState(false)
  const [currentOutput, setCurrentOutput] = useState('')

  useEffect(() => {
    if (user?.id) {
      initialize(user.id)
    }
  }, [user?.id])

  const generationsThisMonth = getGenerationsThisMonth()
  const canGenerate = limits.aiGenerationsPerMonth.canAdd

  const handleGenerate = async () => {
    if (!selectedTemplate || !topic.trim()) {
      toast.error('יש למלא את כל השדות')
      return
    }

    if (!canGenerate) {
      toast.error('הגעת למגבלת הדור החינמי. שדרג לפרימיום!')
      return
    }

    const selectedCompany = companies.find(c => c.id === selectedCompanyId)

    const result = await generateContent({
      templateId: selectedTemplate,
      topic: topic.trim(),
      companyId: selectedCompanyId || undefined,
      companyName: selectedCompany?.name,
      tone,
    })

    if (result) {
      setCurrentOutput(result.output)
      setShowOutput(true)
      setTopic('')
      setSelectedTemplate(null)
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('הועתק ללוח!')
  }

  const handleDelete = async (id: string) => {
    if (confirm('למחוק תוכן זה?')) {
      await deleteGeneration(id)
    }
  }

  const handleNewGeneration = () => {
    setShowOutput(false)
    setCurrentOutput('')
    setSelectedTemplate(null)
    setTopic('')
  }

  if (showOutput) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="dashboard-card"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-neutral-900">התוכן שלך מוכן!</h2>
            <button
              onClick={handleNewGeneration}
              className="btn-app-outline flex items-center gap-2"
            >
              <Plus size={18} />
              תוכן חדש
            </button>
          </div>

          <div className="bg-neutral-50 rounded-xl p-6 mb-4">
            <pre className="whitespace-pre-wrap font-hebrew text-neutral-900 leading-relaxed">
              {currentOutput}
            </pre>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => handleCopy(currentOutput)}
              className="btn-app-primary flex-1 flex items-center justify-center gap-2"
            >
              <Copy size={18} />
              העתק
            </button>
            <button
              onClick={handleNewGeneration}
              className="btn-app-outline flex-1"
            >
              צור תוכן נוסף
            </button>
          </div>
        </motion.div>

        {/* Recent Generations */}
        {generations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6"
          >
            <h3 className="text-lg font-bold text-neutral-900 mb-4">תכנים קודמים</h3>
            <div className="space-y-3">
              {generations.slice(0, 5).map((gen, index) => (
                <motion.div
                  key={gen.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="dashboard-card hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">{AI_TEMPLATES[gen.templateId].icon}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-neutral-900 mb-1">
                        {AI_TEMPLATES[gen.templateId].label}
                      </h4>
                      <p className="text-sm text-neutral-600 mb-2">
                        {gen.input.topic}
                      </p>
                      <p className="text-xs text-neutral-400">
                        {new Date(gen.createdAt).toLocaleDateString('he-IL')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCopy(gen.output)}
                        className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                      >
                        <Copy size={16} className="text-neutral-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(gen.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} className="text-red-600" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="text-accent-600" size={32} />
          <h1 className="text-3xl font-bold text-neutral-900">תוכן AI</h1>
        </div>
        <p className="text-neutral-600">
          העוזר הקריאטיבי שלך ליצירת תוכן איכותי במהירות
        </p>

        {/* Usage Indicator */}
        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-accent-50 rounded-xl">
          <span className="text-sm text-neutral-600">
            נוצרו החודש: <strong className="text-accent-600">{generationsThisMonth}</strong> / {limits.aiGenerationsPerMonth.limit}
          </span>
          {!canGenerate && (
            <span className="text-xs text-red-600 font-bold">מלא!</span>
          )}
        </div>
      </motion.div>

      {/* Template Selection */}
      {!selectedTemplate ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-xl font-bold text-neutral-900 mb-4">בחרי תבנית</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(AI_TEMPLATES).map((template, index) => (
              <motion.button
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedTemplate(template.id)}
                className="dashboard-card hover:shadow-lg hover:border-accent-300 transition-all text-right"
              >
                <div className="text-4xl mb-3">{template.icon}</div>
                <h3 className="text-lg font-bold text-neutral-900 mb-2">
                  {template.label}
                </h3>
                <p className="text-sm text-neutral-600">
                  {template.description}
                </p>
              </motion.button>
            ))}
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="dashboard-card max-w-2xl mx-auto"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="text-4xl">{AI_TEMPLATES[selectedTemplate].icon}</div>
            <div>
              <h2 className="text-xl font-bold text-neutral-900">
                {AI_TEMPLATES[selectedTemplate].label}
              </h2>
              <p className="text-sm text-neutral-600">
                {AI_TEMPLATES[selectedTemplate].description}
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-4">
            {/* Topic */}
            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-2">
                {AI_TEMPLATES[selectedTemplate].placeholders.topic}
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="למשל: קורס דיגיטל חדש, מוצר חדש, עדכון..."
                className="input-app"
              />
            </div>

            {/* Company (Optional) */}
            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-2">
                חברה (אופציונלי)
              </label>
              <select
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                className="input-app"
              >
                <option value="">ללא חברה</option>
                {companies.filter(c => c.status === 'ACTIVE').map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tone */}
            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-2">
                סגנון כתיבה
              </label>
              <div className="flex flex-wrap gap-2">
                {TONE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setTone(option.value)}
                    className={`px-4 py-2 rounded-xl font-bold transition-all ${
                      tone === option.value
                        ? 'bg-accent-600 text-white'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setSelectedTemplate(null)}
                className="btn-app-outline flex-1"
              >
                חזור
              </button>
              <button
                onClick={handleGenerate}
                disabled={!topic.trim() || isGenerating || !canGenerate}
                className="btn-app-primary flex-1 flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    יוצר...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    צור תוכן
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
