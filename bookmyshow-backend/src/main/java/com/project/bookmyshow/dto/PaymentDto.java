package com.project.bookmyshow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentDto {

    private Long id;
    private String transactionId;
    private String orderId;
    private String paymentGateway;
    private Double amount;
    private String currency;
    private LocalDateTime paymentTime;
    private String paymentMethod;
    private String status;
}
