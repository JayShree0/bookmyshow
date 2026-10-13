import React from 'react'
import { Loader2 } from 'lucide-react'

export function Button({
  children,
  variant = 'crimson', // 'crimson' | 'aqua' | 'steel' | 'outline' | 'ghost'
  size = 'md', // 'sm' | 'md' | 'lg'
  isLoading = false,
  disabled = false,
  className = '',
  icon: Icon,
  iconPosition = 'left',
  type = 'button',
  onClick,
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-aqua focus-visible:ring-offset-2 focus-visible:ring-offset-navy disabled:opacity-50 disabled:cursor-not-allowed select-none'

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5',
    md: 'text-sm px-4 py-2.5 rounded-xl gap-2',
    lg: 'text-base px-6 py-3 rounded-xl gap-2.5 font-semibold',
  }

  const variantStyles = {
    crimson:
      'bg-crimson hover:bg-crimson-hover active:bg-crimson-active text-mint shadow-md hover:shadow-crimson/20 active:scale-[0.98]',
    aqua:
      'bg-aqua hover:bg-aqua-hover active:bg-aqua-dark text-navy font-semibold shadow-sm hover:shadow-aqua/20 active:scale-[0.98]',
    steel:
      'bg-steel hover:bg-steel-light active:bg-steel-dark text-mint shadow-sm active:scale-[0.98]',
    outline:
      'border border-steel/60 hover:border-aqua text-mint hover:text-aqua bg-transparent hover:bg-steel/20 active:scale-[0.98]',
    ghost:
      'bg-transparent hover:bg-steel/25 text-mint/90 hover:text-mint active:scale-[0.98]',
  }

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : Icon && iconPosition === 'left' ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}

      <span>{children}</span>

      {!isLoading && Icon && iconPosition === 'right' && (
        <Icon className="w-4 h-4 shrink-0" />
      )}
    </button>
  )
}

