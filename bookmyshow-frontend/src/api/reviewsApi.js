import apiClient from './client'

export const reviewsApi = {
  getReviewsForMovie: async (movieId) => {
    return apiClient.get(`/reviews/movie/${movieId}`)
  },

  addReview: async (reviewData) => {
    return apiClient.post('/reviews', reviewData)
  },
}

export default reviewsApi

