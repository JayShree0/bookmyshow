import React, { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBooking } from '../context/BookingContext'
import { generateAuditoriumSeats } from '../data/seats'
import { formatShowDate } from '../utils/formatters'
import { ScreenIndicator } from '../components/seats/ScreenIndicator'
import { TicketCountPicker } from '../components/seats/TicketCountPicker'
import { SeatLegend } from '../components/seats/SeatLegend'
import { SeatGrid } from '../components/seats/SeatGrid'
import { SeatSummaryDock } from '../components/seats/SeatSummaryDock'
import { Button } from '../components/common/Button'
import { ArrowLeft, MapPin, Calendar, Clock, Film } from 'lucide-react'
import { showsApi } from '../api/showsApi'

export function SeatSelectionPage() {
  const navigate = useNavigate()
  const {
    bookingSession,
    setTicketCount,
    toggleSeat,
    clearSeats,
    showToast,
  } = useBooking()

  const {
    movie,
    selectedCinema,
    selectedDate,
    selectedShowtime,
    ticketCount = 2,
    selectedSeats = [],
  } = bookingSession

  // Route guard: if required booking information is missing, redirect back
  useEffect(() => {
    if (!movie || !selectedCinema || !selectedShowtime) {
      navigate('/')
    }
  }, [movie, selectedCinema, selectedShowtime, navigate])

  const [liveSeats, setLiveSeats] = useState([])

  useEffect(() => {
    let isMounted = true
    async function fetchLiveSeats() {
      if (selectedShowtime?.numericId) {
        try {
          const seats = await showsApi.getShowSeats(selectedShowtime.numericId)
          if (isMounted && Array.isArray(seats) && seats.length > 0) {
            setLiveSeats(seats)
          }
        } catch (e) {
          console.warn('Could not fetch live seat layout:', e.message)
        }
      }
    }
    fetchLiveSeats()
    return () => {
      isMounted = false
    }
  }, [selectedShowtime?.numericId])

  // Generate auditorium seat layout based on cinema and showtime seed or live seats
  const auditoriumRows = useMemo(() => {
    if (liveSeats.length > 0) {
      const rowMap = new Map()
      liveSeats.forEach((item) => {
        const row = item.seat?.rowName || 'A'
        if (!rowMap.has(row)) {
          rowMap.set(row, [])
        }
        const seatType = item.seat?.seatType || 'STANDARD'
        let tierId = 'classic'
        let tierName = 'Classic Comfort'
        if (seatType === 'RECLINER') {
          tierId = 'vip'
          tierName = 'VIP Recliner'
        } else if (seatType === 'PREMIUM') {
          tierId = 'prime'
          tierName = 'Prime Lounger'
        }

        const col = item.seat?.colNumber || 1
        let section = 'center'
        if (col <= 2) section = 'left'
        else if (col >= 7) section = 'right'

        rowMap.get(row).push({
          id: String(item.id),
          showSeatId: item.id,
          row,
          number: col,
          section,
          tierId,
          tierName,
          price: item.price || 180,
          isOccupied: item.status !== 'AVAILABLE',
          label: item.seat?.seatNumber || `${row}${col}`,
        })
      })

      const rows = []
      rowMap.forEach((seats, rowLetter) => {
        seats.sort((a, b) => a.number - b.number)
        const first = seats[0]
        rows.push({
          rowLetter,
          tierId: first.tierId,
          tierName: first.tierName,
          price: first.price,
          seats,
        })
      })
      rows.sort((a, b) => a.rowLetter.localeCompare(b.rowLetter))
      return rows
    }

    const seed = `${selectedCinema?.id}-${selectedShowtime?.id}`
    return generateAuditoriumSeats(seed)
  }, [liveSeats, selectedCinema?.id, selectedShowtime?.id])

  if (!movie || !selectedCinema || !selectedShowtime) {
    return null
  }

  const handleProceed = () => {
    if (selectedSeats.length !== ticketCount) {
      showToast(`Please select exactly ${ticketCount} seats to proceed.`, 'warning')
      return
    }
    navigate('/booking/food')
  }

  return (
    <div className="space-y-6 pb-36">
      {/* 1. Header with Show Info & Ticket Count Picker */}
      <div className="p-4 sm:p-5 rounded-2xl bg-steel/20 border border-steel/30 text-mint space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <button
              onClick={() => navigate(`/movies/${movie.id}`)}
              className="p-2 rounded-xl bg-navy-dark hover:bg-steel/30 border border-steel/30 text-mint transition-colors mt-0.5"
              aria-label="Edit show details"
              title="Edit show details"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-mint tracking-tight">
                  {movie.title}
                </h1>
                <span className="text-xs px-2 py-0.5 rounded bg-crimson font-bold">
                  {movie.certification}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-mint/60 mt-1">
                <span className="flex items-center gap-1 font-medium text-mint">
                  <MapPin className="w-3.5 h-3.5 text-aqua" />
                  {selectedCinema.name}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-aqua" />
                  {selectedDate ? formatShowDate(selectedDate) : 'Today'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-aqua font-bold">
                  <Clock className="w-3.5 h-3.5 text-aqua" />
                  {selectedShowtime.time} ({selectedShowtime.format})
                </span>
              </div>
            </div>
          </div>

          {/* Ticket Count Selector */}
          <div className="self-end md:self-auto">
            <TicketCountPicker
              selectedCount={ticketCount}
              onSelectCount={(count) => {
                setTicketCount(count)
                showToast(`Ticket count set to ${count}`, 'info')
              }}
            />
          </div>
        </div>

        {/* Legend */}
        <SeatLegend />
      </div>

      {/* 2. Auditorium Screen & Seats */}
      <div className="p-4 sm:p-8 rounded-3xl bg-navy-dark/90 border border-steel/30 text-mint shadow-xl">
        <ScreenIndicator />

        <SeatGrid
          rows={auditoriumRows}
          selectedSeats={selectedSeats}
          onToggleSeat={toggleSeat}
        />
      </div>

      {/* 3. Sticky Bottom Dock */}
      <SeatSummaryDock
        selectedSeats={selectedSeats}
        ticketCount={ticketCount}
        onProceed={handleProceed}
        onClear={clearSeats}
      />
    </div>
  )
}
