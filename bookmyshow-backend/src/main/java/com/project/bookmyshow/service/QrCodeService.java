package com.project.bookmyshow.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;

@Service
public class QrCodeService {

    @Value("${app.ticket.qr-secret:bookmyshow_super_secret_qr_hmac_key_2026}")
    private String qrSecret;

    public String generateQrPayload(String ticketNumber, Long showId, String bookingNumber) {
        String rawData = ticketNumber + ":" + showId + ":" + bookingNumber;
        String signature = sign(rawData);
        return "BMS:" + ticketNumber + ":" + signature;
    }

    public boolean verifyQrPayload(String qrPayload, String ticketNumber, Long showId, String bookingNumber) {
        if (qrPayload == null || !qrPayload.startsWith("BMS:")) {
            return false;
        }
        String[] parts = qrPayload.split(":");
        if (parts.length != 3) {
            return false;
        }
        String parsedTicketNumber = parts[1];
        String parsedSignature = parts[2];

        if (!parsedTicketNumber.equals(ticketNumber)) {
            return false;
        }

        String rawData = ticketNumber + ":" + showId + ":" + bookingNumber;
        String expectedSignature = sign(rawData);

        return MessageDigest.isEqual(
                expectedSignature.getBytes(StandardCharsets.UTF_8),
                parsedSignature.getBytes(StandardCharsets.UTF_8)
        );
    }

    private String sign(String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(qrSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash).substring(0, 32);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate QR code signature", e);
        }
    }
}

