import React from 'react'
import { GENRES, LANGUAGES } from '../../data/movies'
import { SlidersHorizontal, RotateCcw } from 'lucide-react'

export function MovieFilter({
  selectedGenre,
  onSelectGenre,
  selectedLanguage,
  onSelectLanguage,
  sortBy,
  onSelectSort,
  onResetFilters,
}) {
  const isFiltered =
    selectedGenre !== 'All' || selectedLanguage !== 'All' || sortBy !== 'popularity'

  return (
    <div className="space-y-3 p-4 sm:p-5 rounded-2xl bg-steel/20 border border-steel/30 text-mint">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-bold text-mint">
          <SlidersHorizontal className="w-4 h-4 text-aqua" />
          <span>Filters & Categories</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Sorting Dropdown */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-mint/60 hidden sm:inline">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => onSelectSort(e.target.value)}
              className="bg-navy-dark border border-steel/40 text-mint text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-aqua"
            >
              <option value="popularity">Popularity</option>
              <option value="rating">Top Rated</option>
              <option value="release">New Releases</option>
            </select>
          </div>

          {/* Reset Filters */}
          {isFiltered && (
            <button
              onClick={onResetFilters}
              className="flex items-center gap-1 text-xs text-aqua hover:underline"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Genres Horizontal Scroll / Wrap */}
      <div>
        <span className="block text-[11px] font-semibold uppercase tracking-wider text-mint/50 mb-1.5">
          Genres
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          {GENRES.map((genre) => {
            const isActive = selectedGenre === genre
            return (
              <button
                key={genre}
                onClick={() => onSelectGenre(genre)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-aqua text-navy shadow-sm ring-1 ring-aqua'
                    : 'bg-navy-dark/60 text-mint/70 hover:text-mint hover:bg-steel/30 border border-steel/30'
                }`}
              >
                {genre}
              </button>
            )
          })}
        </div>
      </div>

      {/* Languages */}
      <div>
        <span className="block text-[11px] font-semibold uppercase tracking-wider text-mint/50 mb-1.5">
          Languages
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          {LANGUAGES.map((lang) => {
            const isActive = selectedLanguage === lang
            return (
              <button
                key={lang}
                onClick={() => onSelectLanguage(lang)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-aqua text-navy shadow-sm ring-1 ring-aqua'
                    : 'bg-navy-dark/60 text-mint/70 hover:text-mint hover:bg-steel/30 border border-steel/30'
                }`}
              >
                {lang}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

