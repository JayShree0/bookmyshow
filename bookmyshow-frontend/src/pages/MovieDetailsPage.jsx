import React, { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MOVIES } from '../data/movies'
import { getCinemasByCity } from '../data/cinemas'
import { getNextDates, getShowtimesForCinema } from '../data/showtimes'
import { useBooking } from '../context/BookingContext'
import { ImageWithFallback } from '../components/common/ImageWithFallback'
import { Badge } from '../components/common/Badge'
import { Button } from '../components/common/Button'
import { CastList } from '../components/movie/CastList'
import { DateSelector } from '../components/cinema/DateSelector'
import { CinemaCard } from '../components/cinema/CinemaCard'
import { RatingModal } from '../components/common/RatingModal'
import { TrailerModal } from '../components/common/TrailerModal'
import {
  Star,
  Heart,
  Play,
  Share2,
  Calendar,
  Clock,
  MapPin,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react'

export function MovieDetailsPage() {
  const { movieId } = useParams()
  const navigate = useNavigate()
  const {
    movies = MOVIES,
    selectedCity,
    favorites,
    toggleFavorite,
    selectShowtime,
    bookingSession,
    showToast,
  } = useBooking()

  // Find movie by slug or numeric ID
  const movie = useMemo(() => {
    return (
      movies.find(
        (m) =>
          m.id === movieId ||
          m.slug === movieId ||
          String(m.numericId) === String(movieId)
      ) ||
      MOVIES.find((m) => m.id === movieId) ||
      null
    )
  }, [movieId, movies])

  // Dynamic 6 dates
  const nextDates = useMemo(() => getNextDates(), [])
  const [selectedDate, setSelectedDate] = useState(() => {
    return bookingSession.selectedDate || nextDates[0]?.dateString
  })

  // State for modals & synopsis expand
  const [isSynopsisExpanded, setIsSynopsisExpanded] = useState(false)
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false)
  const [isTrailerModalOpen, setIsTrailerModalOpen] = useState(false)

  // Cinemas in current city
  const cityCinemas = useMemo(() => {
    return getCinemasByCity(selectedCity)
  }, [selectedCity])

  const isFavorite = movie ? favorites.includes(movie.id) : false

  // Handle showtime click
  const handleSelectShowtime = (showtime, cinema) => {
    if (showtime.status === 'sold_out') {
      showToast('This showtime is sold out. Please choose another show.', 'warning')
      return
    }

    const success = selectShowtime(showtime, cinema, movie, selectedDate)
    if (success) {
      navigate('/booking/seats')
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: movie?.title,
        text: `Book tickets for ${movie?.title} on BookMyShow (Demo)!`,
        url: window.location.href,
      }).catch(() => {})
    } else {
      navigator.clipboard.writeText(window.location.href)
      showToast('Movie link copied to clipboard!', 'info')
    }
  }

  if (!movie) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-mint">Movie Not Found</h2>
        <p className="text-sm text-mint/60">
          The requested movie could not be located in our catalog.
        </p>
        <Button variant="crimson" onClick={() => navigate('/')}>
          Return to Movies
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-10 pb-16">
      {/* 1. Cinematic Backdrop & Overview Header */}
      <div className="relative -mx-4 sm:-mx-6 lg:-mx-8 -mt-6 bg-navy-dark overflow-hidden border-b border-steel/30">
        {/* Backdrop Image */}
        <div className="relative h-[320px] sm:h-[400px] lg:h-[460px] w-full">
          <img
            src={movie.backdropUrl}
            alt={movie.title}
            className="w-full h-full object-cover object-top opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/80 to-transparent" />
        </div>

        {/* Content Container positioned over backdrop */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative -mt-56 sm:-mt-64 z-10 pb-8">
          <div className="flex flex-col sm:flex-row gap-6 lg:gap-8 items-start">
            {/* Poster Card */}
            <div className="w-36 sm:w-56 lg:w-64 rounded-2xl overflow-hidden shadow-2xl border-2 border-steel/40 bg-navy-dark shrink-0 mx-auto sm:mx-0">
              <ImageWithFallback
                src={movie.posterUrl}
                alt={movie.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Details Column */}
            <div className="flex-1 space-y-4 text-mint pt-2">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge variant="crimson" size="xs">
                    {movie.certification}
                  </Badge>
                  <span className="text-xs text-mint/60">{movie.duration}</span>
                  <span className="text-mint/40">•</span>
                  <span className="text-xs text-mint/60">
                    {movie.languages.join(', ')}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-mint tracking-tight">
                  {movie.title}
                </h1>

                {movie.tagline && (
                  <p className="text-sm sm:text-base text-aqua font-medium mt-1">
                    {movie.tagline}
                  </p>
                )}
              </div>

              {/* Rating & Rate Now interaction */}
              <div className="flex flex-wrap items-center gap-4 p-3.5 rounded-2xl bg-steel/20 border border-steel/30 max-w-xl">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-400/20 text-amber-400">
                    <Star className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <span className="text-lg font-black text-mint">
                      {movie.rating} <span className="text-xs font-normal text-mint/50">/ 10</span>
                    </span>
                    <span className="text-[11px] text-mint/50 block">
                      {movie.voteCount} Votes
                    </span>
                  </div>
                </div>

                <div className="hidden sm:block h-8 w-px bg-steel/30" />

                <button
                  onClick={() => setIsRatingModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-steel/40 hover:bg-steel/60 text-xs font-bold text-mint transition-all flex items-center gap-1.5"
                >
                  <Star className="w-3.5 h-3.5 text-amber-300" />
                  <span>Rate Now</span>
                </button>
              </div>

              {/* Formats & Genres */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-mint/60 font-medium">Formats:</span>
                {movie.formats.map((f) => (
                  <Badge key={f} variant="steel" size="xs">
                    {f}
                  </Badge>
                ))}
                <span className="text-mint/40">•</span>
                <span className="text-mint/60 font-medium">Genres:</span>
                {movie.genres.map((g) => (
                  <Badge key={g} variant="aqua" size="xs">
                    {g}
                  </Badge>
                ))}
              </div>

              {/* Actions row */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button
                  variant="crimson"
                  size="md"
                  onClick={() => {
                    const cinemaSection = document.getElementById('cinema-listing')
                    cinemaSection?.scrollIntoView({ behavior: 'smooth' })
                  }}
                >
                  Book Tickets
                </Button>

                <Button
                  variant="outline"
                  size="md"
                  icon={Play}
                  onClick={() => setIsTrailerModalOpen(true)}
                >
                  Watch Trailer
                </Button>

                <button
                  onClick={() => toggleFavorite(movie.id)}
                  className={`p-2.5 rounded-xl border transition-all ${
                    isFavorite
                      ? 'bg-crimson border-crimson text-mint'
                      : 'border-steel/40 text-mint/70 hover:text-crimson hover:bg-steel/20'
                  }`}
                  aria-label="Toggle Watchlist"
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                </button>

                <button
                  onClick={handleShare}
                  className="p-2.5 rounded-xl border border-steel/40 text-mint/70 hover:text-aqua hover:bg-steel/20 transition-all"
                  aria-label="Share movie"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Synopsis & Cast Section */}
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="space-y-3 p-5 rounded-2xl bg-steel/20 border border-steel/30">
          <h3 className="text-base font-bold text-mint">About the Movie</h3>
          <p
            className={`text-sm text-mint/80 leading-relaxed ${
              !isSynopsisExpanded ? 'line-clamp-3' : ''
            }`}
          >
            {movie.synopsis}
          </p>
          <button
            onClick={() => setIsSynopsisExpanded(!isSynopsisExpanded)}
            className="text-xs font-semibold text-aqua hover:underline flex items-center gap-1"
          >
            <span>{isSynopsisExpanded ? 'Show Less' : 'Read More'}</span>
            {isSynopsisExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Cast & Crew Carousel */}
        <CastList cast={movie.cast} director={movie.director} />

        {/* 3. Cinema Listing & Dynamic Showtime Selector */}
        <div id="cinema-listing" className="space-y-6 pt-6 border-t border-steel/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-mint tracking-tight">
                Cinemas in {selectedCity}
              </h2>
              <p className="text-xs text-mint/60 mt-0.5">
                Select your preferred date, venue, and showtime
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-mint/60">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Available
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Filling Fast
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-crimson" /> Sold Out
              </span>
            </div>
          </div>

          {/* Dynamic 6-Date Picker */}
          <DateSelector
            dates={nextDates}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />

          {/* Cinemas List */}
          <div className="space-y-4">
            {cityCinemas.length > 0 ? (
              cityCinemas.map((cinema) => {
                const showtimes = getShowtimesForCinema(cinema.id, movie.id, selectedDate)
                return (
                  <CinemaCard
                    key={cinema.id}
                    cinema={cinema}
                    showtimes={showtimes}
                    selectedShowtime={
                      bookingSession.selectedCinema?.id === cinema.id &&
                      bookingSession.selectedDate === selectedDate
                        ? bookingSession.selectedShowtime
                        : null
                    }
                    onSelectShowtime={(show) => handleSelectShowtime(show, cinema)}
                  />
                )
              })
            ) : (
              <div className="p-8 text-center bg-steel/20 rounded-2xl border border-steel/30">
                <MapPin className="w-8 h-8 text-aqua mx-auto mb-2" />
                <h4 className="font-bold text-base text-mint">
                  No cinema halls found in {selectedCity}
                </h4>
                <p className="text-xs text-mint/60 mt-1">
                  Try switching to Mumbai, Delhi-NCR, or Bengaluru using the city selector.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rating Modal */}
      <RatingModal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        movie={movie}
        onRatingSubmitted={({ rating }) =>
          showToast(`Your rating (${rating}/10) for ${movie.title} was recorded!`, 'success')
        }
      />

      {/* Trailer Modal */}
      <TrailerModal
        isOpen={isTrailerModalOpen}
        onClose={() => setIsTrailerModalOpen(false)}
        movie={movie}
      />
    </div>
  )
}
