package com.project.bookmyshow.service;

import com.project.bookmyshow.model.Booking;
import com.project.bookmyshow.model.NotificationRecord;
import com.project.bookmyshow.repository.NotificationRecordRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    @Autowired
    private NotificationRecordRepository notificationRecordRepository;

    public void sendBookingConfirmation(Booking booking) {
        String recipient = booking.getUser() != null ? booking.getUser().getEmail() : "customer@example.com";
        String movieTitle = (booking.getShow() != null && booking.getShow().getMovie() != null)
                ? booking.getShow().getMovie().getTitle()
                : "Movie";

        String subject = "Booking Confirmed: " + movieTitle + " [" + booking.getBookingNumber() + "]";
        String message = String.format(
                "Dear %s, your booking (%s) for %s at %s is CONFIRMED! Total paid: INR %.2f. Enjoy your show!",
                booking.getUser() != null ? booking.getUser().getName() : "Customer",
                booking.getBookingNumber(),
                movieTitle,
                booking.getShow() != null ? booking.getShow().getStartTime() : "show time",
                booking.getTotalAmount()
        );

        log.info("[NOTIFICATION] Sending booking confirmation to {}", recipient);
        saveRecord(recipient, "EMAIL", "BOOKING_CONFIRMED", subject, message);
    }

    public void sendBookingCancellation(Booking booking) {
        String recipient = booking.getUser() != null ? booking.getUser().getEmail() : "customer@example.com";
        String subject = "Booking Cancelled: " + booking.getBookingNumber();
        String message = String.format(
                "Your booking %s has been CANCELLED. If a refund is applicable, it will be credited within 3-5 business days.",
                booking.getBookingNumber()
        );

        log.info("[NOTIFICATION] Sending cancellation alert to {}", recipient);
        saveRecord(recipient, "EMAIL", "BOOKING_CANCELLED", subject, message);
    }

    public void sendRefundNotification(Booking booking, Double refundAmount) {
        String recipient = booking.getUser() != null ? booking.getUser().getEmail() : "customer@example.com";
        String subject = "Refund Processed: " + booking.getBookingNumber();
        String message = String.format(
                "A refund of INR %.2f has been processed for your booking %s to your original payment method.",
                refundAmount != null ? refundAmount : 0.0,
                booking.getBookingNumber()
        );

        log.info("[NOTIFICATION] Sending refund notification to {}", recipient);
        saveRecord(recipient, "EMAIL", "REFUND_PROCESSED", subject, message);
    }

    public void sendShowReminder(Booking booking) {
        String recipient = booking.getUser() != null ? booking.getUser().getEmail() : "customer@example.com";
        String subject = "Reminder: Your movie starts soon!";
        String message = String.format(
                "Reminder: Your show for %s starts at %s. Please arrive 15 minutes before showtime.",
                booking.getShow() != null && booking.getShow().getMovie() != null ? booking.getShow().getMovie().getTitle() : "your movie",
                booking.getShow() != null ? booking.getShow().getStartTime() : "soon"
        );

        log.info("[NOTIFICATION] Sending show reminder to {}", recipient);
        saveRecord(recipient, "EMAIL", "SHOW_REMINDER", subject, message);
    }

    private void saveRecord(String recipient, String channel, String type, String subject, String message) {
        try {
            NotificationRecord record = NotificationRecord.builder()
                    .recipient(recipient)
                    .channel(channel)
                    .type(type)
                    .subject(subject)
                    .message(message)
                    .status("SENT")
                    .sentAt(LocalDateTime.now())
                    .build();
            notificationRecordRepository.save(record);
        } catch (Exception e) {
            log.error("Failed to save notification record: {}", e.getMessage());
        }
    }
}

