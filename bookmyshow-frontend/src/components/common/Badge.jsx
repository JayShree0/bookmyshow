import React from 'react'

export function Badge({
  children,
  variant = 'steel', // 'crimson' | 'aqua' | 'steel' | 'outline' | 'warning'
  size = 'sm', // 'xs' | 'sm' | 'md'
  className = '',
  icon: Icon,
}) {
  const sizeStyles = {
    xs: 'text-[10px] px-1.5 py-0.5 rounded-full font-semibold',
    sm: 'text-xs px-2.5 py-1 rounded-full font-medium',
    md: 'text-sm px-3 py-1.5 rounded-full font-medium',
  }

  const variantStyles = {
    crimson: 'bg-crimson/20 border border-crimson/40 text-mint',
    aqua: 'bg-aqua/15 border border-aqua/40 text-aqua font-semibold',
    steel: 'bg-steel/30 border border-steel/40 text-mint/90',
    outline: 'border border-steel/60 text-mint/80 bg-transparent',
    warning: 'bg-amber-500/20 border border-amber-500/40 text-amber-300 font-medium',
    success: 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-medium',
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 select-none ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {Icon && <Icon className="w-3 h-3 shrink-0" />}
      {children}
    </span>
  )
}

