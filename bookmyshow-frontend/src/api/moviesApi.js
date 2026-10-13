import apiClient from './client'

export function normalizeMovie(backendMovie) {
  if (!backendMovie) return null

  const id = backendMovie.id
  const title = backendMovie.title || 'Untitled Movie'
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

  // Format duration from minutes (e.g. 166 -> "2h 46m")
  const mins = Number(backendMovie.durationMins) || 120
  const hours = Math.floor(mins / 60)
  const remainingMins = mins % 60
  const durationStr = `${hours}h ${remainingMins > 0 ? `${remainingMins}m` : ''}`.trim()

  // Split comma-separated languages and genres
  const languages = backendMovie.language
    ? backendMovie.language.split(',').map((s) => s.trim())
    : ['Hindi', 'English']
  const genres = backendMovie.genre
    ? backendMovie.genre.split(',').map((s) => s.trim())
    : ['Drama']

  return {
    ...backendMovie,
    id: String(id),
    numericId: id,
    slug,
    title,
    originalTitle: title,
    synopsis: backendMovie.description || '',
    duration: durationStr,
    durationMins: mins,
    certification: backendMovie.certificate || 'UA',
    languages,
    genres,
    formats: ['2D', '3D', 'IMAX 2D'],
    status: (backendMovie.status || 'NOW_SHOWING').toLowerCase(),
    rating: backendMovie.rating || 8.5,
    voteCount: backendMovie.totalRatings ? `${(backendMovie.totalRatings / 1000).toFixed(1)}K` : '15.2K',
    posterUrl: backendMovie.posterUrl || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
    backdropUrl: backendMovie.posterUrl || 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1920&q=80',
    trailerUrl: backendMovie.trailerUrl || 'https://www.youtube.com/embed/Way9Dexny3w',
    featured: (backendMovie.rating || 0) >= 8.8,
  }
}

export const moviesApi = {
  getMovies: async () => {
    const list = await apiClient.get('/movies')
    return Array.isArray(list) ? list.map(normalizeMovie) : []
  },

  getMovieById: async (id) => {
    const movie = await apiClient.get(`/movies/${id}`)
    return normalizeMovie(movie)
  },

  getMoviesByCity: async (city) => {
    const list = await apiClient.get(`/movies/city/${encodeURIComponent(city)}`)
    return Array.isArray(list) ? list.map(normalizeMovie) : []
  },

  searchMovies: async (keyword) => {
    const list = await apiClient.get('/movies/search', { params: { keyword } })
    return Array.isArray(list) ? list.map(normalizeMovie) : []
  },
}

export default moviesApi

