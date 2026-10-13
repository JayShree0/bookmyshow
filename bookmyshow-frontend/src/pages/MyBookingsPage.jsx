import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBooking } from '../context/BookingContext'
import { formatINR, formatShowDate } from '../utils/formatters'
import { ImageWithFallback } from '../components/common/ImageWithFallback'
import { EmptyState } from '../components/common/EmptyState'
import { Button } from '../components/common/Button'
import { Modal } from '../components/common/Modal'
import {
  Ticket,
  MapPin,
  Calendar,
  Clock,
  ArrowRight,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react'

export function MyBookingsPage() {
  const navigate = useNavigate()
  const { myBookings, cancelBooking } = useBooking()
  const [cancellingBookingId, setCancellingBookingId] = useState(null)

  const handleConfirmCancel = () => {
    if (cancellingBookingId) {
      cancelBooking(cancellingBookingId)
      setCancellingBookingId(null)
    }
  }

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto">
      {/* Header */}
      <div className="p-4 sm:p-5 rounded-2xl bg-steel/20 border border-steel/30 text-mint flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-aqua" />
            <h1 className="text-xl sm:text-2xl font-black text-mint tracking-tight">
              My Bookings
            </h1>
          </div>
          <p className="text-xs text-mint/60 mt-0.5">
            Your active and past cinema ticket reservations
          </p>
        </div>

        <span className="text-xs font-bold text-aqua bg-aqua/10 border border-aqua/30 px-3 py-1.5 rounded-xl">
          {myBookings.length} Total Bookings
        </span>
      </div>

      {/* Bookings List */}
      {myBookings.length > 0 ? (
        <div className="space-y-4">
          {myBookings.map((booking) => {
            const isCancelled = booking.status === 'CANCELLED'

            return (
              <div
                key={booking.bookingId}
                className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between ${
                  isCancelled
                    ? 'bg-navy-dark/40 border-steel/20 opacity-70'
                    : 'bg-steel/20 border-steel/30 hover:border-steel/60'
                }`}
              >
                {/* Movie & Cinema info */}
                <div className="flex gap-4 items-start">
                  <div className="w-16 h-24 rounded-xl overflow-hidden bg-navy-dark border border-steel/30 shrink-0">
                    <ImageWithFallback
                      src={booking.movie?.posterUrl}
                      alt={booking.movie?.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-mint">
                        {booking.movie?.title}
                      </h3>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isCancelled
                            ? 'bg-crimson/20 border border-crimson/40 text-crimson'
                            : 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>

                    <p className="text-xs text-mint/80 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-aqua" />
                      {booking.cinema?.name}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-mint/60 pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-aqua" />
                        {booking.date ? formatShowDate(booking.date) : 'Today'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-aqua font-semibold">
                        <Clock className="w-3.5 h-3.5" />
                        {booking.showtime?.time}
                      </span>
                      <span>•</span>
                      <span>Seats: <strong className="text-mint">{booking.seats?.map((s) => s.label).join(', ')}</strong></span>
                    </div>

                    <span className="text-[11px] font-mono text-mint/50 block">
                      Ref: {booking.bookingId}
                    </span>
                  </div>
                </div>

                {/* Amount & Actions */}
                <div className="w-full sm:w-auto flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 border-t sm:border-t-0 border-steel/20 pt-3 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-mint/50 uppercase tracking-wider block">
                      Amount Paid
                    </span>
                    <span className="text-lg font-black text-mint">
                      {formatINR(booking.pricing?.finalAmount || 0)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="aqua"
                      size="sm"
                      onClick={() => navigate(`/booking/confirmation/${booking.bookingId}`)}
                    >
                      View Ticket
                    </Button>

                    {!isCancelled && (
                      <button
                        type="button"
                        onClick={() => setCancellingBookingId(booking.bookingId)}
                        className="p-1.5 rounded-lg bg-steel/30 hover:bg-crimson/20 hover:text-crimson text-mint/60 transition-colors text-xs"
                        title="Cancel this booking"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <EmptyState
          icon={Ticket}
          title="No bookings yet"
          description="You haven't booked any cinema tickets yet. Explore the latest blockbusters and reserve your seats now."
          actionLabel="Browse Movies"
          onAction={() => navigate('/')}
        />
      )}

      {/* Cancellation Confirmation Dialog */}
      <Modal
        isOpen={!!cancellingBookingId}
        onClose={() => setCancellingBookingId(null)}
        title="Cancel Booking?"
        subtitle="Demo Cancellation & Refund Policy"
        maxWidth="max-w-md"
      >
        <div className="py-3 space-y-4 text-center">
          <div className="w-12 h-12 rounded-full bg-crimson/20 border border-crimson text-crimson flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <p className="text-xs sm:text-sm text-mint/80">
            Are you sure you want to cancel booking reference <strong>{cancellingBookingId}</strong>?
          </p>

          <div className="p-3 rounded-xl bg-navy-dark text-xs text-mint/60 border border-steel/30 text-left space-y-1">
            <p><strong>Demo Refund Note:</strong> 100% of your ticket and snacks subtotal will be instantly credited back to your demo source account.</p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCancellingBookingId(null)}
            >
              Keep Booking
            </Button>
            <Button
              variant="crimson"
              size="sm"
              onClick={handleConfirmCancel}
            >
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
