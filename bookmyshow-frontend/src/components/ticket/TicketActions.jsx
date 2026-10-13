import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Printer, Share2, Calendar, Ticket, Film } from 'lucide-react'
import { Button } from '../common/Button'
import { useBooking } from '../../context/BookingContext'

export function TicketActions({ booking }) {
  const navigate = useNavigate()
  const { resetBookingSession } = useBooking()

  if (!booking) return null

  const handlePrint = () => {
    window.print()
  }

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `🍿 Movie Booking Confirmed!\n\nMovie: ${booking.movie?.title}\nCinema: ${booking.cinema?.name}\nDate & Time: ${booking.date} at ${booking.showtime?.time}\nSeats: ${booking.seats?.map((s) => s.label).join(', ')}\nBooking ID: ${booking.bookingId}\n\nBooked on BookMyShow (Demo)`
    )
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank')
  }

  const handleGoogleCalendar = () => {
    const title = encodeURIComponent(`Movie: ${booking.movie?.title} at ${booking.cinema?.name}`)
    const details = encodeURIComponent(
      `Tickets: ${booking.seats?.map((s) => s.label).join(', ')}\nBooking ID: ${booking.bookingId}`
    )
    const location = encodeURIComponent(booking.cinema?.name || '')
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`
    window.open(url, '_blank')
  }

  const handleBookAnother = () => {
    resetBookingSession()
    navigate('/')
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 no-print max-w-xl mx-auto pt-2">
      <Button
        variant="aqua"
        size="md"
        icon={Printer}
        onClick={handlePrint}
      >
        Print / Save PDF
      </Button>

      <Button
        variant="outline"
        size="md"
        icon={Share2}
        onClick={handleWhatsAppShare}
      >
        Share on WhatsApp
      </Button>

      <Button
        variant="outline"
        size="md"
        icon={Calendar}
        onClick={handleGoogleCalendar}
      >
        Add to Calendar
      </Button>

      <Button
        variant="steel"
        size="md"
        icon={Ticket}
        onClick={() => navigate('/my-bookings')}
      >
        My Bookings
      </Button>

      <Button
        variant="crimson"
        size="md"
        icon={Film}
        onClick={handleBookAnother}
      >
        Book Another Movie
      </Button>
    </div>
  )
}

