import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

// Request interceptor: attach JWT bearer token if available
apiClient.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('bms_auth_token')
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch {
      // Ignore storage errors in restricted contexts
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: extract response data or format meaningful errors
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config

    // Handle 401 Unauthorized token refresh if refresh token is available
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const refreshToken = localStorage.getItem('bms_refresh_token')
        if (refreshToken) {
          const res = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken })
          if (res.data?.accessToken) {
            localStorage.setItem('bms_auth_token', res.data.accessToken)
            originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`
            return apiClient(originalRequest)
          }
        }
      } catch {
        // Refresh token failed: clean expired tokens
        localStorage.removeItem('bms_auth_token')
        localStorage.removeItem('bms_refresh_token')
      }
    }

    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected network error occurred'

    return Promise.reject(new Error(message))
  }
)

export default apiClient

