import React from 'react'
import { Plus, Minus } from 'lucide-react'
import { formatINR } from '../../utils/formatters'
import { ImageWithFallback } from '../common/ImageWithFallback'

export function FoodCard({ item, quantity = 0, onUpdateQuantity }) {
  if (!item) return null

  return (
    <div className="flex flex-col justify-between rounded-2xl bg-steel/20 border border-steel/30 hover:border-steel/60 p-4 transition-all duration-200 text-mint">
      <div className="space-y-3">
        {/* Image & Dietary Tag */}
        <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-navy-dark">
          <ImageWithFallback
            src={item.imageUrl}
            alt={item.name}
            aspectRatio="aspect-video"
            className="w-full h-full object-cover"
          />

          {/* Veg / Non-Veg Icon */}
          <div className="absolute top-2 left-2 p-1 rounded bg-navy-dark/80 backdrop-blur-md">
            <span
              className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center ${
                item.isVeg
                  ? 'border-emerald-500'
                  : 'border-crimson'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  item.isVeg ? 'bg-emerald-500' : 'bg-crimson'
                }`}
              />
            </span>
          </div>

          {item.calories && (
            <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-navy-dark/80 backdrop-blur-md text-[10px] text-mint/70 font-medium">
              {item.calories}
            </span>
          )}
        </div>

        {/* Item Info */}
        <div>
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-bold text-sm text-mint tracking-tight leading-snug">
              {item.name}
            </h4>
          </div>
          <p className="text-xs text-mint/60 mt-1 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>
      </div>

      {/* Pricing & Quantity Controls */}
      <div className="flex items-center justify-between pt-4 mt-3 border-t border-steel/20">
        <div>
          <span className="text-base font-bold text-mint">
            {formatINR(item.price)}
          </span>
          {item.originalPrice && item.originalPrice > item.price && (
            <span className="text-xs text-mint/40 line-through ml-2">
              {formatINR(item.originalPrice)}
            </span>
          )}
        </div>

        {quantity > 0 ? (
          <div className="flex items-center gap-2 bg-navy-dark border border-aqua/60 rounded-xl p-1 shadow-sm">
            <button
              type="button"
              onClick={() => onUpdateQuantity(item, -1)}
              className="w-7 h-7 rounded-lg bg-steel/30 hover:bg-steel/60 text-mint flex items-center justify-center transition-colors"
              aria-label={`Decrease ${item.name} quantity`}
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            <span className="w-6 text-center font-bold text-sm text-aqua">
              {quantity}
            </span>

            <button
              type="button"
              onClick={() => onUpdateQuantity(item, 1)}
              className="w-7 h-7 rounded-lg bg-steel/30 hover:bg-steel/60 text-mint flex items-center justify-center transition-colors"
              aria-label={`Increase ${item.name} quantity`}
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onUpdateQuantity(item, 1)}
            className="px-4 py-1.5 rounded-xl bg-steel/30 hover:bg-steel/60 border border-steel/50 text-xs font-bold text-aqua transition-all flex items-center gap-1 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        )}
      </div>
    </div>
  )
}

