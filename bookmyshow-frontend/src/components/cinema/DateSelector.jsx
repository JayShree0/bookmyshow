import React from 'react'
import { Calendar } from 'lucide-react'

export function DateSelector({ dates = [], selectedDate, onSelectDate }) {
  if (!dates || dates.length === 0) return null

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs font-semibold text-mint/70 uppercase tracking-wider">
        <Calendar className="w-3.5 h-3.5 text-aqua" />
        <span>Select Date</span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {dates.map((d) => {
          const isSelected = selectedDate === d.dateString

          return (
            <button
              key={d.id}
              onClick={() => onSelectDate(d.dateString)}
              className={`flex flex-col items-center justify-center min-w-[76px] py-2.5 px-3 rounded-2xl border transition-all duration-200 shrink-0 ${
                isSelected
                  ? 'bg-crimson border-crimson text-mint shadow-md ring-2 ring-crimson/30'
                  : 'bg-steel/20 border-steel/30 text-mint/80 hover:bg-steel/30 hover:border-steel/60 hover:text-mint'
              }`}
            >
              <span className="text-[11px] font-medium tracking-wide uppercase opacity-80">
                {d.dayName}
              </span>
              <span className="text-lg font-bold leading-tight">
                {d.dayNumber}
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase opacity-80">
                {d.monthName}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

