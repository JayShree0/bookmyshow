/**
 * Pricing rules and fee constants for the BookMyShow demo platform
 */
export const PRICING_CONFIG = {
  CONVENIENCE_FEE_PER_TICKET: 30,
  CONVENIENCE_FEE_FNB: 15,
  GST_RATE_PERCENT: 18,
}

/**
 * Calculate coupon discount based on active items and coupon rules
 * @param {Object|null} coupon
 * @param {number} ticketSubtotal
 * @param {number} foodSubtotal
 * @returns {{ discount: number, error: string|null }}
 */
export function calculateCouponDiscount(coupon, ticketSubtotal, foodSubtotal) {
  if (!coupon) return { discount: 0, error: null }

  const totalEligibleSubtotal =
    coupon.appliesTo === 'fnb'
      ? foodSubtotal
      : coupon.appliesTo === 'tickets'
      ? ticketSubtotal
      : ticketSubtotal + foodSubtotal

  if (coupon.minOrder && totalEligibleSubtotal < coupon.minOrder) {
    return {
      discount: 0,
      error: `Minimum order value of ₹${coupon.minOrder} required for ${coupon.code}`,
    }
  }

  let discount = 0
  if (coupon.discountType === 'percentage') {
    discount = Math.round((totalEligibleSubtotal * coupon.discountValue) / 100)
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount
    }
  } else if (coupon.discountType === 'flat') {
    discount = Math.min(coupon.discountValue, totalEligibleSubtotal)
  }

  // Ensure discount does not exceed the eligible amount
  discount = Math.min(discount, totalEligibleSubtotal)

  return { discount, error: null }
}

/**
 * Calculate full itemized pricing breakdown for the active booking state
 * @param {Array} selectedSeats - Array of seat objects with price property
 * @param {Array} fnbItems - Array of food items with price and quantity properties
 * @param {Object|null} appliedCoupon - Active coupon object or null
 * @returns {Object} Complete pricing breakdown
 */
export function calculatePricing(selectedSeats = [], fnbItems = [], appliedCoupon = null) {
  // 1. Ticket Subtotal
  const ticketSubtotal = selectedSeats.reduce((sum, seat) => {
    return sum + (Number(seat.price) || 0)
  }, 0)

  // 2. Food & Beverage Subtotal
  const activeFnbItems = (fnbItems || []).filter((item) => (item.quantity || 0) > 0)
  const foodSubtotal = activeFnbItems.reduce((sum, item) => {
    return sum + (Number(item.price) || 0) * (Number(item.quantity) || 0)
  }, 0)

  // 3. Convenience Fee
  const seatCount = selectedSeats.length
  const ticketConvenienceFee = seatCount * PRICING_CONFIG.CONVENIENCE_FEE_PER_TICKET
  const fnbConvenienceFee = activeFnbItems.length > 0 ? PRICING_CONFIG.CONVENIENCE_FEE_FNB : 0
  const convenienceFee = ticketConvenienceFee + fnbConvenienceFee

  // 4. Integrated GST (18% on convenience fee)
  const gst = Math.round((convenienceFee * PRICING_CONFIG.GST_RATE_PERCENT) / 100)

  // 5. Coupon Discount
  const { discount: couponDiscount, error: couponError } = calculateCouponDiscount(
    appliedCoupon,
    ticketSubtotal,
    foodSubtotal
  )

  // 6. Final Amount Payable (cannot be negative)
  const grossTotal = ticketSubtotal + foodSubtotal + convenienceFee + gst
  const finalAmount = Math.max(0, grossTotal - couponDiscount)

  return {
    ticketCount: seatCount,
    ticketSubtotal,
    foodSubtotal,
    convenienceFee,
    ticketConvenienceFee,
    fnbConvenienceFee,
    gst,
    couponDiscount,
    couponError,
    grossTotal,
    finalAmount,
  }
}

