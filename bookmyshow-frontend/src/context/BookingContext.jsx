import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import { calculatePricing } from '../utils/pricing'
import { AVAILABLE_COUPONS, findCoupon } from '../data/coupons'
import { generateBookingId } from '../utils/formatters'
import { DEFAULT_CITY } from '../data/cities'
import { FOOD_ITEMS } from '../data/foodItems'
import { MOVIES } from '../data/movies'
import { CINEMAS } from '../data/cinemas'

import { moviesApi } from '../api/moviesApi'
import { theatersApi } from '../api/theatersApi'
import { showsApi } from '../api/showsApi'
import { bookingsApi } from '../api/bookingsApi'
import { couponsApi } from '../api/couponsApi'
import { watchlistApi } from '../api/watchlistApi'

const BookingContext = createContext(null)

const INITIAL_BOOKING_SESSION = {
  movieId: null,
  movie: null,
  selectedCity: DEFAULT_CITY,
  selectedCinema: null,
  selectedDate: null, // e.g. "2024-10-14"
  selectedShowtime: null, // showtime object
  ticketCount: 2,
  selectedSeats: [], // array of seat objects
  fnbItems: [], // array of { ...foodItem, quantity }
  appliedCoupon: null,
  lockToken: null,
  countdownSeconds: 600,
  isTimerActive: false,
  isExpired: false,
  contactDetails: {
    email: 'rohan.sharma@example.com',
    phone: '9876543210',
  },
  paymentMethod: 'upi', // 'upi' | 'card' | 'netbanking'
  upiId: 'rohan@okhdfcbank',
  bankName: 'HDFC Bank',
  cardDetails: {
    cardNumber: '4532 8920 1289 4012',
    cardHolder: 'ROHAN SHARMA',
    expiry: '12/28',
    cvv: '891',
  },
  simulatePaymentFailure: false, // Demo toggle to test failure flow
  paymentStatus: 'not_started', // 'not_started' | 'processing' | 'failed' | 'success'
  bookingId: null,
  step: 'details', // 'details' | 'seats' | 'fnb' | 'checkout' | 'confirmation'
}

const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: 'Welcome to BookMyShow!',
    message: 'Explore blockbuster movies, exclusive IMAX experiences, and concession combos.',
    time: 'Just now',
    type: 'welcome',
    read: false,
  },
  {
    id: 'notif-2',
    title: 'Weekend Offer Active: MOVIEBUFF',
    message: 'Use code MOVIEBUFF for 15% off up to ₹150 on bookings above ₹500.',
    time: '2 hours ago',
    type: 'promo',
    read: false,
  },
]

