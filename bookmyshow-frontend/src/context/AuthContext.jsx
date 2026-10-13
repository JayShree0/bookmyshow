import React, { createContext, useContext, useState, useEffect } from 'react'
import { authApi } from '../api/authApi'

const AuthContext = createContext(null)

const DEMO_USER = {
  id: 'usr-901',
  name: 'Rohan Sharma',
  email: 'rohan.sharma@example.com',
  phone: '9876543210',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
  membership: 'BMS Superstar',
}

const STORAGE_KEY = 'bms_demo_auth_user'
const TOKEN_KEY = 'bms_auth_token'
const REFRESH_KEY = 'bms_refresh_token'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : DEMO_USER
    } catch {
      return DEMO_USER
    }
  })

  // Synchronize with backend profile if token exists on mount
  useEffect(() => {
    async function syncProfile() {
      const token = localStorage.getItem(TOKEN_KEY)
      if (token) {
        try {
          const profile = await authApi.getProfile()
          if (profile) {
            setUser((prev) => ({
              ...prev,
              id: profile.id,
              name: profile.name,
              email: profile.email,
              phone: profile.phoneNumber,
              role: profile.role,
            }))
          }
        } catch {
          // Token expired or server unreachable, preserve offline user
        }
      }
    }
    syncProfile()
  }, [])

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
      } else {
        localStorage.removeItem(STORAGE_KEY)
      }
    } catch (e) {
      console.warn('Could not persist auth to localStorage', e)
    }
  }, [user])

  const signIn = async (credentials) => {
    // Attempt real backend authentication if credentials provide password
    if (credentials.email && credentials.password) {
      try {
        const res = await authApi.login(credentials.email, credentials.password)
        if (res?.accessToken) {
          localStorage.setItem(TOKEN_KEY, res.accessToken)
          if (res.refreshToken) {
            localStorage.setItem(REFRESH_KEY, res.refreshToken)
          }

          const loggedInUser = {
            id: res.userId || 'usr-1',
            name: res.name || credentials.name || 'Movie Fan',
            email: res.email || credentials.email,
            phone: credentials.phone || '9876543210',
            role: res.role || 'ROLE_CUSTOMER',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
            membership: res.role === 'ROLE_ADMIN' ? 'BMS Admin' : 'BMS Member',
          }
          setUser(loggedInUser)
          return loggedInUser
        }
      } catch (err) {
        console.warn('Backend login attempt failed, using fallback:', err.message)
      }
    }

    // Fallback simulated sign-in for tests and demo quick logins
    const loggedInUser = {
      id: credentials.id || 'usr-' + Math.floor(100 + Math.random() * 900),
      name: credentials.name || credentials.email?.split('@')[0] || 'Movie Fan',
      email: credentials.email || 'user@example.com',
      phone: credentials.phone || '9876543210',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      membership: 'BMS Member',
    }
    setUser(loggedInUser)
    return loggedInUser
  }

  const signUp = async (registrationData) => {
    try {
      const res = await authApi.register({
        name: registrationData.name,
        email: registrationData.email,
        password: registrationData.password,
        phoneNumber: registrationData.phone || '9876543210',
      })
      if (res?.accessToken) {
        localStorage.setItem(TOKEN_KEY, res.accessToken)
        if (res.refreshToken) {
          localStorage.setItem(REFRESH_KEY, res.refreshToken)
        }

        const newUser = {
          id: res.userId,
          name: res.name,
          email: res.email,
          phone: registrationData.phone || '9876543210',
          role: res.role || 'ROLE_CUSTOMER',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
          membership: 'BMS Member',
        }
        setUser(newUser)
        return { success: true, user: newUser }
      }
    } catch (err) {
      return { success: false, error: err.message }
    }

    return { success: true, user: await signIn(registrationData) }
  }

  const signOut = async () => {
    try {
      const refreshToken = localStorage.getItem(REFRESH_KEY)
      if (refreshToken) {
        await authApi.logout(refreshToken)
      }
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(REFRESH_KEY)
      setUser(null)
    }
  }

  const updateProfile = async (updates) => {
    try {
      if (updates.name || updates.phone) {
        await authApi.updateProfile({
          name: updates.name,
          phoneNumber: updates.phone,
        })
      }
    } catch {
      // Ignore network update errors
    }
    setUser((prev) => (prev ? { ...prev, ...updates } : null))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        signIn,
        signUp,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
