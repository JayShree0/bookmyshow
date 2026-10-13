import apiClient from './client'

export const authApi = {
  login: async (email, password) => {
    return apiClient.post('/auth/login', { email, password })
  },

  register: async (userData) => {
    return apiClient.post('/auth/register', userData)
  },

  getProfile: async () => {
    return apiClient.get('/users/me')
  },

  updateProfile: async (profileData) => {
    return apiClient.put('/users/me', profileData)
  },

  changePassword: async (currentPassword, newPassword) => {
    return apiClient.post('/auth/change-password', { currentPassword, newPassword })
  },

  logout: async (refreshToken) => {
    return apiClient.post('/auth/logout', { refreshToken })
  },
}

export default authApi

