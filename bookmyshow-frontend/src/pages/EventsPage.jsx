import React, { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { EVENTS_DATA } from '../data/events'
import { Modal } from '../components/common/Modal'
import { Button } from '../components/common/Button'
import { useBooking } from '../context/BookingContext'
import {
  Sparkles,
  Calendar,
  MapPin,
  Star,
  CheckCircle2,
  Ticket,
} from 'lucide-react'

const CATEGORIES = ['All', 'Live Events', 'Plays', 'Sports', 'Activities']

export function EventsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { showToast } = useBooking()

  const urlCategory = searchParams.get('cat') || 'All'
  const [activeCategory, setActiveCategory] = useState(urlCategory)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [isPassBooked, setIsPassBooked] = useState(false)

  const handleSelectCategory = (cat) => {
    setActiveCategory(cat)
    if (cat === 'All') {
      searchParams.delete('cat')
      setSearchParams(searchParams)
    } else {
      setSearchParams({ cat })
    }
  }

  const filteredEvents = useMemo(() => {
    if (activeCategory === 'All') return EVENTS_DATA
    return EVENTS_DATA.filter((e) => e.category === activeCategory)
  }, [activeCategory])

  const handleBookPass = () => {
    setIsPassBooked(true)
    showToast(`Pass confirmed for ${selectedEvent?.title}!`, 'success')
    setTimeout(() => {
      setIsPassBooked(false)
      setSelectedEvent(null)
    }, 1800)
  }

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      {/* Header */}
      <div className="p-4 sm:p-5 rounded-2xl bg-steel/20 border border-steel/30 text-mint space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-aqua" />
          <h1 className="text-xl sm:text-2xl font-black text-mint tracking-tight">
            Live Events, Plays, Sports & Experiences
          </h1>
        </div>
        <p className="text-xs text-mint/60">
          Book festival passes, stand-up comedy specials, broadway musicals, and derby sporting matches
        </p>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat
            return (
              <button
                key={cat}
                onClick={() => handleSelectCategory(cat)}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  isActive
                    ? 'bg-aqua text-navy shadow-md ring-1 ring-aqua'
                    : 'bg-navy-dark/70 border border-steel/30 text-mint/80 hover:bg-steel/30 hover:text-mint'
                }`}
              >
                {cat}
              </button>
            )
          })}
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => (
          <div
            key={event.id}
            className="rounded-2xl bg-steel/20 border border-steel/30 hover:border-aqua/60 overflow-hidden transition-all duration-300 flex flex-col justify-between group"
          >
            <div className="relative aspect-video w-full overflow-hidden bg-navy-dark">
              <img
                src={event.imageUrl}
                alt={event.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute top-3 left-3 px-2 py-0.5 rounded bg-crimson text-mint text-[10px] font-bold">
                {event.tag}
              </span>
              <span className="absolute bottom-3 right-3 px-2.5 py-0.5 rounded bg-navy-dark/90 backdrop-blur-md text-mint text-xs font-semibold">
                {event.category}
              </span>
            </div>

            <div className="p-4 sm:p-5 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-base text-mint group-hover:text-aqua transition-colors line-clamp-1">
                  {event.title}
                </h3>
                <p className="text-xs text-mint/70 mt-1 line-clamp-2 leading-relaxed">
                  {event.description}
                </p>

                <div className="text-xs text-mint/60 space-y-1 mt-3">
                  <p className="flex items-center gap-1.5 text-aqua font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    {event.date}
                  </p>
                  <p className="flex items-center gap-1.5 line-clamp-1">
                    <MapPin className="w-3.5 h-3.5 text-mint/40" />
                    {event.venue}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-steel/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-mint/50 uppercase tracking-wider block">
                    Starting from
                  </span>
                  <span className="font-bold text-sm text-mint">
                    {event.price}
                  </span>
                </div>

                <Button
                  variant="crimson"
                  size="sm"
                  onClick={() => setSelectedEvent(event)}
                >
                  Book Passes
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Event Details / Booking Pass Modal */}
      <Modal
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        title={selectedEvent?.title}
        subtitle={`${selectedEvent?.category} • ${selectedEvent?.venue}`}
        maxWidth="max-w-md"
      >
        {isPassBooked ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="text-lg font-bold text-mint">Pass Reserved!</h4>
            <p className="text-xs text-mint/60">
              Your entry pass confirmation has been saved to demo state.
            </p>
          </div>
        ) : (
          <div className="space-y-4 pt-1">
            <div className="relative aspect-video rounded-xl overflow-hidden bg-navy-dark">
              <img
                src={selectedEvent?.imageUrl}
                alt={selectedEvent?.title}
                className="w-full h-full object-cover"
              />
            </div>

            <p className="text-xs text-mint/80 leading-relaxed">
              {selectedEvent?.description}
            </p>

            <div className="p-3 rounded-xl bg-navy-dark text-xs space-y-1.5 border border-steel/20">
              <div className="flex justify-between">
                <span className="text-mint/60">Date & Time:</span>
                <span className="font-semibold text-aqua">{selectedEvent?.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-mint/60">Venue:</span>
                <span className="font-semibold text-mint">{selectedEvent?.venue}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-mint/60">Price:</span>
                <span className="font-bold text-mint">{selectedEvent?.price}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setSelectedEvent(null)}>
                Close
              </Button>
              <Button variant="crimson" onClick={handleBookPass}>
                Confirm Pass Reservation
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
