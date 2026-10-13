package com.project.bookmyshow.scheduler;

import com.project.bookmyshow.model.Booking;
import com.project.bookmyshow.model.Show;
import com.project.bookmyshow.model.ShowSeat;
import com.project.bookmyshow.repository.BookingRepository;
import com.project.bookmyshow.repository.ShowRepository;
import com.project.bookmyshow.repository.ShowSeatRepository;
import com.project.bookmyshow.service.SeatLockService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class ScheduledTasks {

    private static final Logger log = LoggerFactory.getLogger(ScheduledTasks.class);

    @Autowired
    private SeatLockService seatLockService;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ShowSeatRepository showSeatRepository;

    @Autowired
    private ShowRepository showRepository;

    /**
     * Runs every 60 seconds to release seats whose temporary lock TTL has elapsed.
     */
    @Scheduled(fixedRate = 60000)
    public void cleanupExpiredSeatLocks() {
        int releasedCount = seatLockService.cleanupExpiredLocks();
        if (releasedCount > 0) {
            log.info("[CRON] Cleaned up {} expired temporary seat locks", releasedCount);
        }
    }

    /**
     * Runs every 2 minutes to expire unpaid bookings left hanging for more than 15 minutes.
     */
    @Scheduled(fixedRate = 120000)
    @Transactional
    public void expireAbandonedBookings() {
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(15);
        List<Booking> pendingBookings = bookingRepository.findByStatusAndBookingTimeBefore("PENDING_PAYMENT", cutoff);

        for (Booking booking : pendingBookings) {
            log.info("[CRON] Expiring abandoned booking: {}", booking.getBookingNumber());
            booking.setStatus("EXPIRED");

            List<ShowSeat> seats = showSeatRepository.findByBookingId(booking.getId());
            seats.forEach(seat -> {
                seat.setStatus("AVAILABLE");
                seat.setBooking(null);
                seat.releaseLock();
            });
            showSeatRepository.saveAll(seats);
            bookingRepository.save(booking);
        }
    }

    /**
     * Runs every 30 minutes to transition completed shows from SCHEDULED to COMPLETED.
     */
    @Scheduled(fixedRate = 1800000)
    @Transactional
    public void markCompletedShows() {
        LocalDateTime now = LocalDateTime.now();
        List<Show> activeShows = showRepository.findAll().stream()
                .filter(s -> "SCHEDULED".equalsIgnoreCase(s.getStatus()))
                .filter(s -> s.getEndTime().isBefore(now))
                .toList();

        for (Show show : activeShows) {
            show.setStatus("COMPLETED");
            showRepository.save(show);
        }
    }
}

