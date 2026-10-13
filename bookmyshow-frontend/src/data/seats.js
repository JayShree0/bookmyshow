/**
 * Auditorium seat layout configuration and tier rules
 */
export const SEAT_TIERS = {
  VIP: {
    id: 'vip',
    name: 'VIP Recliner',
    price: 450,
    rows: ['A', 'B'],
    description: 'Plush automated recliners with personal table & steward service',
  },
  PRIME: {
    id: 'prime',
    name: 'Prime Lounger',
    price: 280,
    rows: ['C', 'D', 'E', 'F'],
    description: 'Extra legroom high-back rocker seating in the sweet spot',
  },
  CLASSIC: {
    id: 'classic',
    name: 'Classic Comfort',
    price: 180,
    rows: ['G', 'H', 'J', 'K'], // Omitting 'I' as is common cinema practice
    description: 'Comfortable stadium seating with unhindered viewing angles',
  },
}

export const TICKET_COUNT_OPTIONS = [1, 2, 3, 4, 5, 6, 8, 10]

/**
 * Generate a complete cinema auditorium seat map with left, center, right blocks
 * @param {string} [seed] - Optional seed to generate consistent mock occupied seats per showtime
 * @returns {Array<Object>} List of rows with seat objects
 */
export function generateAuditoriumSeats(seed = 'default') {
  // Deterministic mock occupied seats helper
  const seedNum = (seed || '')
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0)

  // Predetermined realistic occupied seats
  const isSeatOccupied = (row, col) => {
    // Some popular seats often occupied
    const occupiedPatterns = [
      'A-7', 'A-8', 'B-6', 'B-7', 'B-11',
      'C-7', 'C-8', 'C-9', 'C-10', 'D-5', 'D-6', 'D-11', 'D-12',
      'E-7', 'E-8', 'E-9', 'F-6', 'F-7', 'F-10',
      'G-8', 'G-9', 'H-7', 'H-8', 'H-12', 'J-5', 'J-6', 'K-10'
    ]
    if (occupiedPatterns.includes(`${row}-${col}`)) {
      return (seedNum + col) % 3 !== 0 // majority remain occupied
    }
    // Occasional occupied
    return (seedNum * 7 + row.charCodeAt(0) * 13 + col * 17) % 7 === 0
  }

  const allRows = [
    { rowLetter: 'A', tier: SEAT_TIERS.VIP },
    { rowLetter: 'B', tier: SEAT_TIERS.VIP },
    { rowLetter: 'C', tier: SEAT_TIERS.PRIME },
    { rowLetter: 'D', tier: SEAT_TIERS.PRIME },
    { rowLetter: 'E', tier: SEAT_TIERS.PRIME },
    { rowLetter: 'F', tier: SEAT_TIERS.PRIME },
    { rowLetter: 'G', tier: SEAT_TIERS.CLASSIC },
    { rowLetter: 'H', tier: SEAT_TIERS.CLASSIC },
    { rowLetter: 'J', tier: SEAT_TIERS.CLASSIC },
    { rowLetter: 'K', tier: SEAT_TIERS.CLASSIC },
  ]

  return allRows.map(({ rowLetter, tier }) => {
    // 16 seats total per row: Left (1-4), Center (5-12), Right (13-16)
    const seats = []
    for (let col = 1; col <= 16; col++) {
      const seatId = `${rowLetter}-${col}`
      const occupied = isSeatOccupied(rowLetter, col)

      let section = 'center'
      if (col <= 4) section = 'left'
      else if (col >= 13) section = 'right'

      seats.push({
        id: seatId,
        row: rowLetter,
        number: col,
        section,
        tierId: tier.id,
        tierName: tier.name,
        price: tier.price,
        isOccupied: occupied,
        label: `${rowLetter}${col}`,
      })
    }

    return {
      rowLetter,
      tierId: tier.id,
      tierName: tier.name,
      price: tier.price,
      seats,
    }
  })
}

