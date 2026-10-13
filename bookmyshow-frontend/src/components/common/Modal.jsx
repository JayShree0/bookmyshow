import React, { useEffect } from 'react'
import { X } from 'lucide-react'

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-lg',
  showClose = true,
}) {
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto overscroll-contain p-3 sm:p-4 md:p-6 bg-navy-dark/80 backdrop-blur-sm flex min-h-full items-center justify-center animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`relative w-full ${maxWidth} max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2.5rem)] flex flex-col bg-navy border border-steel/40 rounded-2xl shadow-2xl text-mint overflow-hidden animate-in zoom-in-95 duration-200 my-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Stays pinned at the top */}
        <div className="flex items-start justify-between gap-4 p-4 sm:p-6 pb-3 sm:pb-4 border-b border-steel/20 shrink-0 bg-navy">
          <div className="min-w-0 flex-1">
            {title && (
              <h3 className="text-lg sm:text-xl font-bold text-mint tracking-tight truncate">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-mint/60 mt-0.5 line-clamp-1">{subtitle}</p>
            )}
          </div>
          {showClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-mint/60 hover:text-mint hover:bg-steel/30 transition-colors shrink-0 -mr-1"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Body - Flexibly scrolls within viewport bounds */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 pt-3 sm:pt-4 overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  )
}