export function BookingProvider({ children }) {
  // Global Filters & Preferences
  const [selectedCity, setSelectedCityState] = useState(() => {
    try {
      return localStorage.getItem('bms_selected_city') || DEFAULT_CITY
    } catch {
      return DEFAULT_CITY
    }
  })

  // Live Movies catalog from backend with local fallback
  const [movies, setMovies] = useState(MOVIES)

  // Live Theaters catalog
  const [theaters, setTheaters] = useState(CINEMAS)

  // Live Coupons
  const [coupons, setCoupons] = useState(AVAILABLE_COUPONS)

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('All')
  const [selectedLanguage, setSelectedLanguage] = useState('All')
  const [sortBy, setSortBy] = useState('popularity') // 'popularity' | 'rating' | 'release'

  // Persistent Favorites / Watchlist
  const [favorites, setFavorites] = useState(() => {
    try {
      const stored = localStorage.getItem('bms_favorites')
      return stored ? JSON.parse(stored) : ['dune-part-two', 'oppenheimer']
    } catch {
      return ['dune-part-two', 'oppenheimer']
    }
  })

  // Persistent Bookings History
  const [myBookings, setMyBookings] = useState(() => {
    try {
      const stored = localStorage.getItem('bms_my_bookings')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  // Notifications
  const [notifications, setNotifications] = useState(() => {
    try {
      const stored = localStorage.getItem('bms_notifications')
      return stored ? JSON.parse(stored) : INITIAL_NOTIFICATIONS
    } catch {
      return INITIAL_NOTIFICATIONS
    }
  })

  // Active Booking Session
  const [bookingSession, setBookingSession] = useState(() => {
    try {
      const stored = localStorage.getItem('bms_active_session')
      if (stored) {
        const parsed = JSON.parse(stored)
        return {
          ...INITIAL_BOOKING_SESSION,
          ...parsed,
          paymentStatus: 'not_started',
        }
      }
    } catch {
      // Fallback
    }
    return INITIAL_BOOKING_SESSION
  })

  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)

  // Toast Helper
  const showToast = useCallback((msg, type = 'info') => {
    setToastMessage({ msg, type, id: Date.now() })
    setTimeout(() => {
      setToastMessage((current) => (current && current.id === Date.now() ? null : null))
    }, 4000)
  }, [])

  // 1. Fetch live movies from backend
  useEffect(() => {
    async function loadMovies() {
      try {
        const liveMovies = await moviesApi.getMovies()
        if (liveMovies && liveMovies.length > 0) {
          // Merge live movies with local fallback to preserve rich cast/backdrops if missing
          const merged = liveMovies.map((lm) => {
            const localMatch = MOVIES.find((m) => m.title.toLowerCase() === lm.title.toLowerCase())
            return localMatch ? { ...localMatch, ...lm, id: localMatch.id, numericId: lm.id } : lm
          })
          setMovies(merged)
        }
      } catch {
        // Fallback to local MOVIES
      }
    }
    loadMovies()
  }, [])

  // 2. Fetch live coupons from backend
  useEffect(() => {
    async function loadCoupons() {
      try {
        const liveCoupons = await couponsApi.getActiveCoupons()
        if (liveCoupons && liveCoupons.length > 0) {
          setCoupons(liveCoupons)
        }
      } catch {
        // Keep default coupons
      }
    }
    loadCoupons()
  }, [])

  // 3. Fetch live bookings from backend
  useEffect(() => {
    async function loadMyBookings() {
      const token = localStorage.getItem('bms_auth_token')
      if (token) {
        try {
          const backendBookings = await bookingsApi.getMyBookings()
          if (backendBookings && backendBookings.length > 0) {
            setMyBookings((prev) => {
              // Combine backend bookings with local ones (avoid duplicates by bookingId)
              const ids = new Set(backendBookings.map((b) => b.bookingId))
              const uniqueLocal = prev.filter((b) => !ids.has(b.bookingId))
              return [...backendBookings, ...uniqueLocal]
            })
          }
        } catch {
          // Keep local bookings
        }
      }
    }
    loadMyBookings()
  }, [])

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('bms_selected_city', selectedCity)
    } catch (e) {
      console.warn('LocalStorage error', e)
    }
  }, [selectedCity])

  useEffect(() => {
    try {
      localStorage.setItem('bms_favorites', JSON.stringify(favorites))
    } catch (e) {
      console.warn('LocalStorage error', e)
    }
  }, [favorites])

  useEffect(() => {
    try {
      localStorage.setItem('bms_my_bookings', JSON.stringify(myBookings))
    } catch (e) {
      console.warn('LocalStorage error', e)
    }
  }, [myBookings])

  useEffect(() => {
    try {
      localStorage.setItem('bms_notifications', JSON.stringify(notifications))
    } catch (e) {
      console.warn('LocalStorage error', e)
    }
  }, [notifications])

  useEffect(() => {
    try {
      if (bookingSession.movie && bookingSession.paymentStatus !== 'success') {
        localStorage.setItem('bms_active_session', JSON.stringify(bookingSession))
      } else {
        localStorage.removeItem('bms_active_session')
      }
    } catch (e) {
      console.warn('LocalStorage error', e)
    }
  }, [bookingSession])

  // Countdown Hold Timer
  useEffect(() => {
    if (!bookingSession.isTimerActive || bookingSession.countdownSeconds <= 0) return

    const intervalId = setInterval(() => {
      setBookingSession((prev) => {
        if (!prev.isTimerActive) return prev
        if (prev.countdownSeconds <= 1) {
          return {
            ...prev,
            countdownSeconds: 0,
            isTimerActive: false,
            isExpired: true,
          }
        }
        return {
          ...prev,
          countdownSeconds: prev.countdownSeconds - 1,
        }
      })
    }, 1000)

    return () => clearInterval(intervalId)
  }, [bookingSession.isTimerActive, bookingSession.countdownSeconds])

  // Derived Pricing
  const pricing = useMemo(() => {
    return calculatePricing(
      bookingSession.selectedSeats,
      bookingSession.fnbItems,
      bookingSession.appliedCoupon
    )
  }, [
    bookingSession.selectedSeats,
    bookingSession.fnbItems,
    bookingSession.appliedCoupon,
  ])

  // Active booking check
  const hasActiveBooking = useMemo(() => {
    return !!(
      bookingSession.movie &&
      bookingSession.selectedCinema &&
      bookingSession.selectedSeats.length > 0 &&
      bookingSession.paymentStatus !== 'success'
    )
  }, [
    bookingSession.movie,
    bookingSession.selectedCinema,
    bookingSession.selectedSeats.length,
    bookingSession.paymentStatus,
  ])

  // City selection with cinema validation
  const setSelectedCity = useCallback(
    (cityName) => {
      setSelectedCityState(cityName)
      setBookingSession((prev) => {
        if (prev.selectedCinema && prev.selectedCinema.city?.toLowerCase() !== cityName.toLowerCase()) {
          showToast(`Cinema location reset: ${cityName} selected.`, 'warning')
          return {
            ...prev,
            selectedCity: cityName,
            selectedCinema: null,
            selectedShowtime: null,
            selectedSeats: [],
            isTimerActive: false,
          }
        }
        return { ...prev, selectedCity: cityName }
      })
    },
    [showToast]
  )

  // Start booking for a movie
  const startMovieBooking = useCallback((movie) => {
    setBookingSession((prev) => {
      if (prev.movie && prev.movie.id === movie.id) {
        return { ...prev, movie }
      }
      return {
        ...INITIAL_BOOKING_SESSION,
        movie,
        movieId: movie.id,
        selectedCity: prev.selectedCity || DEFAULT_CITY,
        step: 'details',
      }
    })
  }, [])

  // Cinema selection
  const selectCinema = useCallback((cinema) => {
    setBookingSession((prev) => ({
      ...prev,
      selectedCinema: cinema,
    }))
  }, [])

  // Date selection
  const selectDate = useCallback((dateString) => {
    setBookingSession((prev) => ({
      ...prev,
      selectedDate: dateString,
    }))
  }, [])

  // Showtime selection - starts countdown hold timer
  const selectShowtime = useCallback((showtime, cinema, movie, dateString) => {
    if (showtime.status === 'sold_out') return false

    setBookingSession((prev) => ({
      ...prev,
      movie: movie || prev.movie,
      movieId: (movie && movie.id) || prev.movieId,
      selectedCinema: cinema || prev.selectedCinema,
      selectedDate: dateString || prev.selectedDate,
      selectedShowtime: showtime,
      isTimerActive: true,
      countdownSeconds: 600,
      isExpired: false,
      step: 'seats',
    }))
    return true
  }, [])

  // Change ticket count
  const setTicketCount = useCallback((count) => {
    setBookingSession((prev) => {
      const nextSeats =
        prev.selectedSeats.length > count
          ? prev.selectedSeats.slice(0, count)
          : prev.selectedSeats

      return {
        ...prev,
        ticketCount: count,
        selectedSeats: nextSeats,
      }
    })
  }, [])

  // Toggle seat selection with backend seat locking integration
  const toggleSeat = useCallback(
    async (seat) => {
      if (seat.isOccupied) return false

      let isSelecting = false
      let updatedSeats = []
      let success = true

      setBookingSession((prev) => {
        const isSelected = prev.selectedSeats.some((s) => s.id === seat.id)
        isSelecting = !isSelected

        if (isSelected) {
          // Deselect
          updatedSeats = prev.selectedSeats.filter((s) => s.id !== seat.id)
        } else {
          // Select: cannot exceed ticketCount
          if (prev.selectedSeats.length >= prev.ticketCount) {
            showToast(`You have already selected ${prev.ticketCount} seat(s). Increase ticket count to add more.`, 'info')
            success = false
            return prev
          }
          updatedSeats = [...prev.selectedSeats, seat]
        }

        return {
          ...prev,
          selectedSeats: updatedSeats,
          isTimerActive: true,
        }
      })

      // Backend Seat Lock / Unlock call if show has numeric ID and seat has numeric showSeatId
      const showId = bookingSession.selectedShowtime?.numericId
      const showSeatId = seat.showSeatId || (typeof seat.id === 'number' ? seat.id : null)

      if (showId && showSeatId) {
        try {
          if (isSelecting) {
            const lockRes = await showsApi.lockSeats(showId, [showSeatId], 5)
            if (lockRes?.lockToken) {
              setBookingSession((prev) => ({
                ...prev,
                lockToken: lockRes.lockToken,
                countdownSeconds: lockRes.remainingSeconds || 300,
              }))
            }
          } else if (bookingSession.lockToken) {
            await showsApi.unlockSeats(showId, [showSeatId], bookingSession.lockToken)
          }
        } catch (err) {
          console.warn('Backend seat lock/unlock notice:', err.message)
        }
      }

      return success
    },
    [showToast, bookingSession.selectedShowtime, bookingSession.lockToken]
  )

  // Clear all seats
  const clearSeats = useCallback(async () => {
    const showId = bookingSession.selectedShowtime?.numericId
    const lockToken = bookingSession.lockToken
    const seatIds = bookingSession.selectedSeats.map((s) => s.showSeatId || s.id).filter(Boolean)

    if (showId && lockToken && seatIds.length > 0) {
      try {
        await showsApi.unlockSeats(showId, seatIds, lockToken)
      } catch (e) {
        console.warn('Could not release locks on backend', e)
      }
    }

    setBookingSession((prev) => ({
      ...prev,
      selectedSeats: [],
      lockToken: null,
    }))
  }, [bookingSession.selectedShowtime, bookingSession.lockToken, bookingSession.selectedSeats])

  // Update Food & Beverage Item Quantity
  const updateFnbQuantity = useCallback((foodItem, delta) => {
    setBookingSession((prev) => {
      const existingItems = [...prev.fnbItems]
      const index = existingItems.findIndex((item) => item.id === foodItem.id)

      if (index >= 0) {
        const newQty = Math.max(0, existingItems[index].quantity + delta)
        if (newQty === 0) {
          existingItems.splice(index, 1)
        } else {
          existingItems[index] = { ...existingItems[index], quantity: newQty }
        }
      } else if (delta > 0) {
        existingItems.push({ ...foodItem, quantity: delta })
      }

      return {
        ...prev,
        fnbItems: existingItems,
      }
    })
  }, [])

  // Apply Promo Coupon with server pricing verification
  const applyCouponCode = useCallback(
    async (code) => {
      const cleanCode = (code || '').trim().toUpperCase()
      const coupon = coupons.find((c) => c.code === cleanCode) || findCoupon(cleanCode)

      if (!coupon) {
        return {
          success: false,
          message: 'Invalid promo code. Try BMS50, MOVIEBUFF, or SNACK10.',
        }
      }

      // Minimum order rule check
      const currentTicketSubtotal = bookingSession.selectedSeats.reduce(
        (sum, s) => sum + (Number(s.price) || 0),
        0
      )
      const currentFoodSubtotal = bookingSession.fnbItems.reduce(
        (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
        0
      )
      const totalEligible =
        coupon.appliesTo === 'fnb'
          ? currentFoodSubtotal
          : coupon.appliesTo === 'tickets'
          ? currentTicketSubtotal
          : currentTicketSubtotal + currentFoodSubtotal

      if (coupon.minOrder && totalEligible < coupon.minOrder) {
        return {
          success: false,
          message: `Minimum order value of ₹${coupon.minOrder} required to apply ${coupon.code}.`,
        }
      }

      // Check if backend price calculation is possible
      const seatIds = bookingSession.selectedSeats
        .map((s) => s.showSeatId || (typeof s.id === 'number' ? s.id : null))
        .filter(Boolean)

      if (seatIds.length > 0) {
        try {
          await bookingsApi.calculatePrice(seatIds, coupon.code)
        } catch (err) {
          console.warn('Backend coupon check warning:', err.message)
        }
      }

      setBookingSession((prev) => ({
        ...prev,
        appliedCoupon: coupon,
      }))

      showToast(`Promo code ${coupon.code} applied successfully!`, 'success')
      return { success: true, message: `Offer ${coupon.code} applied!` }
    },
    [coupons, bookingSession.selectedSeats, bookingSession.fnbItems, showToast]
  )

  // Remove Applied Coupon
  const removeCoupon = useCallback(() => {
    setBookingSession((prev) => ({
      ...prev,
      appliedCoupon: null,
    }))
    showToast('Promo code removed', 'info')
  }, [showToast])

  // Update Contact Details
  const updateContactDetails = useCallback((details) => {
    setBookingSession((prev) => ({
      ...prev,
      contactDetails: {
        ...prev.contactDetails,
        ...details,
      },
    }))
  }, [])

  // Set Payment Method
  const setPaymentMethod = useCallback((method) => {
    setBookingSession((prev) => ({
      ...prev,
      paymentMethod: method,
    }))
  }, [])

  // Toggle Demo Payment Failure simulation
  const toggleSimulateFailure = useCallback((val) => {
    setBookingSession((prev) => ({
      ...prev,
      simulatePaymentFailure: typeof val === 'boolean' ? val : !prev.simulatePaymentFailure,
    }))
  }, [])

  // Restart / Reset Active Hold Timer
  const restartHoldTimer = useCallback(() => {
    setBookingSession((prev) => ({
      ...prev,
      countdownSeconds: 600,
      isTimerActive: true,
      isExpired: false,
    }))
    showToast('Seat hold timer refreshed for 10 minutes.', 'info')
  }, [showToast])

  // Reset Booking Session
  const resetBookingSession = useCallback(() => {
    setBookingSession({
      ...INITIAL_BOOKING_SESSION,
      selectedCity,
    })
    try {
      localStorage.removeItem('bms_active_session')
    } catch (e) {
      console.warn('LocalStorage error', e)
    }
  }, [selectedCity])

  // Execute Simulated & Real Payment
  const processSimulatedPayment = useCallback(async () => {
    if (isProcessingPayment) return { success: false, error: 'Payment already in progress' }

    if (bookingSession.isExpired || bookingSession.countdownSeconds <= 0) {
      return {
        success: false,
        error: 'Your seat hold has expired. Please reselect your seats to proceed.',
      }
    }

    if (!bookingSession.selectedSeats || bookingSession.selectedSeats.length === 0) {
      return { success: false, error: 'No seats selected.' }
    }

    setIsProcessingPayment(true)
    setBookingSession((prev) => ({ ...prev, paymentStatus: 'processing' }))

    // Simulate network delay of 1.2 seconds
    await new Promise((resolve) => setTimeout(resolve, 1200))

    // Check if user enabled simulated failure
    if (bookingSession.simulatePaymentFailure) {
      setIsProcessingPayment(false)
      setBookingSession((prev) => ({
        ...prev,
        paymentStatus: 'failed',
      }))
      return {
        success: false,
        error: 'Simulated Bank Gateway Error: Transaction declined by issuing bank (Demo Mode).',
      }
    }

    let confirmedBooking = null
    const bookingId = generateBookingId(bookingSession.selectedCity || 'MUM')
    const idempotencyKey = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `idemp-${Date.now()}`

    // Attempt real backend booking creation
    const showNumericId = bookingSession.selectedShowtime?.numericId
    const seatNumericIds = bookingSession.selectedSeats
      .map((s) => s.showSeatId || (typeof s.id === 'number' ? s.id : null))
      .filter(Boolean)

    if (showNumericId && seatNumericIds.length > 0) {
      try {
        const backendRes = await bookingsApi.createBooking(
          {
            showId: showNumericId,
            seatIds: seatNumericIds,
            lockToken: bookingSession.lockToken,
            paymentMethod: (bookingSession.paymentMethod || 'UPI').toUpperCase(),
            paymentGateway: 'MOCK',
            couponCode: bookingSession.appliedCoupon?.code || null,
          },
          idempotencyKey
        )

        if (backendRes) {
          confirmedBooking = {
            ...backendRes,
            bookingId: backendRes.bookingId || backendRes.bookingNumber || bookingId,
            fnbItems: bookingSession.fnbItems,
          }
        }
      } catch (err) {
        console.warn('Backend booking creation note:', err.message)
      }
    }

    // Fallback if backend booking was not created (e.g. offline demo or mock show)
    if (!confirmedBooking) {
      confirmedBooking = {
        bookingId,
        bookingNumber: bookingId,
        createdAt: new Date().toISOString(),
        movie: bookingSession.movie,
        cinema: bookingSession.selectedCinema,
        date: bookingSession.selectedDate,
        showtime: bookingSession.selectedShowtime,
        seats: bookingSession.selectedSeats,
        ticketCount: bookingSession.selectedSeats.length,
        fnbItems: bookingSession.fnbItems,
        pricing: { ...pricing },
        paymentMethod: bookingSession.paymentMethod,
        contactDetails: { ...bookingSession.contactDetails },
        status: 'CONFIRMED',
      }
    }

    // Prepend to My Bookings
    setMyBookings((prev) => [confirmedBooking, ...prev])

    // Add confirmation notification
    const newNotif = {
      id: 'notif-' + Date.now(),
      title: `Booking Confirmed: ${bookingSession.movie?.title}`,
      message: `Your tickets (${confirmedBooking.seats.map((s) => s.label).join(', ')}) at ${confirmedBooking.cinema?.name} are ready!`,
      time: 'Just now',
      type: 'booking',
      read: false,
      bookingId: confirmedBooking.bookingId,
    }
    setNotifications((prev) => [newNotif, ...prev])

    // Update active session with success
    setBookingSession((prev) => ({
      ...prev,
      paymentStatus: 'success',
      bookingId: confirmedBooking.bookingId,
      isTimerActive: false,
      lastConfirmedBooking: confirmedBooking,
    }))

    setIsProcessingPayment(false)
    return { success: true, bookingId: confirmedBooking.bookingId, booking: confirmedBooking }
  }, [
    isProcessingPayment,
    bookingSession,
    pricing,
  ])

  // Cancel an existing confirmed booking with backend synchronization
  const cancelBooking = useCallback(
    async (targetBookingId, reason = 'Customer requested cancellation') => {
      // Find booking to check numeric ID
      const target = myBookings.find((b) => b.bookingId === targetBookingId || String(b.id) === String(targetBookingId))

      if (target?.id && typeof target.id === 'number') {
        try {
          await bookingsApi.cancelBooking(target.id, reason)
        } catch (err) {
          console.warn('Backend cancel booking notice:', err.message)
        }
      }

      setMyBookings((prev) =>
        prev.map((b) =>
          b.bookingId === targetBookingId || String(b.id) === String(targetBookingId)
            ? { ...b, status: 'CANCELLED', cancelledAt: new Date().toISOString() }
            : b
        )
      )

      const cancelNotif = {
        id: 'notif-' + Date.now(),
        title: `Booking Cancelled: ${targetBookingId}`,
        message: 'Your booking has been cancelled and a refund has been initiated to your source account.',
        time: 'Just now',
        type: 'cancellation',
        read: false,
      }
      setNotifications((prev) => [cancelNotif, ...prev])
      showToast(`Booking ${targetBookingId} cancelled successfully.`, 'info')
    },
    [myBookings, showToast]
  )

  // Toggle favorite movie with watchlist API synchronization
  const toggleFavorite = useCallback(
    async (movieId) => {
      const isFav = favorites.includes(movieId)
      setFavorites((prev) => {
        const updated = isFav ? prev.filter((id) => id !== movieId) : [...prev, movieId]
        return updated
      })

      showToast(isFav ? 'Removed from Watchlist' : 'Added to Watchlist!', 'success')

      // Sync with backend if numeric ID
      const targetMovie = movies.find((m) => m.id === movieId || m.slug === movieId)
      if (targetMovie?.numericId) {
        try {
          if (isFav) {
            await watchlistApi.removeFromWatchlist(targetMovie.numericId)
          } else {
            await watchlistApi.addToWatchlist(targetMovie.numericId)
          }
        } catch {
          // Ignore offline watchlist notice
        }
      }
    },
    [favorites, movies, showToast]
  )

  // Notification actions
  const markNotificationRead = useCallback((notifId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
    )
  }, [])

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  return (
    <BookingContext.Provider
      value={{
        // Discovery & Filters
        movies,
        theaters,
        coupons,
        selectedCity,
        setSelectedCity,
        searchQuery,
        setSearchQuery,
        selectedGenre,
        setSelectedGenre,
        selectedLanguage,
        setSelectedLanguage,
        sortBy,
        setSortBy,

        // Favorites & Bookings & Notifications
        favorites,
        toggleFavorite,
        myBookings,
        cancelBooking,
        notifications,
        markNotificationRead,
        markAllNotificationsRead,

        // Active Booking State
        bookingSession,
        hasActiveBooking,
        pricing,
        isProcessingPayment,
        toastMessage,
        showToast,

        // Booking Actions
        startMovieBooking,
        selectCinema,
        selectDate,
        selectShowtime,
        setTicketCount,
        toggleSeat,
        clearSeats,
        updateFnbQuantity,
        applyCouponCode,
        removeCoupon,
        updateContactDetails,
        setPaymentMethod,
        toggleSimulateFailure,
        restartHoldTimer,
        resetBookingSession,
        processSimulatedPayment,
      }}
    >
      {children}
    </BookingContext.Provider>
  )
}

export function useBooking() {
  const context = useContext(BookingContext)
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider')
  }
  return context
}
