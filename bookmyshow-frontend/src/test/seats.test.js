import { describe, it, expect } from 'vitest'
import { generateAuditoriumSeats, SEAT_TIERS } from '../data/seats'

describe('Auditorium Seat Layout and Tiers', () => {
  it('defines correct pricing across VIP, Prime, and Classic tiers', () => {
    expect(SEAT_TIERS.VIP.price).toBe(450)
    expect(SEAT_TIERS.PRIME.price).toBe(280)
    expect(SEAT_TIERS.CLASSIC.price).toBe(180)
  })

  it('generates 10 rows with 16 seats per row separated by left, center, right sections', () => {
    const rows = generateAuditoriumSeats('test-seed-1')
    expect(rows.length).toBe(10)

    rows.forEach((row) => {
      expect(row.seats.length).toBe(16)
      const left = row.seats.filter((s) => s.section === 'left')
      const center = row.seats.filter((s) => s.section === 'center')
      const right = row.seats.filter((s) => s.section === 'right')

      expect(left.length).toBe(4)
      expect(center.length).toBe(8)
      expect(right.length).toBe(4)
    })
  })

  it('omits row I for realism in cinema auditoriums', () => {
    const rows = generateAuditoriumSeats('test-seed-2')
    const rowLetters = rows.map((r) => r.rowLetter)
    expect(rowLetters).not.toContain('I')
    expect(rowLetters).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K'])
  })

  it('includes realistic occupied seats that cannot be booked', () => {
    const rows = generateAuditoriumSeats('test-seed-3')
    const allSeats = rows.flatMap((r) => r.seats)
    const occupiedSeats = allSeats.filter((s) => s.isOccupied)
    const availableSeats = allSeats.filter((s) => !s.isOccupied)

    expect(occupiedSeats.length).toBeGreaterThan(0)
    expect(availableSeats.length).toBeGreaterThan(0)
  })
})

