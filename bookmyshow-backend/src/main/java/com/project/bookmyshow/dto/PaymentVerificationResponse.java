package com.project.bookmyshow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentVerificationResponse {

    private boolean success;
    private String status;
    private String transactionId;
    private Long bookingId;
    private String bookingNumber;
    private String message;
}

