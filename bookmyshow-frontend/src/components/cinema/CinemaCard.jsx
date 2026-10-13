import React from 'react'
import { ShowtimeChip } from './ShowtimeChip'
import { MapPin, Smartphone, UtensilsCrossed, Accessibility, Volume2 } from 'lucide-react'

export function CinemaCard({
  cinema,
  showtimes = [],
  selectedShowtime,
  onSelectShowtime,
}) {
  if (!cinema) return null

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-steel/20 border border-steel/30 hover:border-steel/60 transition-all text-mint space-y-4">
      {/* Top Details */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-base text-mint tracking-tight">
              {cinema.name}
            </h4>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-mint/60 mt-1">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-aqua" />
              {cinema.area}
            </span>
            {cinema.distance && (
              <>
                <span>•</span>
                <span>{cinema.distance}</span>
              </>
            )}
            {cinema.priceRange && (
              <>
                <span>•</span>
                <span className="text-aqua font-medium">{cinema.priceRange}</span>
              </>
            )}
          </div>
        </div>

        {/* Amenity Badges */}
        <div className="flex items-center gap-2 text-xs">
          {cinema.hasMTicket && (
            <span
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-navy-dark/60 border border-steel/30 text-mint/80 text-[11px]"
              title="M-Ticket available (Contactless entry)"
            >
              <Smartphone className="w-3 h-3 text-aqua" />
              <span>M-Ticket</span>
            </span>
          )}

          {cinema.hasFnB && (
            <span
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-navy-dark/60 border border-steel/30 text-mint/80 text-[11px]"
              title="Food & Beverages available"
            >
              <UtensilsCrossed className="w-3 h-3 text-amber-300" />
              <span>F&B</span>
            </span>
          )}

          {cinema.hasWheelchair && (
            <span
              className="p-1 rounded-lg bg-navy-dark/60 border border-steel/30 text-mint/70"
              title="Wheelchair accessible"
            >
              <Accessibility className="w-3.5 h-3.5 text-aqua" />
            </span>
          )}

          {cinema.hasDolbyAtmos && (
            <span
              className="p-1 rounded-lg bg-navy-dark/60 border border-steel/30 text-mint/70"
              title="Dolby Atmos sound"
            >
              <Volume2 className="w-3.5 h-3.5 text-aqua" />
            </span>
          )}
        </div>
      </div>

      {/* Showtimes row */}
      <div className="pt-2 border-t border-steel/20">
        <span className="block text-[11px] font-semibold text-mint/50 uppercase tracking-wider mb-2">
          Available Showtimes
        </span>
        <div className="flex flex-wrap items-center gap-2.5">
          {showtimes.map((st) => (
            <ShowtimeChip
              key={st.id}
              showtime={st}
              isSelected={selectedShowtime && selectedShowtime.id === st.id}
              onSelect={(show) => onSelectShowtime(show, cinema)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

