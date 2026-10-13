package com.project.bookmyshow.service;

import com.project.bookmyshow.dto.SeatLockRequest;
import com.project.bookmyshow.dto.SeatLockResponse;
import com.project.bookmyshow.dto.SeatUnlockRequest;
import com.project.bookmyshow.exception.BadRequestException;
import com.project.bookmyshow.exception.ResourceNotFoundException;
import com.project.bookmyshow.exception.SeatUnavailableException;
import com.project.bookmyshow.model.Show;
import com.project.bookmyshow.model.ShowSeat;
import com.project.bookmyshow.repository.ShowRepository;
import com.project.bookmyshow.repository.ShowSeatRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SeatLockService {

    @Autowired
    private ShowRepository showRepository;

    @Autowired
    private ShowSeatRepository showSeatRepository;

    @Value("${app.booking.seat-lock-duration-minutes:5}")
    private int defaultLockDurationMinutes;

    /**
     * Atomically acquires temporary locks on requested seats for a show.
     * Uses pessimistic write locking and ID sorting to prevent race conditions and DB deadlocks.
     */
    @Transactional
    public SeatLockResponse lockSeats(SeatLockRequest request, Long userId) {
        Show show = showRepository.findById(request.getShowId())
                .orElseThrow(() -> new ResourceNotFoundException("Show not found with id: " + request.getShowId()));

        if (!Boolean.TRUE.equals(show.getActive()) || "CANCELLED".equalsIgnoreCase(show.getStatus())) {
            throw new BadRequestException("Cannot lock seats for an inactive or cancelled show");
        }

        if (show.getStartTime().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Cannot book or lock seats for a past show");
        }

        List<Long> seatIds = request.getSeatIds();
        if (seatIds == null || seatIds.isEmpty()) {
            throw new BadRequestException("Seat IDs list cannot be empty");
        }

        // Deadlock prevention: sort the IDs in ascending order before acquiring DB locks
        List<Long> sortedSeatIds = seatIds.stream().distinct().sorted().collect(Collectors.toList());

        // Pessimistic write lock on target rows
        List<ShowSeat> seats = showSeatRepository.findAllByIdForUpdate(sortedSeatIds);

        if (seats.size() != sortedSeatIds.size()) {
            throw new BadRequestException("One or more requested seat IDs do not exist");
        }

        LocalDateTime now = LocalDateTime.now();

        // Validate that all seats belong to the requested show and are available
        for (ShowSeat seat : seats) {
            if (!seat.getShow().getId().equals(show.getId())) {
                throw new BadRequestException("Seat " + seat.getId() + " does not belong to show " + show.getId());
            }

            if (!seat.isAvailable(now)) {
                String seatLabel = (seat.getSeat() != null) ? seat.getSeat().getSeatNumber() : String.valueOf(seat.getId());
                throw new SeatUnavailableException("Seat " + seatLabel + " is currently unavailable or locked by another customer");
            }
        }

        // Generate unique lock token
        String lockToken = UUID.randomUUID().toString();
        int lockMinutes = (request.getLockDurationMinutes() != null && request.getLockDurationMinutes() > 0)
                ? request.getLockDurationMinutes()
                : defaultLockDurationMinutes;
        LocalDateTime expiresAt = now.plusMinutes(lockMinutes);

        for (ShowSeat seat : seats) {
            seat.setStatus("LOCKED");
            seat.setLockToken(lockToken);
            seat.setLockedByUserId(userId);
            seat.setLockedAt(now);
            seat.setLockExpiresAt(expiresAt);
        }

        showSeatRepository.saveAll(seats);

        long remainingSecs = Duration.between(now, expiresAt).getSeconds();

        return SeatLockResponse.builder()
                .lockToken(lockToken)
                .showId(show.getId())
                .lockedSeatIds(sortedSeatIds)
                .lockExpiresAt(expiresAt)
                .remainingSeconds(remainingSecs)
                .message("Seats locked successfully for " + lockMinutes + " minutes")
                .build();
    }

    /**
     * Releases active seat locks using the client's lock token.
     */
    @Transactional
    public void unlockSeats(SeatUnlockRequest request, Long userId) {
        List<Long> sortedIds = request.getSeatIds().stream().distinct().sorted().collect(Collectors.toList());
        List<ShowSeat> seats = showSeatRepository.findAllByIdForUpdate(sortedIds);
        LocalDateTime now = LocalDateTime.now();

        for (ShowSeat seat : seats) {
            if (!seat.getShow().getId().equals(request.getShowId())) {
                continue;
            }

            // Only release if the token matches
            if (seat.isLockedBy(request.getLockToken(), userId, now) ||
                    (seat.getLockToken() != null && seat.getLockToken().equals(request.getLockToken()))) {
                seat.releaseLock();
            }
        }

        showSeatRepository.saveAll(seats);
    }

    /**
     * Cleans up expired locks across the system.
     */
    @Transactional
    public int cleanupExpiredLocks() {
        LocalDateTime now = LocalDateTime.now();
        List<ShowSeat> expiredSeats = showSeatRepository.findExpiredLocks(now);
        if (expiredSeats.isEmpty()) {
            return 0;
        }

        for (ShowSeat seat : expiredSeats) {
            seat.releaseLock();
        }
        showSeatRepository.saveAll(expiredSeats);
        return expiredSeats.size();
    }
}

