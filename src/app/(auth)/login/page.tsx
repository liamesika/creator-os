'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, ArrowLeft, Sparkles } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useDemoModeStore } from '@/stores/demoModeStore'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const { activateDemoMode } = useDemoModeStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await login(email, password)
      sessionStorage.setItem('creators-os-just-logged-in', 'true')
      sessionStorage.removeItem('creators-os-splash-seen')
      router.push('/dashboard')
    } catch (err) {
      setError('אימייל או סיסמה שגויים')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoMode = () => {
    activateDemoMode()
    sessionStorage.setItem('creators-os-just-logged-in', 'true')
    sessionStorage.removeItem('creators-os-splash-seen')
    router.push('/dashboard')
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-neutral-200/50 border border-neutral-100 p-8 sm:p-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-center mb-8"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">
          כניסה לחשבון
        </h1>
        <p className="text-neutral-500">
          ברוכים השבים! הזינו את הפרטים כדי להמשיך
        </p>
      </motion.div>

      {/* Form */}
      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        {/* Email */}
        <div>
          <label htmlFor="email" className="input-label">
            אימייל
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className={`input-field ${error ? 'input-error' : ''}`}
            required
            disabled={isLoading}
            dir="ltr"
          />
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="input-label">
            סיסמה
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={`input-field pl-12 ${error ? 'input-error' : ''}`}
              required
              disabled={isLoading}
              dir="ltr"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Forgot password */}
        <div className="flex justify-start">
          <button
            type="button"
            className="text-sm text-accent-600 hover:text-accent-700 transition-colors"
          >
            שכחתי סיסמה
          </button>
        </div>

        {/* Error message */}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-red-500 text-center"
          >
            {error}
          </motion.p>
        )}

        {/* Submit button */}
        <motion.button
          type="submit"
          disabled={isLoading}
          whileHover={{ scale: isLoading ? 1 : 1.01 }}
          whileTap={{ scale: isLoading ? 1 : 0.99 }}
          className="btn-app-primary flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <>
              כניסה
              <ArrowLeft size={18} />
            </>
          )}
        </motion.button>
      </motion.form>

      {/* Divider */}
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-neutral-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-4 text-sm text-neutral-400">או</span>
        </div>
      </div>

      {/* Demo Mode button */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        type="button"
        onClick={handleDemoMode}
        className="btn-app-secondary flex items-center justify-center gap-3 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border-purple-200"
      >
        <Sparkles size={20} className="text-purple-600" />
        <span className="font-semibold text-purple-700">נסו מצב הדגמה</span>
      </motion.button>

      {/* Google login placeholder */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        type="button"
        className="btn-app-secondary flex items-center justify-center gap-3 mt-3"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        המשך עם Google
      </motion.button>

      {/* Sign up link */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-8 text-center text-sm text-neutral-500"
      >
        אין לך חשבון עדיין?{' '}
        <Link
          href="/signup"
          className="text-accent-600 hover:text-accent-700 font-medium transition-colors"
        >
          הרשמה
        </Link>
      </motion.p>
    </div>
  )
}
