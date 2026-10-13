package com.project.bookmyshow.service;

import com.project.bookmyshow.dto.*;
import com.project.bookmyshow.exception.BadRequestException;
import com.project.bookmyshow.exception.ResourceNotFoundException;
import com.project.bookmyshow.exception.SeatUnavailableException;
import com.project.bookmyshow.model.*;
import com.project.bookmyshow.payment.PaymentGateway;
import com.project.bookmyshow.payment.PaymentGatewayFactory;
import com.project.bookmyshow.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BookingService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ShowRepository showRepository;

    @Autowired
    private ShowSeatRepository showSeatRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private PricingService pricingService;

    @Autowired
    private PaymentGatewayFactory paymentGatewayFactory;

    @Autowired
    private TicketService ticketService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private CouponRepository couponRepository;

    @Transactional
    public BookingDto createBooking(BookingRequestDto bookingRequest) {
        // Idempotency check: prevent duplicate charges on repeated client submissions
        if (bookingRequest.getIdempotencyKey() != null && !bookingRequest.getIdempotencyKey().isBlank()) {
            var existingBooking = bookingRepository.findByIdempotencyKey(bookingRequest.getIdempotencyKey());
            if (existingBooking.isPresent()) {
                Booking existing = existingBooking.get();
                List<ShowSeat> existingSeats = showSeatRepository.findByBookingId(existing.getId());
                return mapToBookingDto(existing, existingSeats);
            }
        }

        User user = userRepository.findById(bookingRequest.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + bookingRequest.getUserId()));

        Show show = showRepository.findById(bookingRequest.getShowId())
                .orElseThrow(() -> new ResourceNotFoundException("Show not found with id: " + bookingRequest.getShowId()));

        if (!Boolean.TRUE.equals(show.getActive()) || "CANCELLED".equalsIgnoreCase(show.getStatus())) {
            throw new BadRequestException("Cannot book seats for an inactive or cancelled show");
        }

        if (show.getStartTime().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Cannot book seats for a past show");
        }

        // Deadlock prevention: sort the seat IDs before acquiring pessimistic locks
        List<Long> sortedSeatIds = bookingRequest.getSeatIds().stream().distinct().sorted().collect(Collectors.toList());
        List<ShowSeat> selectedSeats = showSeatRepository.findAllByIdForUpdate(sortedSeatIds);

        if (selectedSeats.size() != sortedSeatIds.size()) {
            throw new BadRequestException("One or more selected seats do not exist");
        }

        LocalDateTime now = LocalDateTime.now();
        String lockToken = bookingRequest.getLockToken();

        for (ShowSeat seat : selectedSeats) {
            if (!seat.getShow().getId().equals(show.getId())) {
                throw new BadRequestException("Seat " + seat.getId() + " does not belong to show " + show.getId());
            }

            if (lockToken != null && !lockToken.isBlank()) {
                // Verify lock ownership and TTL
                if (!seat.isLockedBy(lockToken, user.getId(), now)) {
                    String seatNum = (seat.getSeat() != null) ? seat.getSeat().getSeatNumber() : String.valueOf(seat.getId());
                    throw new SeatUnavailableException("Seat " + seatNum + " lock is expired or belongs to another user");
                }
            } else {
                // Direct booking mode: verify seat availability
                if (!seat.isAvailable(now)) {
                    String seatNum = (seat.getSeat() != null) ? seat.getSeat().getSeatNumber() : String.valueOf(seat.getId());
                    throw new SeatUnavailableException("Seat " + seatNum + " is not available");
                }
            }
        }

        // Pricing calculation (base + convenience fee + 18% GST - coupon discount)
        PriceBreakdownDto priceBreakdown = pricingService.calculatePrice(selectedSeats, bookingRequest.getCouponCode());

        // Increment coupon usage if coupon was applied
        if (priceBreakdown.getCouponCode() != null) {
            couponRepository.findByCodeIgnoreCase(priceBreakdown.getCouponCode()).ifPresent(coupon -> {
                coupon.setTimesUsed(coupon.getTimesUsed() != null ? coupon.getTimesUsed() + 1 : 1);
                couponRepository.save(coupon);
            });
        }

        String bookingNumber = "BMS-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        String paymentGatewayName = bookingRequest.getPaymentGateway() != null ? bookingRequest.getPaymentGateway() : "MOCK";

        // Payment record
        Payment payment = Payment.builder()
                .amount(priceBreakdown.getTotalAmount())
                .currency("INR")
                .paymentTime(now)
                .paymentMethod(bookingRequest.getPaymentMethod() != null ? bookingRequest.getPaymentMethod() : "UPI")
                .paymentGateway(paymentGatewayName)
                .status("SUCCESS") // Instant confirmation for mock payment flow
                .transactionId("TXN-" + UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase())
                .build();

        // Booking record
        Booking booking = Booking.builder()
                .user(user)
                .show(show)
                .bookingNumber(bookingNumber)
                .bookingTime(now)
                .status("CONFIRMED")
                .totalAmount(priceBreakdown.getTotalAmount())
                .baseAmount(priceBreakdown.getBaseAmount())
                .convenienceFee(priceBreakdown.getConvenienceFee())
                .taxAmount(priceBreakdown.getTaxAmount())
                .discountAmount(priceBreakdown.getDiscountAmount())
                .couponCode(priceBreakdown.getCouponCode())
                .idempotencyKey(bookingRequest.getIdempotencyKey())
                .lockToken(lockToken)
                .payment(payment)
                .build();

        Booking savedBooking = bookingRepository.save(booking);

        // Transition seats to BOOKED and associate with booking
        for (ShowSeat seat : selectedSeats) {
            seat.setStatus("BOOKED");
            seat.setBooking(savedBooking);
            seat.setLockToken(null);
            seat.setLockedByUserId(null);
            seat.setLockExpiresAt(null);
        }
        showSeatRepository.saveAll(selectedSeats);

        // Auto-generate ticket with cryptographic QR verification
        ticketService.generateTicket(savedBooking, selectedSeats);

        // Asynchronous customer notification
        notificationService.sendBookingConfirmation(savedBooking);

        return mapToBookingDto(savedBooking, selectedSeats);
    }

    public BookingDto getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        List<ShowSeat> seats = showSeatRepository.findByBookingId(booking.getId());
        return mapToBookingDto(booking, seats);
    }

    public BookingDto getBookingNumber(String bookingNumber) {
        Booking booking = bookingRepository.findByBookingNumber(bookingNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with number: " + bookingNumber));

        List<ShowSeat> seats = showSeatRepository.findByBookingId(booking.getId());
        return mapToBookingDto(booking, seats);
    }

    public List<BookingDto> getBookingByUserId(Long userId) {
        List<Booking> bookings = bookingRepository.findByUserId(userId);
        return bookings.stream()
                .map(booking -> {
                    List<ShowSeat> seats = showSeatRepository.findByBookingId(booking.getId());
                    return mapToBookingDto(booking, seats);
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public BookingDto cancelBooking(Long id) {
        return cancelBookingWithReason(id, null, "Customer requested cancellation");
    }

    @Transactional
    public BookingDto cancelBookingWithReason(Long id, Long requestingUserId, String reason) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        if ("CANCELLED".equalsIgnoreCase(booking.getStatus())) {
            throw new BadRequestException("Booking is already cancelled");
        }

        // Cutoff check: allow cancellation only up to 2 hours before show start time
        if (booking.getShow() != null && booking.getShow().getStartTime() != null) {
            LocalDateTime cutoff = booking.getShow().getStartTime().minusHours(2);
            if (LocalDateTime.now().isAfter(cutoff)) {
                throw new BadRequestException("Bookings can only be cancelled up to 2 hours before show start time");
            }
        }

        LocalDateTime now = LocalDateTime.now();
        booking.setStatus("CANCELLED");
        booking.setCancelledAt(now);
        booking.setCancellationReason(reason);

        // Release seats back to AVAILABLE
        List<ShowSeat> seats = showSeatRepository.findByBookingId(booking.getId());
        seats.forEach(ShowSeat::releaseLock);
        seats.forEach(seat -> {
            seat.setStatus("AVAILABLE");
            seat.setBooking(null);
        });
        showSeatRepository.saveAll(seats);

        // Process refund
        Double refundAmount = booking.getTotalAmount();
        if (booking.getPayment() != null && "SUCCESS".equalsIgnoreCase(booking.getPayment().getStatus())) {
            PaymentGateway gateway = paymentGatewayFactory.getGateway(booking.getPayment().getPaymentGateway());
            String refundId = gateway.processRefund(booking.getPayment().getTransactionId(), refundAmount);

            booking.getPayment().setStatus("REFUNDED");
            booking.getPayment().setRefundId(refundId);
            booking.getPayment().setRefundAmount(refundAmount);
            booking.getPayment().setRefundedAt(now);
            booking.setRefundAmount(refundAmount);
        }

        Booking updatedBooking = bookingRepository.save(booking);

        // Customer notification
        notificationService.sendBookingCancellation(updatedBooking);
        if (refundAmount != null && refundAmount > 0) {
            notificationService.sendRefundNotification(updatedBooking, refundAmount);
        }

        return mapToBookingDto(updatedBooking, seats);
    }

    public BookingDto mapToBookingDto(Booking booking, List<ShowSeat> seats) {
        BookingDto.BookingDtoBuilder builder = BookingDto.builder()
                .id(booking.getId())
                .bookingNumber(booking.getBookingNumber())
                .bookingTime(booking.getBookingTime())
                .status(booking.getStatus())
                .totalAmount(booking.getTotalAmount())
                .baseAmount(booking.getBaseAmount())
                .convenienceFee(booking.getConvenienceFee())
                .taxAmount(booking.getTaxAmount())
                .discountAmount(booking.getDiscountAmount())
                .couponCode(booking.getCouponCode())
                .idempotencyKey(booking.getIdempotencyKey())
                .cancelledAt(booking.getCancelledAt())
                .cancellationReason(booking.getCancellationReason())
                .refundAmount(booking.getRefundAmount());

        // User
        if (booking.getUser() != null) {
            UserDto userDto = new UserDto();
            userDto.setId(booking.getUser().getId());
            userDto.setName(booking.getUser().getName());
            userDto.setEmail(booking.getUser().getEmail());
            userDto.setPhoneNumber(booking.getUser().getPhoneNumber());
            builder.user(userDto);
        }

        // Show
        if (booking.getShow() != null) {
            Show show = booking.getShow();
            ShowDto showDto = new ShowDto();
            showDto.setId(show.getId());
            showDto.setStartTime(show.getStartTime());
            showDto.setEndTime(show.getEndTime());
            showDto.setShowFormat(show.getShowFormat());

            if (show.getMovie() != null) {
                Movie movie = show.getMovie();
                showDto.setMovie(new MovieDto(
                        movie.getId(),
                        movie.getTitle(),
                        movie.getDescription(),
                        movie.getLanguage(),
                        movie.getGenre(),
                        movie.getDurationMins(),
                        movie.getReleaseDate(),
                        movie.getPosterUrl()
                ));
            }

            if (show.getScreen() != null) {
                Screen screen = show.getScreen();
                TheaterDto theaterDto = new TheaterDto();
                if (screen.getTheater() != null) {
                    Theater theater = screen.getTheater();
                    theaterDto.setId(theater.getId());
                    theaterDto.setName(theater.getName());
                    theaterDto.setAddress(theater.getAddress());
                    theaterDto.setCity(theater.getCity());
                    theaterDto.setTotalScreens(theater.getTotalScreens());
                }

                showDto.setScreen(new ScreenDto(
                        screen.getId(),
                        screen.getName(),
                        screen.getTotalSeats(),
                        theaterDto
                ));
            }

            builder.show(showDto);
        }

        // Seats
        if (seats != null) {
            List<ShowSeatDto> seatDtos = seats.stream().map(seat -> {
                ShowSeatDto seatDto = new ShowSeatDto();
                seatDto.setId(seat.getId());
                seatDto.setStatus(seat.getStatus());
                seatDto.setPrice(seat.getPrice());

                if (seat.getSeat() != null) {
                    Seat base = seat.getSeat();
                    SeatDto baseSeatDto = SeatDto.builder()
                            .id(base.getId())
                            .seatNumber(base.getSeatNumber())
                            .rowName(base.getRowName())
                            .colNumber(base.getColNumber())
                            .seatType(base.getSeatType())
                            .basePrice(base.getBasePrice())
                            .active(base.getActive())
                            .accessible(base.getAccessible())
                            .build();
                    seatDto.setSeat(baseSeatDto);
                }
                return seatDto;
            }).collect(Collectors.toList());
            builder.seats(seatDtos);
        }

        // Payment
        if (booking.getPayment() != null) {
            Payment p = booking.getPayment();
            PaymentDto paymentDto = PaymentDto.builder()
                    .id(p.getId())
                    .transactionId(p.getTransactionId())
                    .orderId(p.getOrderId())
                    .paymentGateway(p.getPaymentGateway())
                    .amount(p.getAmount())
                    .currency(p.getCurrency())
                    .paymentTime(p.getPaymentTime())
                    .paymentMethod(p.getPaymentMethod())
                    .status(p.getStatus())
                    .build();
            builder.payment(paymentDto);
        }

        return builder.build();
    }
}
