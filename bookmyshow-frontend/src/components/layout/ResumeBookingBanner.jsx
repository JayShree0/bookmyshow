import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useBooking } from '../../context/BookingContext'
import { formatCountdown } from '../../utils/formatters'
import { Clock, ArrowRight, X } from 'lucide-react'

export function ResumeBookingBanner() {
  const { bookingSession, hasActiveBooking, resetBookingSession } = useBooking()
  const navigate = useNavigate()
  const location = useLocation()

  // Do not show banner if user is already inside the booking flow pages
  const isBookingPage = location.pathname.startsWith('/booking/')
  if (!hasActiveBooking || isBookingPage || !bookingSession.movie) return null

  const getResumePath = () => {
    if (bookingSession.selectedSeats && bookingSession.selectedSeats.length > 0) {
      if (bookingSession.step === 'checkout') return '/booking/checkout'
      if (bookingSession.step === 'fnb') return '/booking/food'
      return '/booking/seats'
    }
    return `/movies/${bookingSession.movie.id}`
  }

  return (
    <div className="bg-gradient-to-r from-crimson/90 via-navy-card to-steel/90 text-mint border-b border-crimson/40 px-4 py-2.5 text-xs shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-hidden">
          <Clock className="w-4 h-4 text-aqua shrink-0 animate-pulse" />
          <span className="font-semibold text-mint truncate">
            Booking in progress for <strong className="text-aqua">{bookingSession.movie.title}</strong>
          </span>
          <span className="hidden sm:inline text-mint/60">•</span>
          <span className="hidden sm:inline font-mono text-aqua font-medium">
            {formatCountdown(bookingSession.countdownSeconds)} remaining
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => navigate(getResumePath())}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-crimson hover:bg-crimson-hover text-mint font-semibold text-xs shadow transition-all"
          >
            <span>Resume</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={resetBookingSession}
            className="p-1 rounded text-mint/60 hover:text-mint transition-colors"
            title="Discard current booking"
            aria-label="Discard current booking"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

