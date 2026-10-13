import React, { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBooking } from '../context/BookingContext'
import { FOOD_ITEMS } from '../data/foodItems'
import { FoodCategoryTabs } from '../components/food/FoodCategoryTabs'
import { FoodCard } from '../components/food/FoodCard'
import { FoodCartSummary } from '../components/food/FoodCartSummary'
import { UtensilsCrossed, ArrowLeft, Popcorn, Sparkles } from 'lucide-react'

export function FoodBeveragePage() {
  const navigate = useNavigate()
  const { bookingSession, updateFnbQuantity } = useBooking()
  const [activeCategory, setActiveCategory] = useState('All')

  const { movie, selectedSeats = [], fnbItems = [] } = bookingSession

  // Route guard: must have selected seats
  useEffect(() => {
    if (!movie || selectedSeats.length === 0) {
      navigate('/booking/seats')
    }
  }, [movie, selectedSeats, navigate])

  const filteredItems = useMemo(() => {
    if (activeCategory === 'All') return FOOD_ITEMS
    return FOOD_ITEMS.filter((item) => item.category === activeCategory)
  }, [activeCategory])

  const seatSubtotal = selectedSeats.reduce(
    (sum, s) => sum + (Number(s.price) || 0),
    0
  )

  const foodSubtotal = fnbItems.reduce(
    (sum, i) => sum + (Number(i.price) || 0) * (Number(i.quantity) || 0),
    0
  )

  const totalFoodQuantity = fnbItems.reduce(
    (sum, i) => sum + (Number(i.quantity) || 0),
    0
  )

  const getItemQuantity = (itemId) => {
    const found = fnbItems.find((i) => i.id === itemId)
    return found ? found.quantity : 0
  }

  const handleContinue = () => {
    navigate('/booking/checkout')
  }

  const handleSkip = () => {
    navigate('/booking/checkout')
  }

  if (!movie || selectedSeats.length === 0) return null

  return (
    <div className="space-y-6 pb-36">
      {/* 1. Header Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-steel/20 border border-steel/30 text-mint flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/booking/seats')}
            className="p-2 rounded-xl bg-navy-dark hover:bg-steel/30 border border-steel/30 text-mint transition-colors"
            aria-label="Back to seat selection"
            title="Back to seat selection"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5 text-amber-300" />
              <h1 className="text-xl sm:text-2xl font-black text-mint tracking-tight">
                Grab a Bite!
              </h1>
            </div>
            <p className="text-xs text-mint/60 mt-0.5">
              Pre-order cinema snacks & combos for contactless delivery to your seats
            </p>
          </div>
        </div>

        <button
          onClick={handleSkip}
          className="text-xs font-bold text-aqua hover:underline flex items-center gap-1 self-end sm:self-auto"
        >
          <span>Skip F&B</span>
          <span>→</span>
        </button>
      </div>

      {/* 2. Category Tabs */}
      <div>
        <FoodCategoryTabs
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
        />
      </div>

      {/* 3. Concession Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredItems.map((item) => (
          <FoodCard
            key={item.id}
            item={item}
            quantity={getItemQuantity(item.id)}
            onUpdateQuantity={updateFnbQuantity}
          />
        ))}
      </div>

      {/* 4. Bottom Sticky Cart Bar */}
      <FoodCartSummary
        seatSubtotal={seatSubtotal}
        foodSubtotal={foodSubtotal}
        foodItemsCount={totalFoodQuantity}
        onContinue={handleContinue}
        onSkip={handleSkip}
      />
    </div>
  )
}
