import React from 'react'
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react'

export function Toast({ toast, onClose }) {
  if (!toast) return null

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />,
    info: <Info className="w-4 h-4 text-aqua shrink-0" />,
  }

  const borderStyles = {
    success: 'border-emerald-500/40 bg-navy-card/95',
    warning: 'border-amber-500/40 bg-navy-card/95',
    info: 'border-aqua/40 bg-navy-card/95',
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm animate-in slide-in-from-bottom-5 duration-200">
      <div
        className={`flex items-center gap-3 p-3.5 rounded-xl border shadow-xl backdrop-blur-md text-mint ${
          borderStyles[toast.type] || borderStyles.info
        }`}
      >
        {icons[toast.type] || icons.info}
        <p className="text-xs font-medium leading-relaxed flex-1">{toast.msg}</p>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded text-mint/50 hover:text-mint transition-colors"
            aria-label="Dismiss message"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}

