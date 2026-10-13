import React, { useState } from 'react'
import { Film } from 'lucide-react'

export function ImageWithFallback({
  src,
  alt = '',
  className = '',
  fallbackText = 'BookMyShow',
  aspectRatio = 'aspect-[2/3]',
  ...props
}) {
  const [hasError, setHasError] = useState(false)

  if (hasError || !src) {
    return (
      <div
        className={`bg-navy-dark/80 border border-steel/30 flex flex-col items-center justify-center text-center p-4 text-aqua/70 ${aspectRatio} ${className}`}
      >
        <Film className="w-8 h-8 mb-2 opacity-50 text-aqua" />
        <span className="text-xs font-medium text-mint/60 line-clamp-2">
          {alt || fallbackText}
        </span>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      loading="lazy"
      className={className}
      {...props}
    />
  )
}

