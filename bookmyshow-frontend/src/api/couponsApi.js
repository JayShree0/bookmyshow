import apiClient from './client'

export function normalizeCoupon(c) {
  if (!c) return null
  return {
    ...c,
    code: c.code,
    title: c.description || `${c.code} Offer`,
    description: c.description || `Special promo discount with ${c.code}`,
    discountType: (c.discountType || 'PERCENTAGE').toLowerCase(),
    discountValue: c.discountValue || 0,
    minOrder: c.minOrderAmount || 0,
    maxDiscount: c.maxDiscountAmount || c.discountValue || 100,
    appliesTo: 'all',
    tag: c.discountType === 'FLAT' ? 'FLAT' : 'OFFER',
  }
}

export const couponsApi = {
  getActiveCoupons: async () => {
    const list = await apiClient.get('/coupons')
    return Array.isArray(list) ? list.map(normalizeCoupon) : []
  },
}

export default couponsApi

