import React, { useState } from 'react'
import { QrCode, CreditCard, Building, ShieldAlert, Check, Sparkles } from 'lucide-react'

export function PaymentTabs({
  paymentMethod = 'upi',
  onSelectMethod,
  upiId = '',
  onChangeUpi,
  cardDetails = {},
  onChangeCard,
  bankName = 'HDFC Bank',
  onChangeBank,
}) {
  const [activeTab, setActiveTab] = useState(paymentMethod)

  const handleTabChange = (method) => {
    setActiveTab(method)
    onSelectMethod(method)
  }

  const demoBanks = [
    { id: 'hdfc', name: 'HDFC Bank', code: 'HDFC' },
    { id: 'icici', name: 'ICICI Bank', code: 'ICICI' },
    { id: 'sbi', name: 'State Bank of India', code: 'SBI' },
    { id: 'axis', name: 'Axis Bank', code: 'AXIS' },
  ]

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-steel/20 border border-steel/30 text-mint space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-sm text-mint">Select Payment Method</h4>
        <span className="text-[10px] text-aqua bg-aqua/10 px-2 py-0.5 rounded-full font-medium">
          Simulated Sandbox
        </span>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2 p-1 rounded-xl bg-navy-dark border border-steel/30">
        <button
          type="button"
          onClick={() => handleTabChange('upi')}
          className={`flex items-center justify-center gap-1 sm:gap-1.5 py-2 sm:py-2.5 px-1 sm:px-2 rounded-lg text-[11px] sm:text-xs font-bold transition-all ${
            activeTab === 'upi'
              ? 'bg-steel text-mint shadow'
              : 'text-mint/60 hover:text-mint'
          }`}
        >
          <QrCode className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">UPI / QR</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('card')}
          className={`flex items-center justify-center gap-1 sm:gap-1.5 py-2 sm:py-2.5 px-1 sm:px-2 rounded-lg text-[11px] sm:text-xs font-bold transition-all ${
            activeTab === 'card'
              ? 'bg-steel text-mint shadow'
              : 'text-mint/60 hover:text-mint'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Card</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('netbanking')}
          className={`flex items-center justify-center gap-1 sm:gap-1.5 py-2 sm:py-2.5 px-1 sm:px-2 rounded-lg text-[11px] sm:text-xs font-bold transition-all ${
            activeTab === 'netbanking'
              ? 'bg-steel text-mint shadow'
              : 'text-mint/60 hover:text-mint'
          }`}
        >
          <Building className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Net Banking</span>
        </button>
      </div>

      {/* UPI Tab */}
      {activeTab === 'upi' && (
        <div className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl bg-navy-dark/60 border border-steel/20">
            {/* Demo QR Visual */}
            <div className="w-24 h-24 bg-mint rounded-xl p-2 flex flex-col items-center justify-center shrink-0 shadow-md">
              <QrCode className="w-16 h-16 text-navy" />
              <span className="text-[8px] font-black tracking-widest text-navy uppercase mt-0.5">
                BMS UPI QR
              </span>
            </div>

            <div className="flex-1 space-y-2 text-center sm:text-left">
              <h5 className="font-bold text-xs text-mint">
                Scan with any UPI App or Enter UPI ID
              </h5>
              <p className="text-[11px] text-mint/60">
                Supports Google Pay, PhonePe, Paytm, CRED, and BHIM UPI apps.
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
                <span className="text-[10px] px-2 py-0.5 rounded bg-steel/30 text-aqua font-semibold">
                  GPay
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-steel/30 text-aqua font-semibold">
                  PhonePe
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-steel/30 text-aqua font-semibold">
                  Paytm
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs text-mint/70 mb-1 font-medium">
              Virtual Payment Address (UPI ID)
            </label>
            <input
              type="text"
              value={upiId}
              onChange={(e) => onChangeUpi(e.target.value)}
              placeholder="e.g. yourname@okhdfcbank"
              className="w-full bg-navy-dark border border-steel/40 text-mint text-xs sm:text-sm rounded-xl px-3.5 py-2.5 placeholder-mint/30 focus:outline-none focus:border-aqua"
            />
          </div>
        </div>
      )}

      {/* Credit / Debit Card Tab */}
      {activeTab === 'card' && (
        <div className="space-y-3 pt-2">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              <strong>Demo Interface Only:</strong> Never enter genuine credit card numbers. Realistic sample values are pre-filled below for demonstration purposes.
            </span>
          </div>

          <div>
            <label className="block text-xs text-mint/70 mb-1">Cardholder Name</label>
            <input
              type="text"
              value={cardDetails.cardHolder || ''}
              onChange={(e) => onChangeCard({ cardHolder: e.target.value })}
              placeholder="NAME ON CARD"
              className="w-full bg-navy-dark border border-steel/40 text-mint text-xs sm:text-sm rounded-xl px-3.5 py-2 uppercase placeholder-mint/30 focus:outline-none focus:border-aqua"
            />
          </div>

          <div>
            <label className="block text-xs text-mint/70 mb-1">Card Number</label>
            <input
              type="text"
              maxLength={19}
              value={cardDetails.cardNumber || ''}
              onChange={(e) => onChangeCard({ cardNumber: e.target.value })}
              placeholder="4532 8920 1289 4012"
              className="w-full bg-navy-dark border border-steel/40 text-mint text-xs sm:text-sm rounded-xl px-3.5 py-2 font-mono placeholder-mint/30 focus:outline-none focus:border-aqua"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-mint/70 mb-1">Expiry (MM/YY)</label>
              <input
                type="text"
                maxLength={5}
                value={cardDetails.expiry || ''}
                onChange={(e) => onChangeCard({ expiry: e.target.value })}
                placeholder="12/28"
                className="w-full bg-navy-dark border border-steel/40 text-mint text-xs sm:text-sm rounded-xl px-3.5 py-2 font-mono placeholder-mint/30 focus:outline-none focus:border-aqua"
              />
            </div>
            <div>
              <label className="block text-xs text-mint/70 mb-1">CVV</label>
              <input
                type="password"
                maxLength={4}
                value={cardDetails.cvv || ''}
                onChange={(e) => onChangeCard({ cvv: e.target.value })}
                placeholder="•••"
                className="w-full bg-navy-dark border border-steel/40 text-mint text-xs sm:text-sm rounded-xl px-3.5 py-2 font-mono placeholder-mint/30 focus:outline-none focus:border-aqua"
              />
            </div>
          </div>
        </div>
      )}

      {/* Net Banking Tab */}
      {activeTab === 'netbanking' && (
        <div className="space-y-3 pt-2">
          <label className="block text-xs text-mint/70 font-medium">
            Select Your Bank
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {demoBanks.map((bank) => {
              const isSelected = bankName === bank.name
              return (
                <button
                  key={bank.id}
                  type="button"
                  onClick={() => onChangeBank(bank.name)}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-steel/40 border-aqua text-mint shadow-md ring-1 ring-aqua'
                      : 'bg-navy-dark/60 border-steel/30 text-mint/80 hover:bg-steel/20'
                  }`}
                >
                  <div>
                    <span className="font-bold text-xs block">{bank.name}</span>
                    <span className="text-[10px] text-mint/50">{bank.code} NetBanking</span>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-aqua text-navy flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

