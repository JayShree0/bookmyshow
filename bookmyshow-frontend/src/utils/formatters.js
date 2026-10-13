/**
 * Format currency in Indian Rupee format (e.g., ₹450 or ₹1,250)
 * @param {number} amount
 * @returns {string}
 */
export function formatINR(amount) {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '₹0'
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format a Date object or ISO string into a readable cinema date
 * e.g., "Today, 14 Oct" or "Fri, 16 Oct"
 * @param {Date|string} dateInput
 * @returns {string}
 */
export function formatShowDate(dateInput) {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
  const today = new Date()
  const tomorrow = new Date()
  tomorrow.setDate(today.getDate() + 1)

  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()

  const isTomorrow =
    date.getDate() === tomorrow.getDate() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getFullYear() === tomorrow.getFullYear()

  const dayName = date.toLocaleDateString('en-IN', { weekday: 'short' })
  const dayNum = date.getDate()
  const monthName = date.toLocaleDateString('en-IN', { month: 'short' })

  if (isToday) return `Today, ${dayNum} ${monthName}`
  if (isTomorrow) return `Tomorrow, ${dayNum} ${monthName}`
  return `${dayName}, ${dayNum} ${monthName}`
}

/**
 * Format time from HH:MM string to 12-hour format with AM/PM
 * @param {string} timeStr
 * @returns {string}
 */
export function formatShowtime(timeStr) {
  if (!timeStr) return ''
  if (timeStr.includes('AM') || timeStr.includes('PM')) return timeStr

  const [hours, minutes] = timeStr.split(':')
  const h = parseInt(hours, 10)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const formattedHours = h % 12 || 12
  return `${formattedHours.toString().padStart(2, '0')}:${minutes} ${ampm}`
}

/**
 * Generate a realistic demo booking ID
 * e.g., "BMS-MUM-892341"
 * @param {string} city
 * @returns {string}
 */
export function generateBookingId(city = 'MUM') {
  const cityCode = city.slice(0, 3).toUpperCase()
  const randomNum = Math.floor(100000 + Math.random() * 900000)
  return `BMS-${cityCode}-${randomNum}`
}

/**
 * Format seconds into MM:SS
 * @param {number} totalSeconds
 * @returns {string}
 */
export function formatCountdown(totalSeconds) {
  if (totalSeconds <= 0) return '00:00'
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

