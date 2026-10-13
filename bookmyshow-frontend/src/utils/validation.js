/**
 * Validate email address format
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email.trim())
}

/**
 * Validate Indian 10-digit mobile phone number
 * @param {string} phone
 * @returns {boolean}
 */
export function isValidPhone(phone) {
  if (!phone || typeof phone !== 'string') return false
  const digits = phone.replace(/\D/g, '')
  return digits.length === 10 && /^[6-9]\d{9}$/.test(digits)
}

/**
 * Validate UPI ID format (e.g., user@okhdfcbank, name@upi)
 * @param {string} upiId
 * @returns {boolean}
 */
export function isValidUPI(upiId) {
  if (!upiId || typeof upiId !== 'string') return false
  const re = /^[\w.-]+@[\w.-]+$/
  return re.test(upiId.trim())
}

/**
 * Validate Card input fields (demo UI validation)
 * @param {Object} cardDetails
 * @returns {{ valid: boolean, errors: Object }}
 */
export function validateDemoCard({ cardNumber, cardHolder, expiry, cvv }) {
  const errors = {}
  const rawNum = (cardNumber || '').replace(/\s+/g, '')

  if (!rawNum || rawNum.length < 15 || rawNum.length > 19) {
    errors.cardNumber = 'Enter a valid 16-digit card number'
  }

  if (!cardHolder || cardHolder.trim().length < 3) {
    errors.cardHolder = 'Enter cardholder name'
  }

  if (!expiry || !/^\d{2}\/\d{2}$/.test(expiry.trim())) {
    errors.expiry = 'Use MM/YY format'
  } else {
    const [month] = expiry.split('/').map(Number)
    if (month < 1 || month > 12) {
      errors.expiry = 'Invalid month (01-12)'
    }
  }

  if (!cvv || !/^\d{3,4}$/.test(cvv.trim())) {
    errors.cvv = 'Enter 3-digit CVV'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

