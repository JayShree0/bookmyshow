import React, { useState } from 'react'
import { Link } from 'lucide-react'
import { Ticket, ShieldAlert, Smartphone, HelpCircle, Film, Heart } from 'lucide-react'
import { Modal } from '../common/Modal'
import { CITIES } from '../../data/cities'
import { useBooking } from '../../context/BookingContext'

export function Footer() {
  const { setSelectedCity } = useBooking()
  const [infoModal, setInfoModal] = useState({ isOpen: false, title: '', content: '' })

  const openInfo = (title, content) => {
    setInfoModal({ isOpen: true, title, content })
  }

  return (
    <footer className="bg-navy-dark text-mint border-t border-steel/30 pt-12 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Top Callout Strip */}
        <div className="p-6 rounded-2xl bg-steel/20 border border-steel/30 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-crimson flex items-center justify-center shrink-0">
              <Ticket className="w-6 h-6 text-mint rotate-45 fill-current" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-mint">
                List your show or event with BookMyShow
              </h4>
              <p className="text-xs text-mint/60 mt-0.5">
                Got a play, live concert, or indie screening? Reach millions of fans across top Indian cities.
              </p>
            </div>
          </div>
          <button
            onClick={() =>
              openInfo(
                'List Your Event (Demo)',
                'Thank you for your interest! In the full production platform, promoters and cinema owners access the BookMyShow Partner Portal to publish venues, auditoriums, dynamic pricing schedules, and ticket allocations.'
              )
            }
            className="px-5 py-2 rounded-xl bg-aqua hover:bg-aqua-hover text-navy font-bold text-xs tracking-wide transition-all shrink-0"
          >
            Contact Partner Desk
          </button>
        </div>

        {/* 4-Column Directory Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-xs">
          {/* Col 1: Cities */}
          <div>
            <h5 className="font-bold uppercase tracking-wider text-aqua mb-3">
              Cinemas by City
            </h5>
            <ul className="space-y-2">
              {CITIES.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => {
                      setSelectedCity(c.name)
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    className="text-mint/70 hover:text-aqua transition-colors text-left"
                  >
                    Movies in {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 2: Categories */}
          <div>
            <h5 className="font-bold uppercase tracking-wider text-aqua mb-3">
              Explore & Book
            </h5>
            <ul className="space-y-2 text-mint/70">
              <li>
                <a href="#now-showing" className="hover:text-aqua transition-colors">
                  Now Showing Movies
                </a>
              </li>
              <li>
                <a href="#trending" className="hover:text-aqua transition-colors">
                  Trending & Top Rated
                </a>
              </li>
              <li>
                <button
                  onClick={() =>
                    openInfo(
                      'Live Experiences',
                      'Browse curated stand-up specials, music festivals, Broadway-scale theatre plays, and derby football matches across India.'
                    )
                  }
                  className="hover:text-aqua transition-colors text-left"
                >
                  Live Concerts & Comedy
                </button>
              </li>
              <li>
                <button
                  onClick={() =>
                    openInfo(
                      'Exclusive Screening Formats',
                      'Experience films in IMAX with Laser, 4DX environmental effects, Dolby Atmos 64-channel spatial sound, and luxury VIP Recliner suites.'
                    )
                  }
                  className="hover:text-aqua transition-colors text-left"
                >
                  IMAX 3D & 4DX Theatres
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Care & Policies */}
          <div>
            <h5 className="font-bold uppercase tracking-wider text-aqua mb-3">
              Support & Policies
            </h5>
            <ul className="space-y-2 text-mint/70">
              <li>
                <button
                  onClick={() =>
                    openInfo(
                      'Demo Cancellation Policy',
                      'Free cancellation is supported on selected cinema tickets up to 20 minutes before the scheduled showtime. Concession snacks (F&B) are 100% refundable upon cancellation. Refunds are credited instantly in this demo simulation.'
                    )
                  }
                  className="hover:text-aqua transition-colors text-left"
                >
                  Cancellation Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() =>
                    openInfo(
                      'Frequently Asked Questions',
                      'Q: Do I need a printed ticket?\nA: No! All bookings generate an M-Ticket with an entry barcode.\n\nQ: How does seat hold work?\nA: During checkout, selected seats are held for 10 minutes so you can safely choose food combos and finish payment.'
                    )
                  }
                  className="hover:text-aqua transition-colors text-left"
                >
                  Help & FAQs
                </button>
              </li>
              <li>
                <button
                  onClick={() =>
                    openInfo(
                      'Privacy & Terms',
                      'This frontend clone does not harvest, sell, or transmit any sensitive consumer data. Demo cards, mock UPI IDs, and mock phone numbers are kept in browser memory and local storage solely for user testing.'
                    )
                  }
                  className="hover:text-aqua transition-colors text-left"
                >
                  Terms & Privacy Notice
                </button>
              </li>
              <li>
                <button
                  onClick={() =>
                    openInfo(
                      '24x7 Customer Care',
                      'Customer Support Helpline (Demo): 1800-BMS-HELP (Toll Free). Email: support@bookmyshow-demo.local'
                    )
                  }
                  className="hover:text-aqua transition-colors text-left"
                >
                  24x7 Customer Care
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Mobile Apps & Disclaimer */}
          <div>
            <h5 className="font-bold uppercase tracking-wider text-aqua mb-3">
              Mobile Experience
            </h5>
            <p className="text-mint/60 mb-3 text-[11px] leading-relaxed">
              Experience the fastest way to book tickets on iOS & Android devices.
            </p>
            <div className="space-y-2">
              <button
                onClick={() =>
                  openInfo(
                    'App Store Download',
                    'In production, this opens the official Apple App Store listing for BookMyShow with seamless Passbook & Apple Pay support.'
                  )
                }
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-steel/30 hover:bg-steel/40 border border-steel/40 text-mint font-medium text-xs transition-all"
              >
                <Smartphone className="w-4 h-4 text-aqua" />
                <span>Download on iOS</span>
              </button>
              <button
                onClick={() =>
                  openInfo(
                    'Google Play Download',
                    'In production, this opens the official Google Play Store listing with Google Pay integration.'
                  )
                }
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-steel/30 hover:bg-steel/40 border border-steel/40 text-mint font-medium text-xs transition-all"
              >
                <Smartphone className="w-4 h-4 text-aqua" />
                <span>Get on Android</span>
              </button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-steel/20 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-mint/60">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-crimson flex items-center justify-center">
              <Ticket className="w-3.5 h-3.5 text-mint rotate-45 fill-current" />
            </div>
            <span className="font-semibold text-mint">
              book<span className="text-crimson">my</span>show
            </span>
            <span className="text-mint/40">•</span>
            <span>BookMyShow-Inspired Clone Project — Made for Demo Purposes.</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Crafted with React 18, Vite & Tailwind CSS</span>
          </div>
        </div>
      </div>

      <Modal
        isOpen={infoModal.isOpen}
        onClose={() => setInfoModal({ isOpen: false, title: '', content: '' })}
        title={infoModal.title}
        subtitle="BookMyShow Demo Information"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-sm text-mint/80 whitespace-pre-line py-2">
          {infoModal.content}
        </div>
      </Modal>
    </footer>
  )
}

