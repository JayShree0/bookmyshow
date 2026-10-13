import React from 'react'
import { formatINR } from '../../utils/formatters'
import { Button } from '../common/Button'
import { ArrowRight, UtensilsCrossed } from 'lucide-react'

export function FoodCartSummary({
  seatSubtotal = 0,
  foodSubtotal = 0,
  foodItemsCount = 0,
  onContinue,
  onSkip,
}) {
  const combinedTotal = seatSubtotal + foodSubtotal

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-navy/95 backdrop-blur-md border-t border-steel/40 p-3 sm:p-4 text-mint shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-6">
        {/* Breakdown */}
        <div className="flex items-center gap-4 sm:gap-8 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-4 text-xs">
            <div>
              <span className="text-mint/60 block text-[11px]">Seat Tickets</span>
              <span className="font-semibold text-mint">{formatINR(seatSubtotal)}</span>
            </div>

            <span className="text-mint/40">+</span>

            <div>
              <span className="text-mint/60 block text-[11px]">
                F&B ({foodItemsCount})
              </span>
              <span className="font-semibold text-aqua">{formatINR(foodSubtotal)}</span>
            </div>
          </div>

          <div className="border-l border-steel/30 pl-4 text-right">
            <span className="text-[11px] text-mint/60 block">Combined Subtotal</span>
            <span className="text-base sm:text-lg font-black text-mint">
              {formatINR(combinedTotal)}
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="w-full sm:w-auto flex items-center gap-3">
          <Button
            variant="ghost"
            size="md"
            onClick={onSkip}
            className="w-1/2 sm:w-auto text-xs text-mint/70 hover:text-mint"
          >
            Skip F&B
          </Button>

          <Button
            variant="crimson"
            size="lg"
            onClick={onContinue}
            icon={ArrowRight}
            iconPosition="right"
            className="w-1/2 sm:w-auto font-bold shadow-lg shadow-crimson/25"
          >
            Continue to Checkout
          </Button>
        </div>
      </div>
    </div>
  )
}

