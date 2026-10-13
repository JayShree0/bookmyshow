package com.project.bookmyshow.payment;

import com.project.bookmyshow.dto.PaymentOrderDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.UUID;

@Component
public class RazorpayPaymentGateway implements PaymentGateway {

    @Value("${app.payment.razorpay.key-id:rzp_test_bookmyshow}")
    private String keyId;

    @Value("${app.payment.razorpay.key-secret:dummy_secret_for_test}")
    private String keySecret;

    @Override
    public String getName() {
        return "RAZORPAY";
    }

    @Override
    public PaymentOrderDto createOrder(Long bookingId, String bookingNumber, Double amount, String currency) {
        String orderId = "order_rzp_" + UUID.randomUUID().toString().substring(0, 12);
        return PaymentOrderDto.builder()
                .orderId(orderId)
                .amount(amount)
                .currency(currency != null ? currency : "INR")
                .gateway(getName())
                .bookingId(bookingId)
                .bookingNumber(bookingNumber)
                .gatewayKeyId(keyId)
                .build();
    }

    @Override
    public boolean verifyPayment(String orderId, String paymentId, String signature) {
        if (orderId == null || paymentId == null || signature == null) {
            return false;
        }
        try {
            String payload = orderId + "|" + paymentId;
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(keySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] hash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            String expectedSignature = HexFormat.of().formatHex(hash);
            return MessageDigest.isEqual(expectedSignature.getBytes(StandardCharsets.UTF_8), signature.getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public String processRefund(String transactionId, Double amount) {
        return "rfnd_rzp_" + UUID.randomUUID().toString().substring(0, 12);
    }
}

