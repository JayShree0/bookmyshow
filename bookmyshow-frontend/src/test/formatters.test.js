import { describe, it, expect } from 'vitest'
import {
  formatINR,
  formatShowDate,
  formatCountdown,
  generateBookingId,
  formatShowtime,
} from '../utils/formatters'

describe('Formatters Utility', () => {
  it('formats currency correctly in Indian Rupee format', () => {
    expect(formatINR(450)).toMatch(/₹\s?450/)
    expect(formatINR(1250)).toMatch(/₹\s?1,250/)
    expect(formatINR(0)).toMatch(/₹\s?0/)
    expect(formatINR(null)).toMatch(/₹\s?0/)
  })

  it('formats show countdown into MM:SS format', () => {
    expect(formatCountdown(600)).toBe('10:00')
    expect(formatCountdown(59)).toBe('00:59')
    expect(formatCountdown(0)).toBe('00:00')
    expect(formatCountdown(-5)).toBe('00:00')
  })

  it('formats showtime correctly', () => {
    expect(formatShowtime('14:30')).toBe('02:30 PM')
    expect(formatShowtime('10:30 AM')).toBe('10:30 AM')
  })

  it('generates a stable unique booking ID matching BMS prefix pattern', () => {
    const id = generateBookingId('Mumbai')
    expect(id).toMatch(/^BMS-MUM-\d{6}$/)
    const delId = generateBookingId('Delhi-NCR')
    expect(delId).toMatch(/^BMS-DEL-\d{6}$/)
  })

  it('formats dates dynamically with Today and Tomorrow labels', () => {
    const today = new Date()
    expect(formatShowDate(today)).toContain('Today')

    const tomorrow = new Date()
    tomorrow.setDate(today.getDate() + 1)
    expect(formatShowDate(tomorrow)).toContain('Tomorrow')
  })
})

