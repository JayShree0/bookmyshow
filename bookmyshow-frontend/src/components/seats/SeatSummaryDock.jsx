import React from 'react'
import { formatINR } from '../../utils/formatters'
import { Button } from '../common/Button'
import { ArrowRight, Trash2 } from 'lucide-react'

export function SeatSummaryDock({
  selectedSeats = [],
  ticketCount = 2,
  onProceed,
  onClear,
}) {
  const selectedCount = selectedSeats.length
  const isComplete = selectedCount === ticketCount

  const subtotal = selectedSeats.reduce((sum, s) => sum + (Number(s.price) || 0), 0)

  // Group labels by tier for clean presentation
  const seatLabels = selectedSeats.map((s) => s.label).join(', ')

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-navy/95 backdrop-blur-md border-t border-steel/40 p-3 sm:p-4 text-mint shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-6">
        {/* Left: Selected seats & status */}
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-mint/60">
                Selected Seats ({selectedCount}/{ticketCount}):
              </span>
              {selectedCount > 0 && onClear && (
                <button
                  type="button"
                  onClick={onClear}
                  className="text-[11px] text-crimson hover:underline flex items-center gap-0.5"
                >
                  <Trash2 className="w-3 h-3" /> Clear
                </button>
              )}
            </div>

            <div className="font-bold text-sm sm:text-base text-mint truncate max-w-[280px] sm:max-w-md mt-0.5">
              {selectedCount > 0 ? (
                <span className="text-aqua">{seatLabels}</span>
              ) : (
                <span className="text-mint/40 font-normal italic">
                  Select {ticketCount} seat{ticketCount > 1 ? 's' : ''} to proceed
                </span>
              )}
            </div>
          </div>

          {/* Subtotal */}
          <div className="text-right sm:border-l sm:border-steel/30 sm:pl-4">
            <span className="text-[11px] text-mint/60 block">Seat Total</span>
            <span className="text-base sm:text-lg font-black text-mint">
              {formatINR(subtotal)}
            </span>
          </div>
        </div>

        {/* Right: Proceed Button */}
        <div className="w-full sm:w-auto flex items-center gap-3">
          <Button
            variant="crimson"
            size="lg"
            disabled={!isComplete}
            onClick={onProceed}
            icon={ArrowRight}
            iconPosition="right"
            className="w-full sm:w-auto font-bold shadow-lg shadow-crimson/25"
          >
            {isComplete
              ? 'Proceed to Add-ons'
              : `Select ${ticketCount - selectedCount} more seat${
                  ticketCount - selectedCount > 1 ? 's' : ''
                }`}
          </Button>
        </div>
      </div>
    </div>
  )
}

