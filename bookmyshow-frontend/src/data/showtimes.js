/**
 * Generate next 6 dates starting from today dynamically
 * @returns {Array<{ id: string, dateObj: Date, dayName: string, dayNumber: number, monthName: string, label: string }>}
 */
export function getNextDates() {
  const dates = []
  const today = new Date()

  for (let i = 0; i < 6; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)

    const dayName = d.toLocaleDateString('en-IN', { weekday: 'short' })
    const dayNumber = d.getDate()
    const monthName = d.toLocaleDateString('en-IN', { month: 'short' })
    const dateString = d.toISOString().split('T')[0]

    let label = `${dayName}, ${dayNumber} ${monthName}`
    if (i === 0) label = `Today, ${dayNumber} ${monthName}`
    if (i === 1) label = `Tomorrow, ${dayNumber} ${monthName}`

    dates.push({
      id: dateString,
      dateString,
      dateObj: d,
      dayName,
      dayNumber,
      monthName,
      label,
    })
  }

  return dates
}

/**
 * Standard showtimes list with status and formats
 */
export const STANDARD_SHOWTIMES = [
  {
    id: 'st-1',
    time: '10:30 AM',
    format: '2D',
    screen: 'Audi 1 (Dolby 7.1)',
    status: 'available',
    statusLabel: 'Available',
    price: 180,
  },
  {
    id: 'st-2',
    time: '01:45 PM',
    format: '3D',
    screen: 'Audi 2 (Dolby Atmos)',
    status: 'filling_fast',
    statusLabel: 'Filling Fast',
    price: 280,
  },
  {
    id: 'st-3',
    time: '05:15 PM',
    format: 'IMAX 3D',
    screen: 'Audi 3 (IMAX Laser)',
    status: 'available',
    statusLabel: 'Available',
    price: 450,
  },
  {
    id: 'st-4',
    time: '08:45 PM',
    format: '4DX',
    screen: 'Audi 4 (4DX Motion)',
    status: 'filling_fast',
    statusLabel: 'Filling Fast',
    price: 350,
  },
  {
    id: 'st-5',
    time: '11:15 PM',
    format: '2D',
    screen: 'Audi 1 (Dolby 7.1)',
    status: 'sold_out',
    statusLabel: 'Sold Out',
    price: 180,
  },
]

/**
 * Get showtimes for a cinema and movie combination
 * Dynamically varies some availability depending on cinema/date for realism
 */
export function getShowtimesForCinema(cinemaId, movieId, dateId) {
  // Deterministic slight variations based on cinemaId hash
  const hash = (cinemaId || '').length + (movieId || '').length + (dateId || '').length

  return STANDARD_SHOWTIMES.map((st, index) => {
    // vary the status slightly for different halls
    let status
    if ((hash + index) % 5 === 0) {
      status = 'sold_out'
    } else if ((hash + index) % 3 === 0) {
      status = 'filling_fast'
    } else {
      status = 'available'
    }

    // Keep the morning show mostly available, late night might be sold out
    if (index === 0) status = 'available'
    if (index === 4 && (hash % 2 === 0)) status = 'sold_out'

    return {
      ...st,
      id: `${cinemaId}-${dateId}-${st.time.replace(/[: ]/g, '')}`,
      status,
      statusLabel:
        status === 'sold_out'
          ? 'Sold Out'
          : status === 'filling_fast'
          ? 'Filling Fast'
          : 'Available',
    }
  })
}

