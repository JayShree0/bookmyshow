import React, { useState } from 'react'
import { Modal } from '../common/Modal'
import { Button } from '../common/Button'
import { useAuth } from '../../context/AuthContext'
import { isValidEmail, isValidPhone } from '../../utils/validation'
import {
  ShieldCheck,
  Mail,
  Lock,
  User,
  Phone,
  Sparkles,
  Eye,
  EyeOff,
  AlertCircle,
} from 'lucide-react'

export function AuthModal({ isOpen, onClose, initialTab = 'signin' }) {
  const { signIn, signUp } = useAuth()
  const [tab, setTab] = useState(initialTab) // 'signin' | 'signup'

  // Form Fields
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // UI state
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [generalError, setGeneralError] = useState('')

  if (!isOpen) return null

  const handleTabSwitch = (nextTab) => {
    setTab(nextTab)
    setFieldErrors({})
    setGeneralError('')
  }

  const handleDemoSignIn = (presetUser) => {
    signIn(presetUser)
    onClose()
  }

  const validateForm = () => {
    const errors = {}

    if (!email.trim()) {
      errors.email = 'Email address is required'
    } else if (!isValidEmail(email)) {
      errors.email = 'Please enter a valid email address'
    }

    if (!password) {
      errors.password = 'Password is required'
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters'
    }

    if (tab === 'signup') {
      if (!name.trim()) {
        errors.name = 'Full name is required'
      }

      if (!phone.trim()) {
        errors.phone = 'Mobile number is required'
      } else if (!isValidPhone(phone)) {
        errors.phone = 'Enter a valid 10-digit Indian phone number'
      }

      if (!confirmPassword) {
        errors.confirmPassword = 'Confirm your password'
      } else if (confirmPassword !== password) {
        errors.confirmPassword = 'Passwords do not match'
      }
    }

    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setGeneralError('')

    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setFieldErrors({})
    try {
      if (tab === 'signup') {
        const res = await signUp({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || '9876543210',
          password,
        })
        if (res && !res.success && res.error) {
          setGeneralError(res.error)
          return
        }
      } else {
        await signIn({
          email: email.trim(),
          password,
          name: name.trim() || email.split('@')[0],
          phone: phone.trim() || '9876543210',
        })
      }
      onClose()
    } catch (err) {
      setGeneralError(err.message || 'Authentication failed. Please try again.')
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={tab === 'signin' ? 'Sign in to BookMyShow' : 'Create an Account'}
      subtitle={
        tab === 'signin'
          ? 'Access your tickets, favorites, and exclusive booking offers'
          : 'Join millions of movie lovers for seamless ticket booking'
      }
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        {/* Tab switcher */}
        <div className="flex rounded-xl bg-navy-dark p-1 border border-steel/30 shrink-0">
          <button
            type="button"
            onClick={() => handleTabSwitch('signin')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              tab === 'signin'
                ? 'bg-steel text-mint shadow'
                : 'text-mint/60 hover:text-mint'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => handleTabSwitch('signup')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              tab === 'signup'
                ? 'bg-steel text-mint shadow'
                : 'text-mint/60 hover:text-mint'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Quick demo presets - only on signin tab to keep signup form compact & clean */}
        {tab === 'signin' && (
          <div className="p-3 bg-navy-dark/60 rounded-xl border border-steel/20 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-aqua">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>Instant Demo Logins</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-[11px] justify-start truncate"
                onClick={() =>
                  handleDemoSignIn({
                    name: 'Rohan Sharma',
                    email: 'rohan.sharma@example.com',
                    phone: '9876543210',
                  })
                }
              >
                Rohan (Superstar)
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-[11px] justify-start truncate"
                onClick={() =>
                  handleDemoSignIn({
                    name: 'Priya Patel',
                    email: 'priya.patel@example.com',
                    phone: '9123456789',
                  })
                }
              >
                Priya (Member)
              </Button>
            </div>
          </div>
        )}

        {generalError && (
          <div className="p-2.5 rounded-lg bg-crimson/20 border border-crimson/40 text-xs text-mint flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-crimson shrink-0" />
            <span>{generalError}</span>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
          {/* Full Name (Sign Up only) */}
          {tab === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-mint/80 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-mint/40 pointer-events-none" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: '' })
                  }}
                  placeholder="e.g. Rohan Sharma"
                  className={`w-full bg-navy-dark border rounded-xl pl-9 pr-3 py-2 text-sm text-mint placeholder-mint/30 focus:outline-none transition-colors ${
                    fieldErrors.name
                      ? 'border-crimson focus:border-crimson'
                      : 'border-steel/40 focus:border-aqua'
                  }`}
                />
              </div>
              {fieldErrors.name && (
                <p className="text-[11px] text-crimson mt-1 font-medium">
                  {fieldErrors.name}
                </p>
              )}
            </div>
          )}

          {/* Email Address */}
          <div>
            <label className="block text-xs font-medium text-mint/80 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-mint/40 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' })
                }}
                placeholder="your.email@example.com"
                className={`w-full bg-navy-dark border rounded-xl pl-9 pr-3 py-2 text-sm text-mint placeholder-mint/30 focus:outline-none transition-colors ${
                  fieldErrors.email
                    ? 'border-crimson focus:border-crimson'
                    : 'border-steel/40 focus:border-aqua'
                }`}
              />
            </div>
            {fieldErrors.email && (
              <p className="text-[11px] text-crimson mt-1 font-medium">
                {fieldErrors.email}
              </p>
            )}
          </div>

          {/* Mobile Number (Sign Up only) */}
          {tab === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-mint/80 mb-1">
                Mobile Number
              </label>
              <div className="relative">
                <div className="absolute left-3 top-2 text-xs text-mint/50 flex items-center gap-1 pointer-events-none">
                  <Phone className="w-3.5 h-3.5 text-mint/40" />
                  <span>+91</span>
                </div>
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '')
                    setPhone(val)
                    if (fieldErrors.phone) setFieldErrors({ ...fieldErrors, phone: '' })
                  }}
                  placeholder="9876543210"
                  className={`w-full bg-navy-dark border rounded-xl pl-16 pr-3 py-2 text-sm text-mint placeholder-mint/30 focus:outline-none transition-colors ${
                    fieldErrors.phone
                      ? 'border-crimson focus:border-crimson'
                      : 'border-steel/40 focus:border-aqua'
                  }`}
                />
              </div>
              {fieldErrors.phone && (
                <p className="text-[11px] text-crimson mt-1 font-medium">
                  {fieldErrors.phone}
                </p>
              )}
            </div>
          )}

          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-mint/80 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-mint/40 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' })
                }}
                placeholder="••••••••"
                className={`w-full bg-navy-dark border rounded-xl pl-9 pr-10 py-2 text-sm text-mint placeholder-mint/30 focus:outline-none transition-colors ${
                  fieldErrors.password
                    ? 'border-crimson focus:border-crimson'
                    : 'border-steel/40 focus:border-aqua'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 p-0.5 text-mint/40 hover:text-mint transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-[11px] text-crimson mt-1 font-medium">
                {fieldErrors.password}
              </p>
            )}
          </div>

          {/* Confirm Password (Sign Up only) */}
          {tab === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-mint/80 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-mint/40 pointer-events-none" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    if (fieldErrors.confirmPassword)
                      setFieldErrors({ ...fieldErrors, confirmPassword: '' })
                  }}
                  placeholder="••••••••"
                  className={`w-full bg-navy-dark border rounded-xl pl-9 pr-10 py-2 text-sm text-mint placeholder-mint/30 focus:outline-none transition-colors ${
                    fieldErrors.confirmPassword
                      ? 'border-crimson focus:border-crimson'
                      : 'border-steel/40 focus:border-aqua'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 p-0.5 text-mint/40 hover:text-mint transition-colors"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <p className="text-[11px] text-crimson mt-1 font-medium">
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </div>
          )}

          {/* Submit Button */}
          <Button
            variant="crimson"
            type="submit"
            className="w-full mt-3 font-bold shadow-md shadow-crimson/25 py-2.5"
          >
            {tab === 'signin' ? 'Sign In (Demo)' : 'Create Demo Account'}
          </Button>
        </form>

        {/* Switch tab link */}
        <div className="text-center text-xs text-mint/60 pt-1">
          {tab === 'signin' ? (
            <span>
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => handleTabSwitch('signup')}
                className="text-aqua hover:underline font-semibold"
              >
                Sign Up
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => handleTabSwitch('signin')}
                className="text-aqua hover:underline font-semibold"
              >
                Sign In
              </button>
            </span>
          )}
        </div>

        {/* Safety Disclaimer */}
        <div className="pt-2 border-t border-steel/20 flex items-center gap-2 text-[11px] text-mint/50">
          <ShieldCheck className="w-4 h-4 text-aqua shrink-0" />
          <span>Demo Authentication — No sensitive credentials are stored or transmitted.</span>
        </div>
      </div>
    </Modal>
  )
}
