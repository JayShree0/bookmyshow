import apiClient from './client'

export function normalizeTheater(t) {
  if (!t) return null
  return {
    ...t,
    id: String(t.id),
    numericId: t.id,
    name: t.name,
    city: t.city,
    address: t.address || `${t.name}, ${t.city}`,
    area: t.address ? t.address.split(',')[0] : t.city,
    screens: t.totalScreens || (t.screens ? t.screens.length : 3),
    hasMTicket: true,
    hasFnB: true,
    hasWheelchair: true,
    hasDolbyAtmos: true,
    hasRecliner: true,
    priceRange: '₹180 - ₹450',
  }
}

export const theatersApi = {
  getTheaters: async () => {
    const list = await apiClient.get('/theaters')
    return Array.isArray(list) ? list.map(normalizeTheater) : []
  },

  getTheatersByCity: async (city) => {
    const list = await apiClient.get(`/theaters/city/${encodeURIComponent(city)}`)
    return Array.isArray(list) ? list.map(normalizeTheater) : []
  },

  getTheaterById: async (id) => {
    const theater = await apiClient.get(`/theaters/${id}`)
    return normalizeTheater(theater)
  },
}

export default theatersApi

