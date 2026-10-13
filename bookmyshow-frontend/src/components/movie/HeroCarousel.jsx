import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Play, Ticket, Star, Sparkles } from 'lucide-react'
import { useBooking } from '../../context/BookingContext'
import { Button } from '../common/Button'
import { Badge } from '../common/Badge'
import { TrailerModal } from '../common/TrailerModal'

export function HeroCarousel({ movies = [] }) {
  const navigate = useNavigate()
  const { startMovieBooking } = useBooking()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [activeTrailerMovie, setActiveTrailerMovie] = useState(null)

  const featuredMovies = movies.filter((m) => m.featured).slice(0, 5)
  const count = featuredMovies.length

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % (count || 1))
  }, [count])

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + count) % (count || 1))
  }, [count])

  // Auto rotate every 6 seconds unless paused
  useEffect(() => {
    if (isPaused || count <= 1) return
    const timer = setInterval(handleNext, 6000)
    return () => clearInterval(timer)
  }, [isPaused, count, handleNext])

  if (count === 0) return null

  const currentMovie = featuredMovies[currentIndex]

  const handleBookTickets = () => {
    startMovieBooking(currentMovie)
    navigate(`/movies/${currentMovie.id}`)
  }

  return (
    <div
      className="relative w-full overflow-hidden rounded-3xl bg-navy-dark border border-steel/30 shadow-2xl"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Cinematic Backdrop Image with Dark Gradients */}
      <div className="relative h-[420px] sm:h-[480px] lg:h-[520px] w-full overflow-hidden">
        <img
          src={currentMovie.backdropUrl}
          alt={currentMovie.title}
          className="w-full h-full object-cover transition-all duration-700 ease-out transform scale-100"
        />

        {/* Gradient overlays for cinematic depth and contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-dark via-navy-dark/80 to-transparent" />

        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10 lg:p-14 max-w-3xl z-10">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge variant="crimson" size="xs">
              FEATURED PREMIERE
            </Badge>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-navy-dark/80 border border-steel/40 text-xs font-bold text-amber-300">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{currentMovie.rating}</span>
              <span className="text-[10px] text-mint/60">({currentMovie.voteCount})</span>
            </div>
            <span className="text-xs text-mint/60 px-2 py-0.5 rounded bg-steel/30">
              {currentMovie.certification}
            </span>
            <span className="text-xs text-mint/60">{currentMovie.duration}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-mint tracking-tight leading-tight">
            {currentMovie.title}
          </h1>

          <p className="text-sm sm:text-base text-mint/80 mt-2 line-clamp-2 leading-relaxed">
            {currentMovie.tagline || currentMovie.synopsis}
          </p>

          {/* Formats & Languages */}
          <div className="flex flex-wrap items-center gap-2 mt-4 text-xs">
            <span className="text-mint/60">Available in:</span>
            {currentMovie.formats?.slice(0, 3).map((f) => (
              <span
                key={f}
                className="px-2 py-0.5 rounded bg-steel/40 border border-steel/60 text-mint font-semibold text-[11px]"
              >
                {f}
              </span>
            ))}
            <span className="text-mint/40">•</span>
            <span className="text-mint/70 font-medium">
              {currentMovie.languages?.join(', ')}
            </span>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3.5 mt-6">
            <Button
              variant="crimson"
              size="lg"
              icon={Ticket}
              onClick={handleBookTickets}
              className="shadow-lg shadow-crimson/25"
            >
              Book Tickets
            </Button>

            <Button
              variant="outline"
              size="lg"
              icon={Play}
              onClick={() => setActiveTrailerMovie(currentMovie)}
              className="backdrop-blur-sm"
            >
              Watch Trailer
            </Button>
          </div>
        </div>

        {/* Carousel Arrow Controls */}
        <button
          onClick={handlePrev}
          className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-navy-dark/60 hover:bg-navy-dark border border-steel/40 text-mint hover:text-aqua items-center justify-center backdrop-blur-md transition-all"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={handleNext}
          className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-navy-dark/60 hover:bg-navy-dark border border-steel/40 text-mint hover:text-aqua items-center justify-center backdrop-blur-md transition-all"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Pagination Dots */}
        <div className="absolute bottom-4 right-6 sm:right-10 z-20 flex items-center gap-2">
          {featuredMovies.map((m, idx) => (
            <button
              key={m.id}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentIndex
                  ? 'w-8 bg-crimson shadow-md'
                  : 'w-2 bg-steel/60 hover:bg-mint/60'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Trailer Modal */}
      <TrailerModal
        isOpen={!!activeTrailerMovie}
        onClose={() => setActiveTrailerMovie(null)}
        movie={activeTrailerMovie}
      />
    </div>
  )
}

