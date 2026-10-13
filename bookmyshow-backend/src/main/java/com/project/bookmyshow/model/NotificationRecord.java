package com.project.bookmyshow.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "notification_records", indexes = {
        @Index(name = "idx_notif_recipient", columnList = "recipient"),
        @Index(name = "idx_notif_type", columnList = "type")
})
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String recipient; // Email or phone number

    @Column(nullable = false)
    @Builder.Default
    private String channel = "EMAIL"; // EMAIL, SMS, WHATSAPP

    @Column(nullable = false)
    private String type; // BOOKING_CONFIRMED, BOOKING_CANCELLED, REFUND_PROCESSED, SHOW_REMINDER

    private String subject;

    @Column(length = 2000)
    private String message;

    @Column(nullable = false)
    @Builder.Default
    private String status = "SENT"; // SENT, FAILED

    private LocalDateTime sentAt;

    @PrePersist
    protected void onCreate() {
        if (this.sentAt == null) {
            this.sentAt = LocalDateTime.now();
        }
    }
}

