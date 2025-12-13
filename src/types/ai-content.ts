export type AITemplate =
  | 'sales-story'
  | 'personal-story'
  | 'before-after-reel'
  | 'tiktok-hook'
  | 'cta-variations'

export type AITone = 'professional' | 'casual' | 'friendly' | 'energetic' | 'calm'

export interface AIGenerationInput {
  templateId: AITemplate
  topic: string
  companyId?: string
  companyName?: string
  tone: AITone
  additionalContext?: string
}

export interface AIGeneratedContent {
  id: string
  userId: string
  templateId: AITemplate
  input: AIGenerationInput
  output: string
  createdAt: Date
  updatedAt: Date
}

export interface AITemplateConfig {
  id: AITemplate
  label: string
  description: string
  icon: string
  promptTemplate: string
  placeholders: {
    topic: string
    tone?: string
    company?: string
  }
}

export const AI_TEMPLATES: Record<AITemplate, AITemplateConfig> = {
  'sales-story': {
    id: 'sales-story',
    label: 'סטורי מכירתי קצר',
    description: 'סטורי אינסטגרם שמוביל לפעולה',
    icon: '💰',
    promptTemplate: 'Create a short, compelling Instagram story promoting {topic} for {company} in a {tone} tone. Include a clear call-to-action.',
    placeholders: {
      topic: 'המוצר/שירות',
      tone: 'סגנון הכתיבה',
      company: 'שם המותג',
    }
  },
  'personal-story': {
    id: 'personal-story',
    label: 'סטורי אישי',
    description: 'סטורי אותנטי ומחבר',
    icon: '💭',
    promptTemplate: 'Write an authentic, personal Instagram story about {topic} in a {tone} tone. Make it relatable and genuine.',
    placeholders: {
      topic: 'הנושא',
      tone: 'סגנון הכתיבה',
    }
  },
  'before-after-reel': {
    id: 'before-after-reel',
    label: 'ריל לפני / אחרי',
    description: 'תסריט לריל טרנספורמציה',
    icon: '✨',
    promptTemplate: 'Create a before/after Reel script about {topic} in a {tone} tone. Include hook, transformation story, and CTA.',
    placeholders: {
      topic: 'הטרנספורמציה',
      tone: 'סגנון הכתיבה',
    }
  },
  'tiktok-hook': {
    id: 'tiktok-hook',
    label: 'טיקטוק – Hook ראשון',
    description: '3 וריאציות להוק פותח',
    icon: '🎯',
    promptTemplate: 'Generate 3 compelling TikTok hooks for content about {topic} in a {tone} tone. Each should grab attention in the first 3 seconds.',
    placeholders: {
      topic: 'נושא הסרטון',
      tone: 'סגנון הכתיבה',
    }
  },
  'cta-variations': {
    id: 'cta-variations',
    label: 'וריאציות CTA',
    description: '5 קריאות לפעולה שונות',
    icon: '📣',
    promptTemplate: 'Create 5 different call-to-action variations for {topic} in a {tone} tone. Make them actionable and compelling.',
    placeholders: {
      topic: 'המטרה',
      tone: 'סגנון הכתיבה',
    }
  },
}

export const TONE_OPTIONS: { value: AITone; label: string }[] = [
  { value: 'professional', label: 'מקצועי' },
  { value: 'casual', label: 'קליל' },
  { value: 'friendly', label: 'חברי' },
  { value: 'energetic', label: 'אנרגטי' },
  { value: 'calm', label: 'רגוע' },
]
