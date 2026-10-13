import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { BookingProvider, useBooking } from './context/BookingContext'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { ResumeBookingBanner } from './components/layout/ResumeBookingBanner'
import { Toast } from './components/common/Toast'

// Pages
import { HomePage } from './pages/HomePage'
import { MovieDetailsPage } from './pages/MovieDetailsPage'
import { SeatSelectionPage } from './pages/SeatSelectionPage'
import { FoodBeveragePage } from './pages/FoodBeveragePage'
import { CheckoutPage } from './pages/CheckoutPage'
import { ConfirmationPage } from './pages/ConfirmationPage'
import { MyBookingsPage } from './pages/MyBookingsPage'
import { FavoritesPage } from './pages/FavoritesPage'
import { EventsPage } from './pages/EventsPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { AuthPage } from './pages/AuthPage'

function AppContent() {
  const { toastMessage } = useBooking()

  return (
    <div className="min-h-screen bg-navy text-mint flex flex-col font-sans selection:bg-crimson selection:text-mint">
      {/* Resume Booking Banner (if in progress) */}
      <ResumeBookingBanner />

      {/* Global Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<AuthPage initialTab="signin" />} />
          <Route path="/signup" element={<AuthPage initialTab="signup" />} />
          <Route path="/movies/:movieId" element={<MovieDetailsPage />} />
          <Route path="/booking/seats" element={<SeatSelectionPage />} />
          <Route path="/booking/food" element={<FoodBeveragePage />} />
          <Route path="/booking/checkout" element={<CheckoutPage />} />
          <Route path="/booking/confirmation/:bookingId" element={<ConfirmationPage />} />
          <Route path="/my-bookings" element={<MyBookingsPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Global Toast */}
      {toastMessage && <Toast toast={toastMessage} />}
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <BookingProvider>
          <AppContent />
        </BookingProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
