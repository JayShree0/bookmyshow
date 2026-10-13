import React from 'react'
import { Badge } from '../common/Badge'

export function ShowtimeChip({ showtime, onSelect, isSelected = false }) {
  if (!showtime) return null

  const isSoldOut = showtime.status === 'sold_out'
  const isFillingFast = showtime.status === 'filling_fast'

  return (
    <button
      type="button"
      disabled={isSoldOut}
      onClick={() => !isSoldOut && onSelect(showtime)}
      className={`group relative flex flex-col items-center justify-center px-4 py-2 rounded-xl border transition-all duration-200 text-left min-w-[105px] ${
        isSoldOut
          ? 'bg-navy-dark/40 border-steel/20 text-mint/30 cursor-not-allowed opacity-60'
          : isSelected
          ? 'bg-aqua text-navy font-bold border-aqua shadow-md ring-2 ring-aqua/40'
          : 'bg-navy-dark/70 hover:bg-steel/30 border-steel/40 hover:border-aqua/70 text-mint'
      }`}
    >
      <div className="flex items-center gap-1.5">
        <span className="text-xs sm:text-sm font-bold tracking-tight">
          {showtime.time}
        </span>
      </div>

      <div className="flex items-center gap-1 mt-0.5">
        <span
          className={`text-[10px] font-semibold uppercase tracking-wider ${
            isSelected
              ? 'text-navy/80'
              : 'text-aqua group-hover:text-aqua'
          }`}
        >
          {showtime.format}
        </span>

        {isFillingFast && (
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Filling Fast" />
        )}
      </div>

      {isSoldOut ? (
        <span className="text-[9px] text-crimson font-semibold uppercase mt-0.5">
          Sold Out
        </span>
      ) : isFillingFast ? (
        <span className="text-[9px] text-amber-400 font-semibold uppercase mt-0.5">
          Fast Filling
        </span>
      ) : (
        <span className="text-[9px] text-mint/50 mt-0.5">
          {showtime.screen?.split(' ')[0]}
        </span>
      )}
    </button>
  )
}

