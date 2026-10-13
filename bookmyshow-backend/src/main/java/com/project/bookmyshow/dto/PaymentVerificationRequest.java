package com.project.bookmyshow.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentVerificationRequest {

    @NotNull(message = "Booking ID is required")
    private Long bookingId;

    private String orderId;

    private String paymentId;

    private String signature;

    @Builder.Default
    private String paymentMethod = "UPI";
}

