package com.project.bookmyshow.controller;

import com.project.bookmyshow.dto.MovieDto;
import com.project.bookmyshow.model.User;
import com.project.bookmyshow.repository.UserRepository;
import com.project.bookmyshow.service.WatchlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/watchlist")
public class WatchlistController {

    @Autowired
    private WatchlistService watchlistService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<MovieDto>> getMyWatchlist(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
        return ResponseEntity.ok(watchlistService.getWatchlist(user.getId()));
    }

    @PostMapping("/{movieId}")
    public ResponseEntity<MovieDto> addToWatchlist(
            @PathVariable Long movieId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
        return ResponseEntity.ok(watchlistService.addToWatchlist(movieId, user.getId()));
    }

    @DeleteMapping("/{movieId}")
    public ResponseEntity<Map<String, String>> removeFromWatchlist(
            @PathVariable Long movieId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
        watchlistService.removeFromWatchlist(movieId, user.getId());
        return ResponseEntity.ok(Map.of("message", "Movie removed from watchlist"));
    }
}

