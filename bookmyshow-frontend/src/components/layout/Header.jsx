import React, { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useBooking } from '../../context/BookingContext'
import { useAuth } from '../../context/AuthContext'
import { SearchDropdown } from './SearchDropdown'
import { CitySelectorModal } from './CitySelectorModal'
import { NotificationDrawer } from './NotificationDrawer'
import { AuthModal } from './AuthModal'
import {
  MapPin,
  Heart,
  Bell,
  Ticket,
  User,
  Menu,
  X,
  ChevronDown,
  Film,
  Sparkles,
} from 'lucide-react'

export function Header() {
  const {
    selectedCity,
    setSelectedCity,
    favorites,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
  } = useBooking()

  const { user, signOut } = useAuth()
  const location = useLocation()

  const [isCityModalOpen, setIsCityModalOpen] = useState(false)
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const userMenuRef = useRef(null)

  // Close user dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false)
      }
    }
    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick)
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [isUserMenuOpen])

  const unreadNotifsCount = notifications.filter((n) => !n.read).length

  const categories = [
    { name: 'Movies', path: '/' },
    { name: 'Live Events', path: '/events?cat=Live Events' },
    { name: 'Plays', path: '/events?cat=Plays' },
    { name: 'Sports', path: '/events?cat=Sports' },
    { name: 'Activities', path: '/events?cat=Activities' },
  ]

  const isCategoryActive = (catPath) => {
    if (catPath === '/') return location.pathname === '/'
    return location.pathname + location.search === catPath
  }

  return (
    <header className="sticky top-0 z-40 bg-navy/95 backdrop-blur-md border-b border-steel/30 text-mint">
      {/* Top Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & City Selector */}
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="flex items-center gap-1.5 focus:outline-none group select-none"
              aria-label="BookMyShow Home"
            >
              <div className="w-8 h-8 rounded-lg bg-crimson flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <Ticket className="w-5 h-5 text-mint rotate-45 fill-current" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-xl font-black tracking-tight text-mint group-hover:text-aqua transition-colors">
                  book<span className="text-crimson">my</span>show
                </span>
                <span className="text-[9px] font-semibold tracking-wider text-aqua/70 uppercase">
                  Cinemas & Events
                </span>
              </div>
            </Link>

            {/* City Selector Button (Desktop) */}
            <button
              onClick={() => setIsCityModalOpen(true)}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-navy-dark/60 border border-steel/30 hover:border-aqua/60 hover:bg-steel/20 text-xs font-medium text-mint transition-all"
            >
              <MapPin className="w-3.5 h-3.5 text-aqua" />
              <span className="truncate max-w-[100px]">{selectedCity}</span>
              <ChevronDown className="w-3.5 h-3.5 text-mint/50" />
            </button>
          </div>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:block flex-1 max-w-md mx-2">
            <SearchDropdown />
          </div>

          {/* Actions: Watchlist, Notifications, Bookings, Auth */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* City Selector (Mobile icon) */}
            <button
              onClick={() => setIsCityModalOpen(true)}
              className="md:hidden p-2 rounded-xl text-mint/80 hover:text-mint hover:bg-steel/20 relative"
              aria-label="Change city"
              title={selectedCity}
            >
              <MapPin className="w-5 h-5 text-aqua" />
            </button>

            {/* Watchlist / Favorites */}
            <Link
              to="/favorites"
              className="relative p-2 rounded-xl text-mint/80 hover:text-mint hover:bg-steel/20 transition-colors"
              title="Watchlist"
              aria-label="Watchlist"
            >
              <Heart className="w-5 h-5" />
              {favorites.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-crimson text-mint text-[10px] font-bold flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </Link>

            {/* Notifications Popover */}
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-2 rounded-xl text-mint/80 hover:text-mint hover:bg-steel/20 transition-colors"
                title="Notifications"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-crimson ring-2 ring-navy" />
                )}
              </button>

              <NotificationDrawer
                isOpen={isNotifOpen}
                onClose={() => setIsNotifOpen(false)}
                notifications={notifications}
                onMarkRead={markNotificationRead}
                onMarkAllRead={markAllNotificationsRead}
              />
            </div>

            {/* My Bookings (Desktop) */}
            <Link
              to="/my-bookings"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-steel/40 hover:border-aqua hover:bg-steel/20 text-xs font-semibold text-mint transition-all"
            >
              <Ticket className="w-3.5 h-3.5 text-aqua" />
              <span>My Bookings</span>
            </Link>

            {/* User Profile / Sign In */}
            {user ? (
              <div ref={userMenuRef} className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-steel/30 hover:bg-steel/40 border border-steel/40 transition-all"
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-6 h-6 rounded-full object-cover border border-aqua"
                  />
                  <span className="hidden sm:inline text-xs font-medium text-mint truncate max-w-[100px]">
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-mint/50 hidden sm:inline" />
                </button>

                {isUserMenuOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-48 bg-navy border border-steel/40 rounded-xl shadow-xl z-50 py-1 text-xs"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <div className="px-3 py-2 border-b border-steel/20">
                      <p className="font-semibold text-mint truncate">{user.name}</p>
                      <p className="text-[10px] text-mint/50 truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded bg-aqua/20 text-aqua font-medium">
                        {user.membership || 'Member'}
                      </span>
                    </div>

                    <Link
                      to="/my-bookings"
                      className="flex items-center gap-2 px-3 py-2 text-mint/80 hover:text-mint hover:bg-steel/20"
                    >
                      <Ticket className="w-3.5 h-3.5 text-aqua" />
                      <span>My Bookings</span>
                    </Link>
                    <Link
                      to="/favorites"
                      className="flex items-center gap-2 px-3 py-2 text-mint/80 hover:text-mint hover:bg-steel/20"
                    >
                      <Heart className="w-3.5 h-3.5 text-crimson" />
                      <span>Watchlist</span>
                    </Link>

                    <button
                      onClick={() => signOut()}
                      className="w-full text-left px-3 py-2 text-crimson hover:bg-crimson/10 font-medium border-t border-steel/20 mt-1"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-4 py-1.5 rounded-xl bg-crimson hover:bg-crimson-hover text-mint text-xs font-semibold shadow-sm transition-all"
              >
                Sign In
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-mint/80 hover:text-mint hover:bg-steel/20"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Category Navigation Bar (Desktop) */}
        <div className="hidden md:flex items-center justify-between border-t border-steel/20 py-2.5 text-xs">
          <nav className="flex items-center gap-6">
            {categories.map((cat) => {
              const active = isCategoryActive(cat.path)
              return (
                <Link
                  key={cat.name}
                  to={cat.path}
                  className={`font-semibold tracking-wide transition-colors pb-0.5 ${
                    active
                      ? 'text-aqua border-b-2 border-aqua'
                      : 'text-mint/70 hover:text-mint'
                  }`}
                >
                  {cat.name}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-4 text-[11px] text-mint/60">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-aqua" />
              Book tickets seamlessly across {selectedCity}
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-navy-dark border-t border-steel/30 px-4 py-4 space-y-4 max-h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain animate-in slide-in-from-top duration-200">
          <SearchDropdown isMobile onSelect={() => setIsMobileMenuOpen(false)} />

          <div className="pt-2">
            <span className="text-[10px] font-bold text-mint/40 uppercase tracking-wider block mb-2">
              Explore Categories
            </span>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => (
                <Link
                  key={cat.name}
                  to={cat.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`p-2 rounded-lg text-xs font-semibold ${
                    isCategoryActive(cat.path)
                      ? 'bg-steel/40 text-aqua'
                      : 'text-mint/80 bg-navy/60 hover:bg-steel/20'
                  }`}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="border-t border-steel/20 pt-3 flex flex-col gap-2">
            <Link
              to="/my-bookings"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 py-2 text-xs font-semibold text-mint"
            >
              <Ticket className="w-4 h-4 text-aqua" />
              <span>My Bookings</span>
            </Link>
            <Link
              to="/favorites"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 py-2 text-xs font-semibold text-mint"
            >
              <Heart className="w-4 h-4 text-crimson" />
              <span>Watchlist</span>
            </Link>

            {!user && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false)
                    setIsAuthModalOpen(true)
                  }}
                  className="w-full py-2.5 rounded-xl bg-crimson hover:bg-crimson-hover text-mint text-xs font-bold text-center shadow transition-all"
                >
                  Sign In / Register
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* City Selector Modal */}
      <CitySelectorModal
        isOpen={isCityModalOpen}
        onClose={() => setIsCityModalOpen(false)}
        selectedCity={selectedCity}
        onSelectCity={setSelectedCity}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </header>
  )
}

