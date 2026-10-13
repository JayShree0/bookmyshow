import { describe, it, expect } from 'vitest'
import { calculatePricing, calculateCouponDiscount } from '../utils/pricing'
import { findCoupon } from '../data/coupons'

describe('Pricing and Calculation Rules', () => {
  it('calculates ticket subtotal and convenience fee correctly for 2 tickets', () => {
    const selectedSeats = [
      { id: 'A-1', price: 450, tierName: 'VIP Recliner' },
      { id: 'A-2', price: 450, tierName: 'VIP Recliner' },
    ]
    const result = calculatePricing(selectedSeats, [], null)

    expect(result.ticketCount).toBe(2)
    expect(result.ticketSubtotal).toBe(900)
    expect(result.foodSubtotal).toBe(0)
    // Convenience fee: 2 * 30 = 60
    expect(result.ticketConvenienceFee).toBe(60)
    expect(result.convenienceFee).toBe(60)
    // GST: 18% of 60 = 10.8 -> rounded to 11
    expect(result.gst).toBe(11)
    expect(result.couponDiscount).toBe(0)
    // Final: 900 + 0 + 60 + 11 = 971
    expect(result.finalAmount).toBe(971)
  })

  it('calculates food subtotal and extra F&B convenience fee', () => {
    const selectedSeats = [{ id: 'C-5', price: 280, tierName: 'Prime Lounger' }]
    const fnbItems = [
      { id: 'popcorn', price: 240, quantity: 2 },
      { id: 'pepsi', price: 140, quantity: 1 },
    ]
    const result = calculatePricing(selectedSeats, fnbItems, null)

    expect(result.ticketSubtotal).toBe(280)
    // Food: (240 * 2) + (140 * 1) = 480 + 140 = 620
    expect(result.foodSubtotal).toBe(620)
    // Convenience fee: (1 * 30) + 15 = 45
    expect(result.convenienceFee).toBe(45)
    // GST: 18% of 45 = 8.1 -> rounded to 8
    expect(result.gst).toBe(8)
    // Final: 280 + 620 + 45 + 8 = 953
    expect(result.finalAmount).toBe(953)
  })

  it('applies flat discount coupon BMS50 when order meets minimum', () => {
    const coupon = findCoupon('BMS50')
    expect(coupon).not.toBeNull()

    const { discount, error } = calculateCouponDiscount(coupon, 450, 0)
    expect(error).toBeNull()
    expect(discount).toBe(50)

    const selectedSeats = [{ id: 'A-1', price: 450 }]
    const pricing = calculatePricing(selectedSeats, [], coupon)
    expect(pricing.couponDiscount).toBe(50)
    // 450 + 30 + 5 (gst) - 50 = 435
    expect(pricing.finalAmount).toBe(435)
  })

  it('rejects coupon when minimum order requirement is not met', () => {
    const coupon = findCoupon('BMS50') // minOrder is 300
    const { discount, error } = calculateCouponDiscount(coupon, 180, 0)

    expect(discount).toBe(0)
    expect(error).toContain('Minimum order value of ₹300 required')
  })

  it('applies percentage coupon MOVIEBUFF with maximum cap enforcement', () => {
    const coupon = findCoupon('MOVIEBUFF') // 15% off up to ₹150 min 500
    expect(coupon).not.toBeNull()

    // 15% of 2000 is 300, but cap is 150
    const { discount } = calculateCouponDiscount(coupon, 2000, 0)
    expect(discount).toBe(150)
  })

  it('applies SNACK10 only to Food & Beverage items', () => {
    const coupon = findCoupon('SNACK10') // 10% off F&B min 200 up to 100
    expect(coupon).not.toBeNull()

    // Tickets 1000, Food 300 -> discount is 10% of 300 = 30
    const { discount } = calculateCouponDiscount(coupon, 1000, 300)
    expect(discount).toBe(30)
  })

  it('prevents negative final amount even if discount exceeds total', () => {
    const customCoupon = {
      code: 'SUPERFREE',
      discountType: 'flat',
      discountValue: 5000,
      minOrder: 0,
      appliesTo: 'all',
    }
    const selectedSeats = [{ id: 'K-1', price: 180 }]
    const result = calculatePricing(selectedSeats, [], customCoupon)

    expect(result.finalAmount).toBeGreaterThanOrEqual(0)
  })
})

