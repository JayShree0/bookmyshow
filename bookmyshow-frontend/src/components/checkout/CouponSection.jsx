import React, { useState } from 'react'
import { AVAILABLE_COUPONS } from '../../data/coupons'
import { Tag, Check, X, Sparkles } from 'lucide-react'

export function CouponSection({
  appliedCoupon,
  onApplyCoupon,
  onRemoveCoupon,
}) {
  const [inputCode, setInputCode] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const handleApply = (codeToApply) => {
    const code = codeToApply || inputCode
    if (!code.trim()) {
      setErrorMsg('Please enter a coupon code.')
      return
    }

    setErrorMsg('')
    const result = onApplyCoupon(code)
    if (!result.success) {
      setErrorMsg(result.message)
    } else {
      setInputCode('')
    }
  }

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-steel/20 border border-steel/30 text-mint space-y-4">
      <div className="flex items-center gap-2 text-sm font-bold text-mint">
        <Tag className="w-4 h-4 text-aqua" />
        <span>Offers & Promo Codes</span>
      </div>

      {appliedCoupon ? (
        <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="font-bold text-xs">{appliedCoupon.code} Applied</span>
              <p className="text-[11px] text-emerald-200/80 mt-0.5">
                {appliedCoupon.description}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onRemoveCoupon}
            className="p-1 rounded text-emerald-300 hover:text-crimson hover:bg-navy-dark/40 transition-colors"
            title="Remove Coupon"
            aria-label="Remove coupon"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputCode}
              onChange={(e) => {
                setInputCode(e.target.value.toUpperCase())
                setErrorMsg('')
              }}
              placeholder="Enter coupon code (e.g. BMS50)"
              className="flex-1 bg-navy-dark border border-steel/40 text-mint text-xs sm:text-sm rounded-xl px-3.5 py-2.5 uppercase placeholder-mint/30 focus:outline-none focus:border-aqua"
            />
            <button
              type="button"
              onClick={() => handleApply(inputCode)}
              className="px-5 py-2.5 rounded-xl bg-aqua hover:bg-aqua-hover text-navy text-xs font-bold transition-all shadow-sm active:scale-95"
            >
              Apply
            </button>
          </div>

          {errorMsg && (
            <p className="text-xs text-crimson font-medium">{errorMsg}</p>
          )}

          {/* Quick-apply chips */}
          <div className="space-y-2 pt-1">
            <span className="text-[11px] text-mint/60 font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-aqua" /> Available Offers:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {AVAILABLE_COUPONS.map((coupon) => (
                <button
                  key={coupon.code}
                  type="button"
                  onClick={() => handleApply(coupon.code)}
                  className="flex items-center justify-between p-2 rounded-xl bg-navy-dark/60 border border-steel/30 hover:border-aqua/60 hover:bg-steel/30 transition-all text-left group"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-aqua group-hover:text-mint">
                        {coupon.code}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-steel/40 text-mint/80 font-semibold">
                        {coupon.tag}
                      </span>
                    </div>
                    <p className="text-[10px] text-mint/60 truncate mt-0.5">
                      {coupon.description}
                    </p>
                  </div>
                  <span className="text-[10px] text-aqua group-hover:underline font-bold shrink-0">
                    Apply
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

