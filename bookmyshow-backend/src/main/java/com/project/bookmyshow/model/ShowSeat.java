package com.project.bookmyshow.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "show_seats", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"show_id", "seat_id"})
}, indexes = {
        @Index(name = "idx_showseat_show_status", columnList = "show_id, status"),
        @Index(name = "idx_showseat_booking", columnList = "booking_id"),
        @Index(name = "idx_showseat_lock_expiry", columnList = "status, lockExpiresAt")
})
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShowSeat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "show_id", nullable = false)
    private Show show;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "seat_id", nullable = false)
    private Seat seat;

    @Column(nullable = false)
    @Builder.Default
    private String status = "AVAILABLE"; // AVAILABLE, LOCKED, BOOKED

    @Column(nullable = false)
    private Double price;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id")
    private Booking booking;

    // Temporary Seat Lock Attributes
    private String lockToken;
    private Long lockedByUserId;
    private LocalDateTime lockedAt;
    private LocalDateTime lockExpiresAt;

    @Version
    @Builder.Default
    private Long version = 0L;

    /**
     * Checks if this seat can be acquired by a user.
     * True if status is AVAILABLE, or if LOCKED but the TTL expired.
     */
    public boolean isAvailable(LocalDateTime now) {
        if ("BOOKED".equalsIgnoreCase(this.status)) {
            return false;
        }
        if ("AVAILABLE".equalsIgnoreCase(this.status)) {
            return true;
        }
        if ("LOCKED".equalsIgnoreCase(this.status)) {
            return this.lockExpiresAt != null && this.lockExpiresAt.isBefore(now);
        }
        return false;
    }

    /**
     * Verifies if the given lockToken and userId owns this active lock.
     */
    public boolean isLockedBy(String token, Long userId, LocalDateTime now) {
        if (!"LOCKED".equalsIgnoreCase(this.status)) {
            return false;
        }
        if (this.lockExpiresAt != null && this.lockExpiresAt.isBefore(now)) {
            return false; // Expired
        }
        boolean tokenMatches = this.lockToken != null && this.lockToken.equals(token);
        boolean userMatches = (userId == null) || (this.lockedByUserId != null && this.lockedByUserId.equals(userId));
        return tokenMatches && userMatches;
    }

    public void releaseLock() {
        this.status = "AVAILABLE";
        this.lockToken = null;
        this.lockedByUserId = null;
        this.lockedAt = null;
        this.lockExpiresAt = null;
    }
}
