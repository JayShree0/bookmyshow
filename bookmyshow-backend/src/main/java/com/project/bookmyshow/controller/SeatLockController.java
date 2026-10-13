package com.project.bookmyshow.controller;

import com.project.bookmyshow.dto.SeatLockRequest;
import com.project.bookmyshow.dto.SeatLockResponse;
import com.project.bookmyshow.dto.SeatUnlockRequest;
import com.project.bookmyshow.model.User;
import com.project.bookmyshow.repository.UserRepository;
import com.project.bookmyshow.service.SeatLockService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/shows")
public class SeatLockController {

    @Autowired
    private SeatLockService seatLockService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/{showId}/lock")
    public ResponseEntity<SeatLockResponse> lockSeats(
            @PathVariable Long showId,
            @Valid @RequestBody SeatLockRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        request.setShowId(showId);
        Long userId = null;
        if (userDetails != null) {
            userId = userRepository.findByEmail(userDetails.getUsername())
                    .map(User::getId)
                    .orElse(null);
        }
        return ResponseEntity.ok(seatLockService.lockSeats(request, userId));
    }

    @PostMapping("/{showId}/unlock")
    public ResponseEntity<Map<String, String>> unlockSeats(
            @PathVariable Long showId,
            @Valid @RequestBody SeatUnlockRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        request.setShowId(showId);
        Long userId = null;
        if (userDetails != null) {
            userId = userRepository.findByEmail(userDetails.getUsername())
                    .map(User::getId)
                    .orElse(null);
        }
        seatLockService.unlockSeats(request, userId);
        return ResponseEntity.ok(Map.of("message", "Seats unlocked successfully"));
    }

    @PostMapping("/locks/cleanup")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> cleanupExpiredLocks() {
        int cleaned = seatLockService.cleanupExpiredLocks();
        return ResponseEntity.ok(Map.of(
                "message", "Expired seat locks cleanup complete",
                "releasedCount", cleaned
        ));
    }
}

