package com.project.bookmyshow.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "tickets", indexes = {
        @Index(name = "idx_ticket_number", columnList = "ticketNumber"),
        @Index(name = "idx_ticket_booking", columnList = "booking_id"),
        @Index(name = "idx_ticket_status", columnList = "status")
})
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String ticketNumber;

    @Column(nullable = false, length = 1000)
    private String qrCodeData; // Cryptographic verifiable payload/token

    @Column(nullable = false)
    @Builder.Default
    private String status = "ISSUED"; // ISSUED, CHECKED_IN, CANCELLED

    private LocalDateTime checkedInAt;
    private Long checkedInByStaffId;

    @Column(nullable = false)
    private String seatNumbers; // e.g. "A1, A2"

    private LocalDateTime issuedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @PrePersist
    protected void onCreate() {
        if (this.issuedAt == null) {
            this.issuedAt = LocalDateTime.now();
        }
    }
}

