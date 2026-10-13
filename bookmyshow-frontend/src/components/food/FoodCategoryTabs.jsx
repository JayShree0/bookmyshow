import React from 'react'
import { FOOD_CATEGORIES } from '../../data/foodItems'

export function FoodCategoryTabs({ activeCategory = 'All', onSelectCategory }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
      {FOOD_CATEGORIES.map((cat) => {
        const isActive = activeCategory === cat
        return (
          <button
            key={cat}
            type="button"
            onClick={() => onSelectCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 shrink-0 select-none ${
              isActive
                ? 'bg-aqua text-navy shadow-md ring-1 ring-aqua'
                : 'bg-steel/20 border border-steel/30 text-mint/80 hover:bg-steel/30 hover:text-mint'
            }`}
          >
            {cat}
          </button>
        )
      })}
    </div>
  )
}

