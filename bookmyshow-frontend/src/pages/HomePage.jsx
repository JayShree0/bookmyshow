import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useBooking } from '../context/BookingContext'
import { MOVIES } from '../data/movies'
import { EVENTS_DATA } from '../data/events'
import { HeroCarousel } from '../components/movie/HeroCarousel'
import { MovieCard } from '../components/movie/MovieCard'
import { MovieFilter } from '../components/movie/MovieFilter'
import { EmptyState } from '../components/common/EmptyState'
import { Button } from '../components/common/Button'
import {
  Film,
  Sparkles,
  TrendingUp,
  Star,
  Award,
  CreditCard,
  Ticket,
  ArrowRight,
  Flame,
  Calendar,
} from 'lucide-react'

export function HomePage() {
  const {
    movies = MOVIES,
    selectedCity,
    selectedGenre,
    setSelectedGenre,
    selectedLanguage,
    setSelectedLanguage,
    sortBy,
    setSortBy,
  } = useBooking()

  // Filter movies based on active genre, language, and sorting
  const filteredMovies = useMemo(() => {
    let result = [...movies]

    if (selectedGenre !== 'All') {
      result = result.filter((m) => m.genres.includes(selectedGenre))
    }

    if (selectedLanguage !== 'All') {
      result = result.filter((m) => m.languages.includes(selectedLanguage))
    }

    // Sort
    if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating)
    } else if (sortBy === 'release') {
      result.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate))
    } else {
      // popularity
      result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
    }

    return result
  }, [selectedGenre, selectedLanguage, sortBy])

  // Categorized sections
  const nowShowingMovies = filteredMovies.filter(
    (m) => m.status === 'now_showing' || m.featured
  )
  const topRatedMovies = filteredMovies.filter((m) => m.rating >= 8.8)

  const handleResetFilters = () => {
    setSelectedGenre('All')
    setSelectedLanguage('All')
    setSortBy('popularity')
  }

  return (
    <div className="space-y-12 pb-16">
      {/* 1. Hero Billboard Carousel */}
      <section className="pt-2">
        <HeroCarousel movies={MOVIES} />
      </section>

      {/* 2. Promotional Offers Banner Strip */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-gradient-to-r from-navy-card via-steel/30 to-navy-card border border-steel/40 flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-crimson/20 border border-crimson/40 text-crimson flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-aqua">
                ICICI Bank Credit Card Offer
              </span>
              <h4 className="text-xs sm:text-sm font-bold text-mint">
                Buy 1 Get 1 Ticket Free on Weekends
              </h4>
              <p className="text-[11px] text-mint/50 mt-0.5">
                Use code <strong>BMS50</strong> or link eligible card during checkout. (Demo)
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-r from-navy-card via-steel/30 to-navy-card border border-steel/40 flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-aqua/20 border border-aqua/40 text-aqua flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-aqua">
                Popcorn Combo Deal
              </span>
              <h4 className="text-xs sm:text-sm font-bold text-mint">
                10% Off on Pre-booked Snacks with SNACK10
              </h4>
              <p className="text-[11px] text-mint/50 mt-0.5">
                Skip the intermission queues with direct-to-seat service. (Demo)
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Interactive Filter Bar */}
      <section>
        <MovieFilter
          selectedGenre={selectedGenre}
          onSelectGenre={setSelectedGenre}
          selectedLanguage={selectedLanguage}
          onSelectLanguage={setSelectedLanguage}
          sortBy={sortBy}
          onSelectSort={setSortBy}
          onResetFilters={handleResetFilters}
        />
      </section>

      {/* 4. Now Showing in [City] */}
      <section id="now-showing" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-crimson" />
              <h2 className="text-xl sm:text-2xl font-black text-mint tracking-tight">
                Now Showing in {selectedCity}
              </h2>
            </div>
            <p className="text-xs text-mint/60 mt-0.5">
              Explore the latest blockbusters showing across top cinemas
            </p>
          </div>
          <span className="text-xs font-semibold text-aqua">
            {nowShowingMovies.length} Movies Available
          </span>
        </div>

        {nowShowingMovies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
            {nowShowingMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No movies found"
            description="No active movies match your current genre or language criteria in this city."
            actionLabel="Reset Filters"
            onAction={handleResetFilters}
          />
        )}
      </section>

      {/* 5. Trending & Top Rated Section */}
      <section id="trending" className="space-y-4 pt-4 border-t border-steel/20">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400 fill-current" />
              <h2 className="text-xl sm:text-2xl font-black text-mint tracking-tight">
                Top Rated & Trending
              </h2>
            </div>
            <p className="text-xs text-mint/60 mt-0.5">
              Critically acclaimed masterworks and crowd favourites
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
          {topRatedMovies.slice(0, 4).map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>

      {/* 6. Live Events & Non-Movie Discovery Strip */}
      <section className="space-y-4 pt-6 border-t border-steel/20">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-aqua" />
              <h2 className="text-xl sm:text-2xl font-black text-mint tracking-tight">
                Live Events & Experiences
              </h2>
            </div>
            <p className="text-xs text-mint/60 mt-0.5">
              Concerts, stand-up comedy, sports derbies, and immersive workshops
            </p>
          </div>

          <Link
            to="/events"
            className="text-xs font-bold text-aqua hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {EVENTS_DATA.slice(0, 3).map((event) => (
            <div
              key={event.id}
              className="rounded-2xl bg-steel/20 border border-steel/30 hover:border-aqua/60 overflow-hidden transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-navy-dark">
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-crimson text-mint text-[10px] font-bold">
                  {event.tag}
                </span>
                <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-navy-dark/90 backdrop-blur-md text-mint text-[11px] font-semibold">
                  {event.category}
                </span>
              </div>

              <div className="p-4 space-y-2">
                <h4 className="font-bold text-sm text-mint group-hover:text-aqua transition-colors line-clamp-1">
                  {event.title}
                </h4>
                <div className="text-xs text-mint/60 space-y-0.5">
                  <p className="flex items-center gap-1 text-[11px]">
                    <Calendar className="w-3.5 h-3.5 text-aqua" />
                    {event.date}
                  </p>
                  <p className="line-clamp-1 text-[11px]">{event.venue}</p>
                </div>

                <div className="pt-3 border-t border-steel/20 flex items-center justify-between">
                  <span className="font-bold text-sm text-mint">
                    {event.price}
                  </span>
                  <Link
                    to={`/events?id=${event.id}`}
                    className="px-3 py-1 rounded-xl bg-steel/40 hover:bg-steel/60 text-xs font-bold text-aqua"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
