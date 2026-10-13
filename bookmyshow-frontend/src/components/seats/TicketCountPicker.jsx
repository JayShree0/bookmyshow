import React from 'react'
import { TICKET_COUNT_OPTIONS } from '../../data/seats'
import { Users } from 'lucide-react'

export function TicketCountPicker({ selectedCount = 2, onSelectCount }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5 text-xs text-mint/70 font-semibold mr-1">
        <Users className="w-4 h-4 text-aqua shrink-0" />
        <span className="hidden sm:inline">Tickets:</span>
      </div>

      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {TICKET_COUNT_OPTIONS.map((count) => {
          const isSelected = selectedCount === count
          return (
            <button
              key={count}
              type="button"
              onClick={() => onSelectCount(count)}
              className={`w-8 h-8 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center shrink-0 ${
                isSelected
                  ? 'bg-crimson text-mint shadow-md ring-2 ring-crimson/30'
                  : 'bg-steel/30 text-mint/80 hover:bg-steel/50 hover:text-mint'
              }`}
              aria-label={`Select ${count} tickets`}
            >
              {count}
            </button>
          )
        })}
      </div>
    </div>
  )
}

