import apiClient from './client'

export function formatTimeFromISO(isoString) {
  if (!isoString) return '10:30 AM'
  try {
    const d = new Date(isoString)
    return d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  } catch {
    return '10:30 AM'
  }
}

export function normalizeShow(show) {
  if (!show) return null
  const formattedTime = formatTimeFromISO(show.startTime)
  const dateStr = show.startTime ? show.startTime.split('T')[0] : ''

  return {
    ...show,
    id: String(show.id),
    numericId: show.id,
    time: formattedTime,
    date: dateStr,
    format: show.showFormat || '2D',
    screen: show.screen?.name || 'Audi 1',
    status: (show.status || 'AVAILABLE').toLowerCase(),
    statusLabel: show.status === 'AVAILABLE' ? 'Available' : show.status,
    price: show.surcharge ? 180 + show.surcharge : 180,
    cinemaId: show.screen?.theater ? String(show.screen.theater.id) : null,
    movieId: show.movie ? String(show.movie.id) : null,
  }
}

export const showsApi = {
  getShows: async (params = {}) => {
    const list = await apiClient.get('/shows', { params })
    return Array.isArray(list) ? list.map(normalizeShow) : []
  },

  getShowsByMovie: async (movieId) => {
    const list = await apiClient.get(`/shows/movie/${movieId}`)
    return Array.isArray(list) ? list.map(normalizeShow) : []
  },

  getShowsByMovieAndCity: async (movieId, city) => {
    const list = await apiClient.get(`/shows/movie/${movieId}/city/${encodeURIComponent(city)}`)
    return Array.isArray(list) ? list.map(normalizeShow) : []
  },

  getShowById: async (id) => {
    const show = await apiClient.get(`/shows/${id}`)
    return normalizeShow(show)
  },

  getShowSeats: async (showId) => {
    return apiClient.get(`/shows/${showId}/seats`)
  },

  lockSeats: async (showId, seatIds, lockDurationMinutes = 5) => {
    return apiClient.post(`/shows/${showId}/lock`, {
      showId: Number(showId),
      seatIds: seatIds.map(Number),
      lockDurationMinutes,
    })
  },

  unlockSeats: async (showId, seatIds, lockToken) => {
    return apiClient.post(`/shows/${showId}/unlock`, {
      showId: Number(showId),
      seatIds: seatIds.map(Number),
      lockToken,
    })
  },
}

export default showsApi

