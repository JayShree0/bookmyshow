import React from 'react'
import { Mail, Phone, ShieldCheck } from 'lucide-react'
import { isValidEmail, isValidPhone } from '../../utils/validation'

export function ContactForm({ contactDetails, onChange }) {
  const email = contactDetails?.email || ''
  const phone = contactDetails?.phone || ''

  const isEmailValid = !email || isValidEmail(email)
  const isPhoneValid = !phone || isValidPhone(phone)

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-steel/20 border border-steel/30 text-mint space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-sm text-mint">
          Contact Details for M-Ticket
        </h4>
        <span className="text-[11px] text-mint/50 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-aqua" /> Demo Only
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Email */}
        <div>
          <label className="block text-xs text-mint/70 mb-1 font-medium">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-4 h-4 text-mint/40" />
            <input
              type="email"
              value={email}
              onChange={(e) => onChange({ email: e.target.value })}
              placeholder="e.g. rohan.sharma@example.com"
              className={`w-full bg-navy-dark border text-mint text-xs sm:text-sm rounded-xl pl-9 pr-3 py-2.5 placeholder-mint/30 focus:outline-none transition-all ${
                !isEmailValid
                  ? 'border-crimson focus:border-crimson'
                  : 'border-steel/40 focus:border-aqua'
              }`}
            />
          </div>
          {!isEmailValid && (
            <p className="text-[11px] text-crimson mt-1">
              Please enter a valid email address.
            </p>
          )}
        </div>

        {/* Mobile Number */}
        <div>
          <label className="block text-xs text-mint/70 mb-1 font-medium">
            Mobile Number
          </label>
          <div className="relative">
            <div className="absolute left-3 top-2.5 text-xs text-mint/50 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-mint/40" />
              <span>+91</span>
            </div>
            <input
              type="tel"
              maxLength={10}
              value={phone}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '')
                onChange({ phone: val })
              }}
              placeholder="9876543210"
              className={`w-full bg-navy-dark border text-mint text-xs sm:text-sm rounded-xl pl-16 pr-3 py-2.5 placeholder-mint/30 focus:outline-none transition-all ${
                !isPhoneValid
                  ? 'border-crimson focus:border-crimson'
                  : 'border-steel/40 focus:border-aqua'
              }`}
            />
          </div>
          {!isPhoneValid && (
            <p className="text-[11px] text-crimson mt-1">
              Enter a valid 10-digit Indian mobile number.
            </p>
          )}
        </div>
      </div>

      <p className="text-[11px] text-mint/50 leading-relaxed">
        Your booking confirmation code, hall entry QR, and ticket receipt will be sent to this email & phone.
      </p>
    </div>
  )
}

