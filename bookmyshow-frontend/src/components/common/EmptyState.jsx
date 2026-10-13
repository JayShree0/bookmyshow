import React from 'react'
import { Film, Search, Ticket, Bookmark } from 'lucide-react'
import { Button } from './Button'

export function EmptyState({
  icon: Icon = Search,
  title = 'No results found',
  description = 'Try searching with different keywords or resetting active filters.',
  actionLabel,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-navy-card/40 border border-steel/20 rounded-2xl my-6">
      <div className="w-16 h-16 rounded-2xl bg-steel/20 border border-steel/30 flex items-center justify-center mb-4 text-aqua">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-mint mb-1">{title}</h3>
      <p className="text-sm text-mint/60 max-w-md mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

