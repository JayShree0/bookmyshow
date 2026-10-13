import React, { useState, useRef, useEffect, useMemo } from 'react'
import { Search, X, Film, Star } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { MOVIES } from '../../data/movies'
import { ImageWithFallback } from '../common/ImageWithFallback'

export function SearchDropdown({ isMobile = false, onSelect }) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)
  const navigate = useNavigate()

  // Filter movies by title, cast members, genres, languages
  const filteredMovies = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase().trim()

    return MOVIES.filter((movie) => {
      const matchTitle = movie.title.toLowerCase().includes(q)
      const matchGenre = movie.genres.some((g) => g.toLowerCase().includes(q))
      const matchLang = movie.languages.some((l) => l.toLowerCase().includes(q))
      const matchCast = movie.cast?.some(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.role.toLowerCase().includes(q)
      )
      const matchDirector = movie.director?.toLowerCase().includes(q)

      return matchTitle || matchGenre || matchLang || matchCast || matchDirector
    })
  }, [query])

  // Close on outside click or escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const handleSelectMovie = (movieId) => {
    setIsOpen(false)
    setQuery('')
    if (onSelect) onSelect()
    navigate(`/movies/${movieId}`)
  }

  return (
    <div ref={containerRef} className={`relative ${isMobile ? 'w-full' : 'w-72 lg:w-96'}`}>
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 w-4 h-4 text-aqua/70 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search for Movies, Cast, Genres..."
          className="w-full bg-navy-dark/80 border border-steel/40 text-mint text-xs sm:text-sm rounded-xl pl-9 pr-9 py-2 placeholder-mint/40 focus:outline-none focus:border-aqua focus:ring-1 focus:ring-aqua transition-all duration-200"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('')
              setIsOpen(false)
            }}
            className="absolute right-3 p-0.5 rounded text-mint/40 hover:text-mint"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && query.trim() && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-navy border border-steel/40 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="p-2 border-b border-steel/20 flex items-center justify-between text-[11px] text-mint/60">
            <span>Search Results ({filteredMovies.length})</span>
            <span>ESC to close</span>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-steel/15">
            {filteredMovies.length > 0 ? (
              filteredMovies.map((movie) => (
                <button
                  key={movie.id}
                  onClick={() => handleSelectMovie(movie.id)}
                  className="w-full p-2.5 flex items-center gap-3 text-left hover:bg-steel/20 transition-colors group"
                >
                  <div className="w-10 h-14 rounded overflow-hidden shrink-0 bg-navy-dark">
                    <ImageWithFallback
                      src={movie.posterUrl}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h5 className="text-sm font-semibold text-mint group-hover:text-aqua transition-colors truncate">
                      {movie.title}
                    </h5>
                    <div className="flex items-center gap-2 text-xs text-mint/60 mt-0.5">
                      <span className="flex items-center gap-0.5 text-amber-400 font-medium">
                        <Star className="w-3 h-3 fill-current" />
                        {movie.rating}
                      </span>
                      <span>•</span>
                      <span className="truncate">{movie.genres.join(', ')}</span>
                      <span>•</span>
                      <span>{movie.languages[0]}</span>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-mint/60">
                <Film className="w-8 h-8 text-aqua/40 mx-auto mb-2" />
                <p>No movies or stars matched &ldquo;{query}&rdquo;</p>
                <p className="text-[11px] text-mint/40 mt-1">
                  Try searching for Dune, Oppenheimer, Kalki, Stree, etc.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

