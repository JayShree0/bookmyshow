import React from 'react'
import { formatCountdown } from '../../utils/formatters'
import { Clock, AlertTriangle, RefreshCw } from 'lucide-react'

export function BookingTimer({ secondsRemaining = 600, isExpired = false, onRestart }) {
  const percentRemaining = Math.max(0, Math.min(100, (secondsRemaining / 600) * 100))
  const isUrgent = secondsRemaining < 120 && secondsRemaining > 0

  return (
    <div
      className={`p-3.5 rounded-2xl border transition-all text-mint ${
        isExpired
          ? 'bg-crimson/20 border-crimson/50'
          : isUrgent
          ? 'bg-amber-500/15 border-amber-500/40 animate-pulse'
          : 'bg-steel/20 border-steel/30'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {isExpired ? (
            <AlertTriangle className="w-4 h-4 text-crimson shrink-0" />
          ) : (
            <Clock className="w-4 h-4 text-aqua shrink-0" />
          )}

          <div>
            <span className="text-xs font-semibold text-mint block">
              {isExpired
                ? 'Demo Seat Hold Expired'
                : 'Demo Seat Hold Active'}
            </span>
            <span className="text-[11px] text-mint/60">
              {isExpired
                ? 'Your temporary hold timed out. Please refresh or reselect seats.'
                : 'Seats are temporarily held in demo state for your order.'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isExpired ? (
            <div className="font-mono font-black text-sm sm:text-base px-2.5 py-1 rounded-lg bg-navy-dark border border-steel/30 text-aqua">
              {formatCountdown(secondsRemaining)}
            </div>
          ) : (
            onRestart && (
              <button
                type="button"
                onClick={onRestart}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-crimson hover:bg-crimson-hover text-mint font-semibold text-xs shadow"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Restart Hold
              </button>
            )
          )}
        </div>
      </div>

      {/* Progress bar */}
      {!isExpired && (
        <div className="w-full h-1.5 bg-navy-dark rounded-full overflow-hidden mt-3">
          <div
            className={`h-full transition-all duration-1000 ${
              isUrgent ? 'bg-amber-400' : 'bg-aqua'
            }`}
            style={{ width: `${percentRemaining}%` }}
          />
        </div>
      )}
    </div>
  )
}

