package com.project.bookmyshow.controller;

import com.project.bookmyshow.dto.ReviewDto;
import com.project.bookmyshow.dto.ReviewRequest;
import com.project.bookmyshow.model.User;
import com.project.bookmyshow.repository.UserRepository;
import com.project.bookmyshow.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/movie/{movieId}")
    public ResponseEntity<List<ReviewDto>> getReviewsForMovie(@PathVariable Long movieId) {
        return ResponseEntity.ok(reviewService.getReviewsForMovie(movieId));
    }

    @PostMapping
    public ResponseEntity<ReviewDto> addReview(
            @Valid @RequestBody ReviewRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
        return ResponseEntity.ok(reviewService.addOrUpdateReview(request, user.getId()));
    }
}

