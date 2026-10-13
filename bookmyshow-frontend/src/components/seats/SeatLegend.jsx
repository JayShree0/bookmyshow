import React from 'react'
import { SEAT_TIERS } from '../../data/seats'
import { formatINR } from '../../utils/formatters'

export function SeatLegend() {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-4 rounded-xl bg-navy-dark/60 border border-steel/20 text-xs">
      {/* Status Legend */}
      <div className="flex items-center gap-4 sm:gap-6">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md border border-steel/70 bg-steel/20" />
          <span className="text-mint/70 text-[11px]">Available</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-crimson border border-crimson shadow-sm flex items-center justify-center text-[10px] text-mint font-bold">
            ✓
          </div>
          <span className="text-mint font-semibold text-[11px]">Selected</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-navy-dark border border-steel/20 opacity-40 cursor-not-allowed" />
          <span className="text-mint/40 text-[11px]">Occupied</span>
        </div>
      </div>

      {/* Tiers Pricing Legend */}
      <div className="flex items-center gap-3 text-[11px]">
        {Object.values(SEAT_TIERS).map((tier) => (
          <div key={tier.id} className="flex items-center gap-1.5">
            <span className="text-mint/60">{tier.name}:</span>
            <span className="font-bold text-aqua">{formatINR(tier.price)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

