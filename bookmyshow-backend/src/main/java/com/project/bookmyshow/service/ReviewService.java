package com.project.bookmyshow.service;

import com.project.bookmyshow.dto.ReviewDto;
import com.project.bookmyshow.dto.ReviewRequest;
import com.project.bookmyshow.exception.ResourceNotFoundException;
import com.project.bookmyshow.model.Movie;
import com.project.bookmyshow.model.Review;
import com.project.bookmyshow.model.User;
import com.project.bookmyshow.repository.MovieRepository;
import com.project.bookmyshow.repository.ReviewRepository;
import com.project.bookmyshow.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public ReviewDto addOrUpdateReview(ReviewRequest request, Long userId) {
        Movie movie = movieRepository.findById(request.getMovieId())
                .orElseThrow(() -> new ResourceNotFoundException("Movie not found with id: " + request.getMovieId()));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Review review = reviewRepository.findByUserIdAndMovieId(userId, movie.getId())
                .orElse(Review.builder().movie(movie).user(user).build());

        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review.setCreatedAt(LocalDateTime.now());
        Review saved = reviewRepository.save(review);

        // Update movie aggregate rating
        Double avgRating = reviewRepository.getAverageRatingForMovie(movie.getId());
        Long totalCount = reviewRepository.countReviewsForMovie(movie.getId());

        movie.setRating(avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : (double) request.getRating());
        movie.setTotalRatings(totalCount != null ? totalCount.intValue() : 1);
        movieRepository.save(movie);

        return mapToDto(saved);
    }

    public List<ReviewDto> getReviewsForMovie(Long movieId) {
        return reviewRepository.findByMovieIdOrderByCreatedAtDesc(movieId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private ReviewDto mapToDto(Review review) {
        return ReviewDto.builder()
                .id(review.getId())
                .movieId(review.getMovie().getId())
                .movieTitle(review.getMovie().getTitle())
                .userId(review.getUser().getId())
                .userName(review.getUser().getName())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .build();
    }
}

