package com.project.bookmyshow.controller;

import com.project.bookmyshow.dto.BookingDto;
import com.project.bookmyshow.dto.BookingRequestDto;
import com.project.bookmyshow.dto.PriceBreakdownDto;
import com.project.bookmyshow.exception.BadRequestException;
import com.project.bookmyshow.model.ShowSeat;
import com.project.bookmyshow.model.User;
import com.project.bookmyshow.repository.ShowSeatRepository;
import com.project.bookmyshow.repository.UserRepository;
import com.project.bookmyshow.service.BookingService;
import com.project.bookmyshow.service.PricingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private PricingService pricingService;

    @Autowired
    private ShowSeatRepository showSeatRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public ResponseEntity<BookingDto> createBooking(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyHeader,
            @Valid @RequestBody BookingRequestDto bookingRequest) {

        if (userDetails != null && (bookingRequest.getUserId() == null || bookingRequest.getUserId() == 0)) {
            userRepository.findByEmail(userDetails.getUsername())
                    .ifPresent(u -> bookingRequest.setUserId(u.getId()));
        }

        if (idempotencyHeader != null && !idempotencyHeader.isBlank()) {
            bookingRequest.setIdempotencyKey(idempotencyHeader);
        }

        return new ResponseEntity<>(bookingService.createBooking(bookingRequest), HttpStatus.CREATED);
    }

    @PostMapping("/calculate-price")
    public ResponseEntity<PriceBreakdownDto> calculatePrice(
            @RequestBody Map<String, Object> request) {
        @SuppressWarnings("unchecked")
        List<Object> rawSeats = (List<Object>) (request.get("seatIds") != null ? request.get("seatIds") : request.get("showSeatIds"));
        if (rawSeats == null || rawSeats.isEmpty()) {
            throw new BadRequestException("seatIds or showSeatIds list is required");
        }
        List<Long> seatIds = rawSeats.stream().map(obj -> ((Number) obj).longValue()).toList();
        String couponCode = (String) request.get("couponCode");

        List<ShowSeat> seats = showSeatRepository.findAllById(seatIds);
        return ResponseEntity.ok(pricingService.calculatePrice(seats, couponCode));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingDto> getBookingById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        BookingDto booking = bookingService.getBookingById(id);
        // Resource authorization check
        if (userDetails != null && !userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_SUPPORT"))) {
            if (booking.getUser() != null && !booking.getUser().getEmail().equalsIgnoreCase(userDetails.getUsername())) {
                throw new com.project.bookmyshow.exception.BadRequestException("You do not have permission to view another customer's booking");
            }
        }
        return ResponseEntity.ok(booking);
    }

    @GetMapping("/number/{bookingNumber}")
    public ResponseEntity<BookingDto> getBookingByNumber(@PathVariable String bookingNumber) {
        return ResponseEntity.ok(bookingService.getBookingNumber(bookingNumber));
    }

    @GetMapping("/my-bookings")
    public ResponseEntity<List<BookingDto>> getMyBookings(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
        return ResponseEntity.ok(bookingService.getBookingByUserId(user.getId()));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPPORT')")
    public ResponseEntity<List<BookingDto>> getBookingsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(bookingService.getBookingByUserId(userId));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<BookingDto> cancelBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody(required = false) Map<String, String> body) {
        Long userId = null;
        if (userDetails != null) {
            userId = userRepository.findByEmail(userDetails.getUsername()).map(User::getId).orElse(null);
        }
        String reason = (body != null && body.containsKey("reason")) ? body.get("reason") : "Customer requested cancellation";
        return ResponseEntity.ok(bookingService.cancelBookingWithReason(id, userId, reason));
    }
}
