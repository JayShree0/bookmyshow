package com.project.bookmyshow.payment;

import com.project.bookmyshow.dto.PaymentOrderDto;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class MockPaymentGateway implements PaymentGateway {

    @Override
    public String getName() {
        return "MOCK";
    }

    @Override
    public PaymentOrderDto createOrder(Long bookingId, String bookingNumber, Double amount, String currency) {
        String orderId = "order_mock_" + UUID.randomUUID().toString().substring(0, 12);
        return PaymentOrderDto.builder()
                .orderId(orderId)
                .amount(amount)
                .currency(currency != null ? currency : "INR")
                .gateway(getName())
                .bookingId(bookingId)
                .bookingNumber(bookingNumber)
                .gatewayKeyId("mock_key_public")
                .build();
    }

    @Override
    public boolean verifyPayment(String orderId, String paymentId, String signature) {
        // Mock gateway succeeds as long as a payment identifier or mock token is provided
        return paymentId != null && !paymentId.isBlank();
    }

    @Override
    public String processRefund(String transactionId, Double amount) {
        return "rfnd_mock_" + UUID.randomUUID().toString().substring(0, 12);
    }
}

