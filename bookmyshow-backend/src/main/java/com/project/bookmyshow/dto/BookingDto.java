package com.project.bookmyshow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingDto {

    private Long id;
    private String bookingNumber;
    private LocalDateTime bookingTime;
    private UserDto user;
    private ShowDto show;
    private String status;
    private Double totalAmount;

    // Price Breakdown
    private Double baseAmount;
    private Double convenienceFee;
    private Double taxAmount;
    private Double discountAmount;
    private String couponCode;

    // Cancellation & Refund
    private LocalDateTime cancelledAt;
    private String cancellationReason;
    private Double refundAmount;

    private String idempotencyKey;

    private List<ShowSeatDto> seats;
    private PaymentDto payment;
}
