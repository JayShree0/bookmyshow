import React, { useRef, useEffect } from 'react'
import { Bell, CheckCheck, Ticket, Tag, Sparkles, AlertCircle, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function NotificationDrawer({
  isOpen,
  onClose,
  notifications = [],
  onMarkRead,
  onMarkAllRead,
}) {
  const containerRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handleOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleOutside)
    }
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const getIcon = (type) => {
    switch (type) {
      case 'booking':
        return <Ticket className="w-4 h-4 text-emerald-400" />
      case 'promo':
        return <Tag className="w-4 h-4 text-aqua" />
      case 'cancellation':
        return <AlertCircle className="w-4 h-4 text-amber-400" />
      default:
        return <Sparkles className="w-4 h-4 text-crimson" />
    }
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-x-4 top-16 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96 bg-navy border border-steel/40 rounded-2xl shadow-2xl z-50 overflow-hidden text-mint animate-in fade-in zoom-in-95 duration-150"
    >
      <div className="p-3.5 border-b border-steel/20 flex items-center justify-between bg-navy-dark/60">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-aqua" />
          <h4 className="font-semibold text-sm">Notifications</h4>
        </div>

        <div className="flex items-center gap-2">
          {notifications.some((n) => !n.read) && (
            <button
              onClick={onMarkAllRead}
              className="text-[11px] text-aqua hover:underline flex items-center gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" /> Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded text-mint/60 hover:text-mint"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-steel/15">
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => {
                onMarkRead(notif.id)
                if (notif.bookingId) {
                  onClose()
                  navigate(`/booking/confirmation/${notif.bookingId}`)
                }
              }}
              className={`p-3.5 flex items-start gap-3 hover:bg-steel/20 transition-colors cursor-pointer ${
                !notif.read ? 'bg-steel/15' : ''
              }`}
            >
              <div className="p-2 rounded-xl bg-navy-dark border border-steel/20 mt-0.5 shrink-0">
                {getIcon(notif.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h5 className="text-xs font-semibold text-mint truncate">
                    {notif.title}
                  </h5>
                  <span className="text-[10px] text-mint/40 shrink-0">
                    {notif.time}
                  </span>
                </div>
                <p className="text-xs text-mint/70 mt-1 line-clamp-2">
                  {notif.message}
                </p>
              </div>
              {!notif.read && (
                <span className="w-2 h-2 rounded-full bg-crimson shrink-0 self-center" />
              )}
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-xs text-mint/50">
            No notifications yet
          </div>
        )}
      </div>
    </div>
  )
}

