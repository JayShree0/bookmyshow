import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useBooking } from '../context/BookingContext'
import { MOVIES } from '../data/movies'
import { MovieCard } from '../components/movie/MovieCard'
import { EmptyState } from '../components/common/EmptyState'
import { Heart } from 'lucide-react'

export function FavoritesPage() {
  const navigate = useNavigate()
  const { favorites } = useBooking()

  const favoriteMovies = MOVIES.filter((m) => favorites.includes(m.id))

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      {/* Header */}
      <div className="p-4 sm:p-5 rounded-2xl bg-steel/20 border border-steel/30 text-mint flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-crimson fill-current" />
            <h1 className="text-xl sm:text-2xl font-black text-mint tracking-tight">
              My Watchlist
            </h1>
          </div>
          <p className="text-xs text-mint/60 mt-0.5">
            Movies you have saved to watch in theatres
          </p>
        </div>

        <span className="text-xs font-bold text-aqua bg-aqua/10 border border-aqua/30 px-3 py-1.5 rounded-xl">
          {favoriteMovies.length} Saved
        </span>
      </div>

      {/* Grid or Empty State */}
      {favoriteMovies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
          {favoriteMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Heart}
          title="Your Watchlist is empty"
          description="Tap the heart icon on any movie poster to save it here for quick access."
          actionLabel="Explore Movies"
          onAction={() => navigate('/')}
        />
      )}
    </div>
  )
}
