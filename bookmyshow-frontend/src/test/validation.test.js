import { describe, it, expect } from 'vitest'
import {
  isValidEmail,
  isValidPhone,
  isValidUPI,
  validateDemoCard,
} from '../utils/validation'

describe('Validation Utility', () => {
  it('validates proper email formats', () => {
    expect(isValidEmail('rohan.sharma@example.com')).toBe(true)
    expect(isValidEmail('user@test.co.in')).toBe(true)
    expect(isValidEmail('invalid-email')).toBe(false)
    expect(isValidEmail('')).toBe(false)
    expect(isValidEmail(null)).toBe(false)
  })

  it('validates Indian 10-digit mobile numbers', () => {
    expect(isValidPhone('9876543210')).toBe(true)
    expect(isValidPhone('8123456789')).toBe(true)
    expect(isValidPhone('7123456789')).toBe(true)
    expect(isValidPhone('6123456789')).toBe(true)
    // Starting with 1-5 invalid
    expect(isValidPhone('1234567890')).toBe(false)
    // Wrong length
    expect(isValidPhone('98765')).toBe(false)
    expect(isValidPhone('987654321000')).toBe(false)
  })

  it('validates UPI ID format', () => {
    expect(isValidUPI('rohan@okhdfcbank')).toBe(true)
    expect(isValidUPI('name@upi')).toBe(true)
    expect(isValidUPI('user.123@paytm')).toBe(true)
    expect(isValidUPI('notanupi')).toBe(false)
    expect(isValidUPI('')).toBe(false)
  })

  it('validates demo card input fields', () => {
    const validCard = {
      cardHolder: 'ROHAN SHARMA',
      cardNumber: '4532 8920 1289 4012',
      expiry: '12/28',
      cvv: '891',
    }
    expect(validateDemoCard(validCard).valid).toBe(true)

    const invalidCard = {
      cardHolder: '',
      cardNumber: '123',
      expiry: '13/28', // Invalid month
      cvv: '1',
    }
    const result = validateDemoCard(invalidCard)
    expect(result.valid).toBe(false)
    expect(result.errors.cardHolder).toBeDefined()
    expect(result.errors.cardNumber).toBeDefined()
    expect(result.errors.expiry).toBeDefined()
    expect(result.errors.cvv).toBeDefined()
  })
})

