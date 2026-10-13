package com.project.bookmyshow.payment;

import com.project.bookmyshow.dto.PaymentOrderDto;

public interface PaymentGateway {

    String getName();

    PaymentOrderDto createOrder(Long bookingId, String bookingNumber, Double amount, String currency);

    boolean verifyPayment(String orderId, String paymentId, String signature);

    String processRefund(String transactionId, Double amount);
}

