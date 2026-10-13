package com.project.bookmyshow.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Table(name = "bookings", indexes = {
        @Index(name = "idx_booking_user", columnList = "user_id"),
        @Index(name = "idx_booking_show", columnList = "show_id"),
        @Index(name = "idx_booking_number", columnList = "bookingNumber"),
        @Index(name = "idx_booking_status", columnList = "status")
})
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String bookingNumber;

    @Column(nullable = false)
    private LocalDateTime bookingTime;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "show_id", nullable = false)
    private Show show;

    @Column(nullable = false)
    @Builder.Default
    private String status = "PENDING_PAYMENT"; // PENDING_PAYMENT, CONFIRMED, CANCELLED, EXPIRED, REFUNDED

    @Column(nullable = false)
    private Double totalAmount;

    // Itemized Price Breakdown
    private Double baseAmount;
    private Double convenienceFee;
    private Double taxAmount;
    private Double discountAmount;
    private String couponCode;

    // Idempotency & Seat Locking
    @Column(unique = true)
    private String idempotencyKey;

    private String lockToken;

    // Cancellation & Refund
    private LocalDateTime cancelledAt;
    private String cancellationReason;
    private Double refundAmount;

    // Audit
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL)
    private List<ShowSeat> showSeats;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "payment_id")
    private Payment payment;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.bookingTime == null) {
            this.bookingTime = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
