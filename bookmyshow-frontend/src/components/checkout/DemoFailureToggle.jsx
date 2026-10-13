import React from 'react'
import { AlertCircle } from 'lucide-react'

export function DemoFailureToggle({ isFailureSimulated, onToggle }) {
  return (
    <div className="p-3 rounded-xl bg-navy-dark/60 border border-steel/30 flex items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
        <div>
          <span className="font-semibold text-mint block">
            Test Failure Scenario (Demo QA)
          </span>
          <span className="text-[11px] text-mint/60">
            Simulate a declined payment to test error handling & safe retry
          </span>
        </div>
      </div>

      <label className="relative inline-flex items-center cursor-pointer shrink-0">
        <input
          type="checkbox"
          checked={isFailureSimulated}
          onChange={(e) => onToggle(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-10 h-5 bg-steel/40 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-crimson"></div>
      </label>
    </div>
  )
}

