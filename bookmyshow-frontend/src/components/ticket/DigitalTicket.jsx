import { formatINR, formatShowDate } from '../../utils/formatters'
import { ImageWithFallback } from '../common/ImageWithFallback'
import {
  Ticket,
  MapPin,
  Calendar,
  QrCode,
  UtensilsCrossed,
} from 'lucide-react'

export function DigitalTicket({ booking }) {
  if (!booking) return null

  const {
    bookingId,
    movie,
    cinema,
    date,
    showtime,
    seats = [],
    fnbItems = [],
    pricing = {},
    paymentMethod,
    contactDetails,
    createdAt,
  } = booking

  const activeFnbItems = (fnbItems || []).filter((i) => i.quantity > 0)
  const seatLabels = seats.map((s) => s.label).join(', ')

  return (
    <div className="w-full max-w-2xl mx-auto rounded-3xl bg-steel/20 border-2 border-steel/40 text-mint shadow-2xl overflow-hidden print-ticket-container relative">
      {/* Top Header Ticket Band */}
      <div className="bg-gradient-to-r from-navy-dark via-steel/40 to-navy-dark p-6 border-b border-steel/30 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-crimson flex items-center justify-center shadow-md">
            <Ticket className="w-5 h-5 text-mint rotate-45 fill-current" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-aqua">
              Official M-Ticket
            </span>
            <h3 className="font-extrabold text-base tracking-tight text-mint">
              BookMyShow Entry Pass
            </h3>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-mint/60 uppercase tracking-widest block">
            Booking ID
          </span>
          <span className="font-mono font-bold text-sm text-aqua">
            {bookingId}
          </span>
        </div>
      </div>

      {/* Main Ticket Body */}
      <div className="p-6 sm:p-8 space-y-6">
        {/* Movie Info Grid */}
        <div className="flex flex-col sm:flex-row gap-5 items-start">
          <div className="w-24 h-36 sm:w-28 sm:h-40 rounded-xl overflow-hidden bg-navy-dark border border-steel/40 shrink-0 shadow-lg">
            <ImageWithFallback
              src={movie?.posterUrl}
              alt={movie?.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-crimson text-[10px] font-bold text-mint">
                {movie?.certification}
              </span>
              <span className="px-2 py-0.5 rounded bg-steel/40 text-[10px] font-bold text-aqua">
                {showtime?.format || '2D'}
              </span>
              <span className="text-xs text-mint/60">{movie?.duration}</span>
              <span className="text-xs text-mint/60">•</span>
              <span className="text-xs text-mint/60">{movie?.languages?.[0]}</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-mint tracking-tight">
              {movie?.title}
            </h2>

            <div className="space-y-1 text-xs text-mint/80 pt-1">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-aqua shrink-0" />
                <span className="font-semibold text-mint">{cinema?.name}</span>
              </div>
              <p className="text-[11px] text-mint/60 pl-6">{cinema?.address}</p>
            </div>
          </div>
        </div>

        {/* Date, Time, Screen & Seats Information Blocks */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-navy-dark/70 border border-steel/30 text-center">
          <div className="p-2 border-r border-steel/20 last:border-r-0">
            <span className="text-[10px] font-semibold text-mint/50 uppercase tracking-wider block">
              Date
            </span>
            <span className="font-bold text-sm text-mint block mt-1">
              {date ? formatShowDate(date) : 'Today'}
            </span>
          </div>

          <div className="p-2 sm:border-r border-steel/20">
            <span className="text-[10px] font-semibold text-mint/50 uppercase tracking-wider block">
              Time
            </span>
            <span className="font-bold text-sm text-aqua block mt-1">
              {showtime?.time}
            </span>
          </div>

          <div className="p-2 border-r border-steel/20 last:border-r-0">
            <span className="text-[10px] font-semibold text-mint/50 uppercase tracking-wider block">
              Auditorium
            </span>
            <span className="font-bold text-sm text-mint block mt-1 truncate">
              {showtime?.screen || 'Audi 1'}
            </span>
          </div>

          <div className="p-2">
            <span className="text-[10px] font-semibold text-mint/50 uppercase tracking-wider block">
              Seats ({seats.length})
            </span>
            <span className="font-black text-sm text-crimson block mt-1">
              {seatLabels}
            </span>
          </div>
        </div>

        {/* F&B Items (if ordered) */}
        {activeFnbItems.length > 0 && (
          <div className="p-3.5 rounded-xl bg-navy-dark/40 border border-steel/20 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-aqua mb-2">
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>Concession Refreshments Pre-ordered:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {activeFnbItems.map((item) => (
                <span
                  key={item.id}
                  className="px-2.5 py-1 rounded-lg bg-steel/30 border border-steel/40 text-[11px] text-mint"
                >
                  {item.name} × <strong>{item.quantity}</strong>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Perforation Line Treatment */}
        <div className="relative my-4 flex items-center justify-between">
          <div className="w-6 h-6 rounded-full bg-navy -ml-10 border-r border-steel/40 shrink-0" />
          <div className="flex-1 border-t-2 border-dashed border-steel/40 mx-2" />
          <div className="w-6 h-6 rounded-full bg-navy -mr-10 border-l border-steel/40 shrink-0" />
        </div>

        {/* Payment Summary & Entry Barcode */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-2">
          {/* Barcode Graphic */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <div className="flex items-center gap-3">
              {/* Demo QR */}
              <div className="w-20 h-20 bg-mint rounded-xl p-1.5 flex flex-col items-center justify-center shrink-0 shadow">
                <QrCode className="w-full h-full text-navy" />
              </div>

              {/* Barcode Lines */}
              <div className="space-y-1">
                <div className="h-9 w-28 bg-mint/80 rounded flex items-center justify-around px-1">
                  {[4, 2, 6, 2, 5, 3, 2, 6, 4, 2, 7, 3, 2, 5, 2, 4].map(
                    (w, i) => (
                      <span
                        key={i}
                        className="bg-navy h-7"
                        style={{ width: `${w}px` }}
                      />
                    )
                  )}
                </div>
                <span className="font-mono text-[9px] text-mint/50 tracking-widest block text-center">
                  SCAN FOR ENTRY
                </span>
              </div>
            </div>
            <span className="text-[10px] text-mint/40 mt-1.5">
              Show this barcode at the cinema usher desk for contactless entry.
            </span>
          </div>

          {/* Amount Paid Breakdown */}
          <div className="w-full sm:w-auto p-4 rounded-xl bg-navy-dark/80 border border-steel/30 text-right sm:min-w-[200px]">
            <span className="text-[10px] uppercase font-bold text-mint/50 tracking-wider block">
              Total Amount Paid
            </span>
            <span className="text-2xl font-black text-mint block mt-0.5">
              {formatINR(pricing?.finalAmount || 0)}
            </span>
            <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold uppercase">
              Paid via {paymentMethod || 'UPI'}
            </span>
          </div>
        </div>

        {/* Footer info & Confirmation */}
        <div className="pt-3 border-t border-steel/20 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-mint/50">
          <span>Sent to: {contactDetails?.email || 'Guest'}</span>
          <span>Booked on: {createdAt ? new Date(createdAt).toLocaleDateString() : 'Today'}</span>
        </div>
      </div>
    </div>
  )
}

