/**
 * AI Content Templates
 * Pre-defined prompts for common content creation scenarios
 */

export interface ContentTemplate {
  id: string
  name: string
  description: string
  category: 'story' | 'reel' | 'tiktok' | 'cta' | 'caption'
  prompt: string
  variables?: string[] // Variables that user can fill in
  isPremium?: boolean
}

export const AI_TEMPLATES: ContentTemplate[] = [
  {
    id: 'story-sales',
    name: 'סטורי מכירתי קצר',
    description: 'סטורי בן 15 שניות שמוכר מוצר/שירות',
    category: 'story',
    prompt: `צור סטורי מכירתי קצר (15 שניות) עבור:
מוצר/שירות: {product}
קהל יעד: {audience}
תועלת עיקרית: {benefit}

הסטורי צריך:
- לתפוס תשומת לב מיד
- להדגיש תועלת ברורה
- לכלול קריאה לפעולה
- להיות בשפה יומיומית וזורמת`,
    variables: ['product', 'audience', 'benefit'],
  },
  {
    id: 'story-personal',
    name: 'סטורי אישי',
    description: 'סטורי אישי שמחבר עם הקהל',
    category: 'story',
    prompt: `צור סטורי אישי ואותנטי עבור:
נושא: {topic}
רגש מרכזי: {emotion}
מסר: {message}

הסטורי צריך:
- להיות אישי וכנה
- ליצור חיבור רגשי
- לספר סיפור קצר
- לסיים עם מסר מעורר השראה`,
    variables: ['topic', 'emotion', 'message'],
  },
  {
    id: 'reel-before-after',
    name: 'ריל לפני / אחרי',
    description: 'ריל שמראה שינוי או טרנספורמציה',
    category: 'reel',
    prompt: `צור תסריט לריל "לפני ואחרי" עבור:
מה השתנה: {transformation}
זמן השינוי: {timeframe}
השיטה: {method}

כלול:
- Hook חזק בשניות הראשונות
- 3-5 נקודות מפתח של השינוי
- קריאה לפעולה בסוף
- טון מעורר השראה אבל מציאותי`,
    variables: ['transformation', 'timeframe', 'method'],
  },
  {
    id: 'tiktok-hook',
    name: 'טיקטוק – Hook ראשון',
    description: 'Hook חזק ל-3 שניות הראשונות',
    category: 'tiktok',
    prompt: `צור 5 hooks שונים לטיקטוק עבור:
נושא התוכן: {topic}
קהל יעד: {audience}

כל hook צריך:
- להיות 3-7 מילים
- לעורר סקרנות או הפתעה
- להתחיל עם "אם...", "לא ידעתם ש...", "הסוד ל...", וכו'
- להבטיח ערך ברור`,
    variables: ['topic', 'audience'],
  },
  {
    id: 'cta-variations',
    name: 'CTA Variations',
    description: 'וריאציות שונות לקריאה לפעולה',
    category: 'cta',
    prompt: `צור 10 וריאציות שונות לקריאה לפעולה (CTA) עבור:
מטרת הפעולה: {action}
פלטפורמה: {platform}

כלול:
- CTAs ישירים ועקיפים
- CTAs דחופים ורגועים
- CTAs שואלים ומצהירים
- CTAs יצירתיים ופשוטים`,
    variables: ['action', 'platform'],
    isPremium: false,
  },
  {
    id: 'caption-engagement',
    name: 'כתוביות מעוררות מעורבות',
    description: 'כתוביות שמעודדות תגובות ושיתופים',
    category: 'caption',
    prompt: `צור כתובית מעוררת מעורבות עבור:
תוכן הפוסט: {content}
מטרת המעורבות: {goal}

הכתובית צריכה:
- להתחיל עם שאלה או אמירה מעניינת
- לספר מיני-סיפור או לשתף תובנה
- לכלול שאלה לקהל
- להסתיים בעידוד לתגובה/שיתוף`,
    variables: ['content', 'goal'],
    isPremium: false,
  },
]

/**
 * Get all templates or filter by category
 */
export function getTemplates(category?: ContentTemplate['category']): ContentTemplate[] {
  if (!category) return AI_TEMPLATES
  return AI_TEMPLATES.filter(t => t.category === category)
}

/**
 * Get template by ID
 */
export function getTemplateById(id: string): ContentTemplate | undefined {
  return AI_TEMPLATES.find(t => t.id === id)
}

/**
 * Fill template with variables
 */
export function fillTemplate(template: ContentTemplate, variables: Record<string, string>): string {
  let prompt = template.prompt

  // Replace all variables
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{${key}}`
    prompt = prompt.replace(new RegExp(placeholder, 'g'), value)
  })

  return prompt
}

/**
 * Validate that all required variables are provided
 */
export function validateTemplateVariables(
  template: ContentTemplate,
  variables: Record<string, string>
): { valid: boolean; missing: string[] } {
  if (!template.variables || template.variables.length === 0) {
    return { valid: true, missing: [] }
  }

  const missing = template.variables.filter(v => !variables[v] || variables[v].trim() === '')

  return {
    valid: missing.length === 0,
    missing,
  }
}
