import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Star, Heart } from 'lucide-react'
import { useBooking } from '../../context/BookingContext'
import { ImageWithFallback } from '../common/ImageWithFallback'
import { Badge } from '../common/Badge'
import { Button } from '../common/Button'

export function MovieCard({ movie }) {
  const navigate = useNavigate()
  const { favorites, toggleFavorite, startMovieBooking } = useBooking()

  if (!movie) return null

  const isFavorite = favorites.includes(movie.id)

  const handleCardClick = () => {
    startMovieBooking(movie)
    navigate(`/movies/${movie.id}`)
  }

  const handleFavoriteClick = (e) => {
    e.stopPropagation()
    toggleFavorite(movie.id)
  }

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex flex-col bg-steel/20 border border-steel/30 hover:border-aqua/60 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-navy-dark/40 cursor-pointer"
    >
      {/* Poster Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-navy-dark">
        <ImageWithFallback
          src={movie.posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Gradient Overlay on Poster bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-transparent to-transparent opacity-80" />

        {/* Top Badges: Certification & Favorite */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
          <span className="px-2 py-0.5 rounded-md bg-navy-dark/80 backdrop-blur-md text-[10px] font-bold text-mint border border-steel/40">
            {movie.certification}
          </span>

          <button
            type="button"
            onClick={handleFavoriteClick}
            className={`p-1.5 rounded-full backdrop-blur-md transition-all ${
              isFavorite
                ? 'bg-crimson text-mint shadow-md'
                : 'bg-navy-dark/70 text-mint/80 hover:text-crimson hover:bg-navy-dark'
            }`}
            aria-label={isFavorite ? 'Remove from watchlist' : 'Add to watchlist'}
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Bottom Poster Info: Rating & Votes */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-navy-dark/90 backdrop-blur-md border border-steel/30 text-amber-300 font-bold">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>{movie.rating}</span>
            <span className="text-[10px] font-normal text-mint/60">
              ({movie.voteCount})
            </span>
          </div>

          <span className="text-[11px] font-medium text-mint/80 bg-navy-dark/80 px-2 py-0.5 rounded backdrop-blur-md">
            {movie.duration}
          </span>
        </div>
      </div>

      {/* Card Details */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-3">
        <div>
          <h3 className="font-bold text-sm text-mint group-hover:text-aqua transition-colors line-clamp-1">
            {movie.title}
          </h3>

          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            {movie.genres.slice(0, 2).map((genre) => (
              <Badge key={genre} variant="steel" size="xs">
                {genre}
              </Badge>
            ))}
            <span className="text-[11px] text-mint/50 truncate">
              {movie.languages.slice(0, 2).join(', ')}
            </span>
          </div>
        </div>

        {/* Book Button */}
        <Button
          variant="crimson"
          size="sm"
          className="w-full text-xs font-semibold"
          onClick={(e) => {
            e.stopPropagation()
            handleCardClick()
          }}
        >
          Book Tickets
        </Button>
      </div>
    </div>
  )
}

