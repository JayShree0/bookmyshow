import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBooking } from '../context/BookingContext'
import { isValidEmail, isValidPhone, isValidUPI } from '../utils/validation'
import { formatINR } from '../utils/formatters'
import { BookingTimer } from '../components/checkout/BookingTimer'
import { OrderSummary } from '../components/checkout/OrderSummary'
import { CouponSection } from '../components/checkout/CouponSection'
import { ContactForm } from '../components/checkout/ContactForm'
import { PaymentTabs } from '../components/checkout/PaymentTabs'
import { DemoFailureToggle } from '../components/checkout/DemoFailureToggle'
import { Modal } from '../components/common/Modal'
import { Button } from '../components/common/Button'
import { ArrowLeft, Lock, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react'

export function CheckoutPage() {
  const navigate = useNavigate()
  const {
    bookingSession,
    pricing,
    isProcessingPayment,
    updateContactDetails,
    setPaymentMethod,
    applyCouponCode,
    removeCoupon,
    toggleSimulateFailure,
    restartHoldTimer,
    processSimulatedPayment,
    showToast,
  } = useBooking()

  const {
    movie,
    selectedCinema,
    selectedDate,
    selectedShowtime,
    selectedSeats = [],
    fnbItems = [],
    appliedCoupon,
    contactDetails,
    paymentMethod = 'upi',
    countdownSeconds,
    isExpired,
    simulatePaymentFailure,
    upiId,
    cardDetails,
    bankName,
  } = bookingSession

  // Payment failure modal state
  const [failureModal, setFailureModal] = useState({ isOpen: false, error: '' })

  // Route guard: must have movie and seats
  useEffect(() => {
    if (!movie || selectedSeats.length === 0) {
      navigate('/booking/seats')
    }
  }, [movie, selectedSeats, navigate])

  if (!movie || selectedSeats.length === 0) return null

  const handlePay = async () => {
    // 1. Validate countdown hold
    if (isExpired || countdownSeconds <= 0) {
      showToast('Your seat hold session has expired. Please restart hold or reselect seats.', 'warning')
      return
    }

    // 2. Validate Contact Details
    if (!contactDetails?.email || !isValidEmail(contactDetails.email)) {
      showToast('Please enter a valid email address for your digital ticket.', 'warning')
      return
    }
    if (!contactDetails?.phone || !isValidPhone(contactDetails.phone)) {
      showToast('Please enter a valid 10-digit mobile number.', 'warning')
      return
    }

    // 3. Validate Payment Details
    if (paymentMethod === 'upi' && !isValidUPI(upiId)) {
      showToast('Please enter a valid UPI ID (e.g. rohan@okhdfcbank).', 'warning')
      return
    }

    // 4. Process Payment
    const result = await processSimulatedPayment()

    if (result.success) {
      navigate(`/booking/confirmation/${result.bookingId}`)
    } else {
      setFailureModal({
        isOpen: true,
        error: result.error || 'Simulated transaction could not be completed.',
      })
    }
  }

  return (
    <div className="space-y-6 pb-20 max-w-6xl mx-auto">
      {/* 1. Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-steel/20 border border-steel/30 text-mint">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/booking/food')}
            className="p-2 rounded-xl bg-navy-dark hover:bg-steel/30 border border-steel/30 text-mint transition-colors shrink-0"
            aria-label="Back to food & beverages"
            title="Back to food & beverages"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <h1 className="text-lg sm:text-xl font-black text-mint tracking-tight">
              Order Review & Payment
            </h1>
            <p className="text-xs text-mint/60 mt-0.5">
              Review your ticket items, apply coupon codes, and select payment method
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-aqua bg-aqua/10 border border-aqua/30 px-3 py-1.5 rounded-xl font-semibold self-start sm:self-auto shrink-0">
          <Lock className="w-3.5 h-3.5" />
          <span>256-Bit SSL Demo Sandbox</span>
        </div>
      </div>

      {/* 2. Hold Countdown Timer */}
      <BookingTimer
        secondsRemaining={countdownSeconds}
        isExpired={isExpired}
        onRestart={restartHoldTimer}
      />

      {/* 3. Main Grid: Left (Forms & Payments) | Right (Summary) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Contact Details */}
          <ContactForm
            contactDetails={contactDetails}
            onChange={updateContactDetails}
          />

          {/* Offers & Coupons */}
          <CouponSection
            appliedCoupon={appliedCoupon}
            onApplyCoupon={applyCouponCode}
            onRemoveCoupon={removeCoupon}
          />

          {/* Payment Method Tabs */}
          <PaymentTabs
            paymentMethod={paymentMethod}
            onSelectMethod={setPaymentMethod}
            upiId={upiId}
            onChangeUpi={(val) =>
              updateContactDetails({ upiId: val }) // updates local field
            }
            cardDetails={cardDetails}
            onChangeCard={(updates) =>
              updateContactDetails({ cardDetails: { ...cardDetails, ...updates } })
            }
            bankName={bankName}
            onChangeBank={(val) =>
              updateContactDetails({ bankName: val })
            }
          />

          {/* QA Failure Simulation Toggle */}
          <DemoFailureToggle
            isFailureSimulated={simulatePaymentFailure}
            onToggle={toggleSimulateFailure}
          />
        </div>

        {/* Right Column: Order Summary & Pay Button (5 cols) */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
          <OrderSummary
            movie={movie}
            cinema={selectedCinema}
            date={selectedDate}
            showtime={selectedShowtime}
            selectedSeats={selectedSeats}
            fnbItems={fnbItems}
            pricing={pricing}
            appliedCoupon={appliedCoupon}
          />

          {/* Main Pay CTA */}
          <Button
            variant="crimson"
            size="lg"
            isLoading={isProcessingPayment}
            disabled={isProcessingPayment || isExpired}
            onClick={handlePay}
            className="w-full text-base font-extrabold shadow-xl shadow-crimson/30 py-3.5"
          >
            {isProcessingPayment
              ? 'Verifying Demo Payment...'
              : `Pay ${formatINR(pricing.finalAmount)}`}
          </Button>

          <p className="text-[11px] text-center text-mint/50 leading-relaxed">
            By proceeding, you confirm this is a demo booking simulation. No real money will be debited.
          </p>
        </div>
      </div>

      {/* Simulated Payment Failure Modal with Safe Retry */}
      <Modal
        isOpen={failureModal.isOpen}
        onClose={() => setFailureModal({ isOpen: false, error: '' })}
        title="Transaction Declined (Demo)"
        subtitle="Simulated Gateway Failure Scenario"
        maxWidth="max-w-md"
      >
        <div className="py-4 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-crimson/20 border border-crimson text-crimson flex items-center justify-center mx-auto">
            <AlertTriangle className="w-7 h-7" />
          </div>

          <p className="text-sm text-mint/80">{failureModal.error}</p>

          <div className="p-3 rounded-xl bg-navy-dark text-xs text-mint/60 border border-steel/30 text-left space-y-1">
            <p><strong>Note for QA:</strong> You have the test failure toggle turned ON.</p>
            <p>Your seats are still held. Uncheck the failure toggle to simulate a successful payment.</p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                toggleSimulateFailure(false)
                setFailureModal({ isOpen: false, error: '' })
              }}
            >
              Disable Failure Toggle
            </Button>
            <Button
              variant="crimson"
              size="sm"
              onClick={() => setFailureModal({ isOpen: false, error: '' })}
            >
              Try Again
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
