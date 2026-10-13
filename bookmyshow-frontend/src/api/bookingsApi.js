import apiClient from './client'
import { normalizeMovie } from './moviesApi'
import { normalizeTheater } from './theatersApi'
import { formatTimeFromISO } from './showsApi'

export function normalizeBooking(b) {
  if (!b) return null

  const bookingId = b.bookingNumber || `BMS-${b.id}`
  const movie = b.show?.movie ? normalizeMovie(b.show.movie) : null
  const cinema = b.show?.screen?.theater ? normalizeTheater(b.show.screen.theater) : null
  const startTime = b.show?.startTime

  const seats = Array.isArray(b.seats)
    ? b.seats.map((s) => ({
        id: String(s.id),
        showSeatId: s.id,
        label: s.seat?.seatNumber || `${s.seat?.rowName || 'A'}${s.seat?.colNumber || '1'}`,
        price: s.price || 200,
        row: s.seat?.rowName || 'A',
        number: s.seat?.colNumber || 1,
        tierName: s.seat?.seatType || 'STANDARD',
      }))
    : []

  const dateStr = startTime ? startTime.split('T')[0] : new Date().toISOString().split('T')[0]
  const timeStr = formatTimeFromISO(startTime)

  return {
    ...b,
    id: b.id,
    bookingId,
    bookingNumber: bookingId,
    createdAt: b.bookingTime || new Date().toISOString(),
    movie,
    cinema,
    date: dateStr,
    showtime: {
      time: timeStr,
      format: b.show?.showFormat || '2D',
      screen: b.show?.screen?.name || 'Audi 1',
    },
    seats,
    ticketCount: seats.length,
    fnbItems: [],
    pricing: {
      ticketSubtotal: b.baseAmount || b.totalAmount || 0,
      foodSubtotal: 0,
      subtotal: b.baseAmount || b.totalAmount || 0,
      convenienceFee: b.convenienceFee || 0,
      taxes: b.taxAmount || 0,
      discount: b.discountAmount || 0,
      grandTotal: b.totalAmount || 0,
    },
    paymentMethod: b.payment?.paymentMethod || 'UPI',
    contactDetails: {
      email: b.user?.email || 'customer@example.com',
      phone: b.user?.phoneNumber || '9876543210',
    },
    status: b.status || 'CONFIRMED',
  }
}

export const bookingsApi = {
  calculatePrice: async (seatIds, couponCode) => {
    return apiClient.post('/bookings/calculate-price', {
      seatIds: seatIds.map(Number),
      couponCode: couponCode || null,
    })
  },

  createBooking: async (bookingRequest, idempotencyKey = null) => {
    const headers = idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}
    const res = await apiClient.post('/bookings', bookingRequest, { headers })
    return normalizeBooking(res)
  },

  getMyBookings: async () => {
    const list = await apiClient.get('/bookings/my-bookings')
    return Array.isArray(list) ? list.map(normalizeBooking) : []
  },

  getBookingById: async (id) => {
    const b = await apiClient.get(`/bookings/${id}`)
    return normalizeBooking(b)
  },

  getBookingByNumber: async (bookingNumber) => {
    const b = await apiClient.get(`/bookings/number/${bookingNumber}`)
    return normalizeBooking(b)
  },

  cancelBooking: async (id, reason = 'Customer requested cancellation') => {
    const b = await apiClient.post(`/bookings/${id}/cancel`, { reason })
    return normalizeBooking(b)
  },
}

export default bookingsApi

