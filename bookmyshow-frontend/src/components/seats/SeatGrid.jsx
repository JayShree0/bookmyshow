import React from 'react'
import { SEAT_TIERS } from '../../data/seats'
import { formatINR } from '../../utils/formatters'

export function SeatGrid({
  rows = [],
  selectedSeats = [],
  onToggleSeat,
}) {
  const isSelected = (seatId) => selectedSeats.some((s) => s.id === seatId)

  // Group rows by tier for clear section headers
  const vipRows = rows.filter((r) => r.tierId === 'vip')
  const primeRows = rows.filter((r) => r.tierId === 'prime')
  const classicRows = rows.filter((r) => r.tierId === 'classic')

  const renderTierGroup = (tier, tierRows) => {
    if (tierRows.length === 0) return null

    return (
      <div key={tier.id} className="space-y-2.5 pt-4 first:pt-0">
        {/* Tier Header with Price */}
        <div className="flex items-center justify-between border-b border-steel/20 pb-1 px-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-mint tracking-wide">{tier.name}</span>
            <span className="text-[11px] text-mint/50 hidden sm:inline">
              ({tier.description})
            </span>
          </div>
          <span className="font-bold text-aqua">{formatINR(tier.price)}</span>
        </div>

        {/* Rows */}
        <div className="space-y-1.5">
          {tierRows.map((rowObj) => {
            const leftSeats = rowObj.seats.filter((s) => s.section === 'left')
            const centerSeats = rowObj.seats.filter((s) => s.section === 'center')
            const rightSeats = rowObj.seats.filter((s) => s.section === 'right')

            return (
              <div
                key={rowObj.rowLetter}
                className="flex items-center justify-center gap-2 sm:gap-4 select-none"
              >
                {/* Row Letter Left */}
                <span className="w-5 text-center text-xs font-bold text-mint/50 shrink-0">
                  {rowObj.rowLetter}
                </span>

                {/* Left Block */}
                <div className="flex items-center gap-1 sm:gap-1.5">
                  {leftSeats.map((seat) => renderSeatButton(seat))}
                </div>

                {/* Aisle Divider */}
                <div className="w-3 sm:w-6" />

                {/* Center Block */}
                <div className="flex items-center gap-1 sm:gap-1.5">
                  {centerSeats.map((seat) => renderSeatButton(seat))}
                </div>

                {/* Aisle Divider */}
                <div className="w-3 sm:w-6" />

                {/* Right Block */}
                <div className="flex items-center gap-1 sm:gap-1.5">
                  {rightSeats.map((seat) => renderSeatButton(seat))}
                </div>

                {/* Row Letter Right */}
                <span className="w-5 text-center text-xs font-bold text-mint/50 shrink-0">
                  {rowObj.rowLetter}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderSeatButton = (seat) => {
    const selected = isSelected(seat.id)
    const occupied = seat.isOccupied

    let statusStyle = 'bg-steel/20 border-steel/50 hover:border-aqua hover:bg-steel/40 text-mint'
    if (occupied) {
      statusStyle = 'bg-navy-dark/40 border-steel/20 text-mint/20 cursor-not-allowed opacity-40'
    } else if (selected) {
      statusStyle =
        'bg-crimson border-crimson text-mint font-bold shadow-md shadow-crimson/30 scale-105 ring-1 ring-mint/50'
    }

    return (
      <button
        key={seat.id}
        type="button"
        disabled={occupied}
        onClick={() => onToggleSeat(seat)}
        aria-label={`Seat ${seat.label}, ${seat.tierName}, ₹${seat.price}, ${
          occupied ? 'Occupied' : selected ? 'Selected' : 'Available'
        }`}
        className={`w-6 h-6 sm:w-7 sm:h-7 rounded-md border text-[10px] sm:text-xs font-medium flex items-center justify-center transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-aqua ${statusStyle}`}
      >
        {selected ? '✓' : seat.number}
      </button>
    )
  }

  return (
    <div className="w-full">
      <p className="text-[11px] text-mint/40 text-center sm:hidden mb-2">
        Swipe horizontally to view all seats in the auditorium
      </p>
      <div className="w-full overflow-x-auto pb-6 pt-2 scrollbar-thin touch-pan-x overscroll-x-contain">
        <div className="min-w-[560px] sm:min-w-[680px] mx-auto space-y-6">
          {renderTierGroup(SEAT_TIERS.VIP, vipRows)}
          {renderTierGroup(SEAT_TIERS.PRIME, primeRows)}
          {renderTierGroup(SEAT_TIERS.CLASSIC, classicRows)}
        </div>
      </div>
    </div>
  )
}

