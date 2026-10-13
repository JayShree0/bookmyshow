package com.project.bookmyshow.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "payments", indexes = {
        @Index(name = "idx_payment_txn", columnList = "transactionId"),
        @Index(name = "idx_payment_order", columnList = "orderId")
})
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String transactionId;

    private String orderId;

    @Column(nullable = false)
    @Builder.Default
    private String paymentGateway = "MOCK"; // MOCK, RAZORPAY, STRIPE

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    @Builder.Default
    private String currency = "INR";

    @Column(nullable = false)
    private LocalDateTime paymentTime;

    @Column(nullable = false)
    private String paymentMethod; // UPI, CARD, NET_BANKING, WALLET

    @Column(nullable = false)
    @Builder.Default
    private String status = "INITIATED"; // INITIATED, SUCCESS, FAILED, REFUNDED

    private String gatewayPaymentId;
    private String gatewaySignature;
    private String failureReason;

    private String refundId;
    private Double refundAmount;
    private LocalDateTime refundedAt;

    @OneToOne(mappedBy = "payment")
    private Booking booking;

    @PrePersist
    protected void onCreate() {
        if (this.paymentTime == null) {
            this.paymentTime = LocalDateTime.now();
        }
    }
}
