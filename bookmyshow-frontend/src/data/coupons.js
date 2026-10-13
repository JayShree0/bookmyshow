/**
 * Available promotional discount codes and coupons
 */
export const AVAILABLE_COUPONS = [
  {
    code: 'BMS50',
    title: '₹50 Flat Discount',
    description: 'Flat ₹50 off on total booking value above ₹300',
    discountType: 'flat',
    discountValue: 50,
    minOrder: 300,
    maxDiscount: 50,
    appliesTo: 'all',
    tag: 'POPULAR',
  },
  {
    code: 'MOVIEBUFF',
    title: '15% Movie Buff Offer',
    description: 'Get 15% off up to ₹150 on tickets and snacks on orders above ₹500',
    discountType: 'percentage',
    discountValue: 15,
    minOrder: 500,
    maxDiscount: 150,
    appliesTo: 'all',
    tag: 'BEST VALUE',
  },
  {
    code: 'SNACK10',
    title: '10% Off F&B Munchies',
    description: 'Save 10% on popcorn, nachos, and drinks up to ₹100',
    discountType: 'percentage',
    discountValue: 10,
    minOrder: 200,
    maxDiscount: 100,
    appliesTo: 'fnb',
    tag: 'SNACKS',
  },
  {
    code: 'FIRSTSHOW',
    title: 'Flat ₹100 Welcome Offer',
    description: 'Enjoy ₹100 off on premium bookings above ₹600',
    discountType: 'flat',
    discountValue: 100,
    minOrder: 600,
    maxDiscount: 100,
    appliesTo: 'all',
    tag: 'EXCLUSIVE',
  },
]

/**
 * Find coupon by case-insensitive code
 * @param {string} code
 * @returns {Object|null}
 */
export function findCoupon(code) {
  if (!code || typeof code !== 'string') return null
  const clean = code.trim().toUpperCase()
  return AVAILABLE_COUPONS.find((c) => c.code === clean) || null
}

