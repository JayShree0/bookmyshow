import apiClient from './client'
import { normalizeMovie } from './moviesApi'

export const watchlistApi = {
  getMyWatchlist: async () => {
    const list = await apiClient.get('/watchlist')
    return Array.isArray(list) ? list.map(normalizeMovie) : []
  },

  addToWatchlist: async (movieId) => {
    const res = await apiClient.post(`/watchlist/${movieId}`)
    return normalizeMovie(res)
  },

  removeFromWatchlist: async (movieId) => {
    return apiClient.delete(`/watchlist/${movieId}`)
  },
}

export default watchlistApi

