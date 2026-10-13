import React from 'react'
import { formatINR, formatShowDate } from '../../utils/formatters'
import { ImageWithFallback } from '../common/ImageWithFallback'
import { MapPin, Calendar, Clock, Ticket, UtensilsCrossed, ShieldCheck, Tag } from 'lucide-react'

export function OrderSummary({
  movie,
  cinema,
  date,
  showtime,
  selectedSeats = [],
  fnbItems = [],
  pricing,
  appliedCoupon,
}) {
  if (!movie) return null

  const activeFnbItems = (fnbItems || []).filter((item) => item.quantity > 0)
  const seatLabels = selectedSeats.map((s) => s.label).join(', ')

  return (
    <div className="rounded-2xl bg-steel/20 border border-steel/30 p-5 text-mint space-y-5">
      <h3 className="font-bold text-base text-mint border-b border-steel/20 pb-3">
        Booking Summary
      </h3>

      {/* Movie & Cinema Info */}
      <div className="flex gap-3">
        <div className="w-16 h-24 rounded-lg overflow-hidden shrink-0 bg-navy-dark border border-steel/30">
          <ImageWithFallback
            src={movie.posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-sm text-mint truncate">{movie.title}</h4>
          <span className="text-[11px] text-mint/60 block mt-0.5">
            {movie.languages?.[0]} • {movie.certification} • {showtime?.format || '2D'}
          </span>

          <div className="text-xs text-mint/80 mt-2 space-y-1">
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-aqua shrink-0" />
              <span className="truncate">{cinema?.name}</span>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-mint/60">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-aqua" />
                {date ? formatShowDate(date) : 'Today'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-aqua" />
                {showtime?.time}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Seats Breakdown */}
      <div className="p-3 rounded-xl bg-navy-dark/60 border border-steel/20 space-y-1.5 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Ticket className="w-3.5 h-3.5 text-aqua" />
            <span className="font-semibold text-mint">
              Seats ({selectedSeats.length}): {seatLabels}
            </span>
          </div>
          <span className="font-bold text-mint">{formatINR(pricing.ticketSubtotal)}</span>
        </div>
        <p className="text-[11px] text-mint/50 pl-5">
          {selectedSeats.map((s) => s.tierName).filter((v, i, a) => a.indexOf(v) === i).join(', ')} • {showtime?.screen || 'Audi 1'}
        </p>
      </div>

      {/* F&B Items Breakdown (if any) */}
      {activeFnbItems.length > 0 && (
        <div className="p-3 rounded-xl bg-navy-dark/60 border border-steel/20 space-y-2 text-xs">
          <div className="flex items-center justify-between font-semibold text-mint">
            <div className="flex items-center gap-1.5">
              <UtensilsCrossed className="w-3.5 h-3.5 text-amber-300" />
              <span>Concession Snacks ({activeFnbItems.reduce((acc, i) => acc + i.quantity, 0)})</span>
            </div>
            <span className="font-bold text-aqua">{formatINR(pricing.foodSubtotal)}</span>
          </div>

          <div className="space-y-1 pl-5 pt-1 divide-y divide-steel/15 text-[11px]">
            {activeFnbItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-1 text-mint/70">
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span>{formatINR(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Price Calculations Table */}
      <div className="space-y-2 text-xs pt-2 border-t border-steel/20">
        <div className="flex items-center justify-between text-mint/70">
          <span>Tickets Subtotal</span>
          <span>{formatINR(pricing.ticketSubtotal)}</span>
        </div>

        {pricing.foodSubtotal > 0 && (
          <div className="flex items-center justify-between text-mint/70">
            <span>Food & Beverages</span>
            <span>{formatINR(pricing.foodSubtotal)}</span>
          </div>
        )}

        <div className="flex items-center justify-between text-mint/70">
          <span>Convenience Fees</span>
          <span>{formatINR(pricing.convenienceFee)}</span>
        </div>

        <div className="flex items-center justify-between text-mint/70">
          <span>Integrated GST (18%)</span>
          <span>{formatINR(pricing.gst)}</span>
        </div>

        {pricing.couponDiscount > 0 && (
          <div className="flex items-center justify-between text-emerald-400 font-semibold">
            <span className="flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" />
              Promo Discount ({appliedCoupon?.code})
            </span>
            <span>- {formatINR(pricing.couponDiscount)}</span>
          </div>
        )}
      </div>

      {/* Grand Total */}
      <div className="p-3.5 rounded-xl bg-navy-dark border border-steel/30 flex items-center justify-between">
        <div>
          <span className="text-[11px] text-mint/60 block uppercase tracking-wider font-semibold">
            Total Amount Payable
          </span>
          <span className="text-xl font-black text-mint">
            {formatINR(pricing.finalAmount)}
          </span>
        </div>
        <span className="text-[10px] text-mint/50 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-aqua" />
          Safe Demo Checkout
        </span>
      </div>
    </div>
  )
}

