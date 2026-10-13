import React, { useState } from 'react'
import { Modal } from './Modal'
import { Button } from './Button'
import { Star, CheckCircle2 } from 'lucide-react'

export function RatingModal({ isOpen, onClose, movie, onRatingSubmitted }) {
  const [rating, setRating] = useState(8)
  const [hoverRating, setHoverRating] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  if (!movie) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsSubmitted(true)
    if (onRatingSubmitted) {
      onRatingSubmitted({ rating, reviewText, movieId: movie.id })
    }
    setTimeout(() => {
      setIsSubmitted(false)
      setReviewText('')
      onClose()
    }, 1500)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isSubmitted ? 'Rating Submitted!' : `How was ${movie.title}?`}
      subtitle={isSubmitted ? 'Thank you for your feedback!' : 'Rate the movie out of 10 stars'}
      maxWidth="max-w-md"
    >
      {isSubmitted ? (
        <div className="py-8 text-center space-y-3">
          <CheckCircle2 className="w-14 h-14 text-aqua mx-auto animate-bounce" />
          <h4 className="text-lg font-bold text-mint">You rated this {rating}/10</h4>
          <p className="text-xs text-mint/60">
            Your review will help fellow moviegoers make their choice.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Rating stars: 10 stars */}
          <div className="flex flex-col items-center justify-center py-2 bg-navy-dark/40 rounded-xl p-4 border border-steel/20">
            <div className="text-3xl font-extrabold text-aqua mb-2">
              {hoverRating || rating} <span className="text-sm font-normal text-mint/50">/ 10</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-0.5 sm:gap-1 max-w-full">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                const isLit = (hoverRating || rating) >= num
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setRating(num)}
                    onMouseEnter={() => setHoverRating(num)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-0.5 focus:outline-none transition-transform hover:scale-125"
                    aria-label={`Rate ${num} out of 10`}
                  >
                    <Star
                      className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors ${
                        isLit
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-steel/50 hover:text-amber-300'
                      }`}
                    />
                  </button>
                )
              })}
            </div>
            <span className="text-[11px] text-mint/50 mt-2">
              Tap a star to rate from 1 to 10
            </span>
          </div>

          {/* Review textarea */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-mint/70 mb-1.5">
              Write a short review (Optional)
            </label>
            <textarea
              rows={3}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="What did you think of the direction, screenplay, performances, and BGM?"
              className="w-full bg-navy-dark border border-steel/50 rounded-xl p-3 text-sm text-mint placeholder-mint/30 focus:outline-none focus:border-aqua focus:ring-1 focus:ring-aqua transition-all"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="crimson" type="submit">
              Submit Rating
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}

