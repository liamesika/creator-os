'use client'

import { toast } from 'sonner'

const MOTIVATIONAL_MESSAGES = {
  taskComplete: [
    { emoji: '🎉', text: 'מעולה! המשימה הושלמה' },
    { emoji: '✨', text: 'עוד משימה ברשימה!' },
    { emoji: '💪', text: 'כל הכבוד! ממשיכים קדימה' },
    { emoji: '🚀', text: 'פרודוקטיביות ברמה גבוהה!' },
    { emoji: '⭐', text: 'יופי של עבודה!' },
  ],
  goalAchieved: [
    { emoji: '🏆', text: 'יעד הושג! מרשים!' },
    { emoji: '🎯', text: 'פגעת במטרה!' },
    { emoji: '🌟', text: 'הגעת ליעד - מדהים!' },
  ],
  streakMilestone: [
    { emoji: '🔥', text: 'רצף חדש! תמשיך כך' },
    { emoji: '💫', text: 'אתה על גלגל!' },
    { emoji: '⚡', text: 'מומנטום מדהים!' },
  ],
  dayComplete: [
    { emoji: '🌙', text: 'יום פרודוקטיבי!' },
    { emoji: '😌', text: 'סיימת את היום בסטייל' },
    { emoji: '🌅', text: 'יום מוצלח!' },
  ],
  morning: [
    { emoji: '☀️', text: 'בוקר טוב! יום חדש להצלחות' },
    { emoji: '🌅', text: 'יום חדש, הזדמנויות חדשות' },
    { emoji: '☕', text: 'בוקר טוב! מוכן ליום פרודוקטיבי?' },
  ],
}

type MessageType = keyof typeof MOTIVATIONAL_MESSAGES

function getRandomMessage(type: MessageType) {
  const messages = MOTIVATIONAL_MESSAGES[type]
  return messages[Math.floor(Math.random() * messages.length)]
}

export function showMotivationalToast(type: MessageType) {
  const message = getRandomMessage(type)

  toast(message.text, {
    icon: message.emoji,
    duration: 3000,
    className: 'rtl',
    style: {
      direction: 'rtl',
    },
  })
}

export function showSuccessToast(message: string, emoji: string = '✅') {
  toast(message, {
    icon: emoji,
    duration: 3000,
    className: 'rtl',
    style: {
      direction: 'rtl',
    },
  })
}

export function showErrorToast(message: string) {
  toast.error(message, {
    duration: 4000,
    className: 'rtl',
    style: {
      direction: 'rtl',
    },
  })
}

// Hook for managing motivational toasts
export function useMotivationalToasts() {
  const onTaskComplete = () => showMotivationalToast('taskComplete')
  const onGoalAchieved = () => showMotivationalToast('goalAchieved')
  const onStreakMilestone = () => showMotivationalToast('streakMilestone')
  const onDayComplete = () => showMotivationalToast('dayComplete')
  const showMorningGreeting = () => showMotivationalToast('morning')

  return {
    onTaskComplete,
    onGoalAchieved,
    onStreakMilestone,
    onDayComplete,
    showMorningGreeting,
    showSuccessToast,
    showErrorToast,
  }
}

export default showMotivationalToast
