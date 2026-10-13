import React, { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useBooking } from '../context/BookingContext'
import { DigitalTicket } from '../components/ticket/DigitalTicket'
import { TicketActions } from '../components/ticket/TicketActions'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '../components/common/Button'

export function ConfirmationPage() {
  const { bookingId } = useParams()
  const navigate = useNavigate()
  const { myBookings, bookingSession } = useBooking()

  // Find booking either in myBookings or in current bookingSession
  const booking = useMemo(() => {
    const foundInHistory = myBookings.find((b) => b.bookingId === bookingId)
    if (foundInHistory) return foundInHistory
    if (bookingSession.lastConfirmedBooking?.bookingId === bookingId) {
      return bookingSession.lastConfirmedBooking
    }
    return null
  }, [bookingId, myBookings, bookingSession.lastConfirmedBooking])

  if (!booking) {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto">
        <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-mint">Booking Not Found</h2>
        <p className="text-sm text-mint/60">
          We could not find booking reference &ldquo;{bookingId}&rdquo;. You can review your confirmed tickets in My Bookings.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button variant="steel" onClick={() => navigate('/my-bookings')}>
            View My Bookings
          </Button>
          <Button variant="crimson" onClick={() => navigate('/')}>
            Go to Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-20 max-w-4xl mx-auto">
      {/* 1. Success Banner Header */}
      <div className="text-center space-y-3 pt-4 no-print">
        <div className="inline-flex p-3 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-lg shadow-emerald-500/10 animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <span className="text-xs font-black uppercase tracking-widest text-aqua block">
            Payment Successful
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-mint tracking-tight">
            Booking Confirmed!
          </h1>
        </div>

        <p className="text-xs sm:text-sm text-mint/70 max-w-lg mx-auto">
          Your digital entry pass has been generated. An M-Ticket confirmation has been sent to{' '}
          <strong className="text-mint">{booking.contactDetails?.email || 'your email'}</strong> and{' '}
          <strong className="text-mint">+91 {booking.contactDetails?.phone || ''}</strong>.
        </p>
      </div>

      {/* 2. Full Digital Ticket Boarding Pass */}
      <div>
        <DigitalTicket booking={booking} />
      </div>

      {/* 3. Action Buttons */}
      <div>
        <TicketActions booking={booking} />
      </div>
    </div>
  )
}
