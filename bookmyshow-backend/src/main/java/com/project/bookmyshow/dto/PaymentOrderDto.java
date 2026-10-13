package com.project.bookmyshow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentOrderDto {

    private String orderId;
    private Double amount;
    private String currency;
    private String gateway;
    private Long bookingId;
    private String bookingNumber;
    private String gatewayKeyId;
}

