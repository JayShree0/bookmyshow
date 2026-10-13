package com.project.bookmyshow.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.bookmyshow.dto.*;
import com.project.bookmyshow.model.*;
import com.project.bookmyshow.repository.*;
import com.project.bookmyshow.security.JwtUtils;
import com.project.bookmyshow.service.SeatLockService;
import com.project.bookmyshow.service.ShowService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class EndToEndBookingAndLifecycleIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private TheaterRepository theaterRepository;

    @Autowired
    private ScreenRepository screenRepository;

    @Autowired
    private SeatRepository seatRepository;

    @Autowired
    private ShowRepository showRepository;

    @Autowired
    private ShowSeatRepository showSeatRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private CouponRepository couponRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private WatchlistRepository watchlistRepository;

    @Autowired
    private NotificationRecordRepository notificationRecordRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private ShowService showService;

    @Autowired
    private SeatLockService seatLockService;

    private User customer;
    private User admin;
    private String customerToken;
    private String adminToken;
    private Movie movie;
    private Screen screen;
    private ShowDto scheduledShow;

    @BeforeEach
    void setUp() {
        notificationRecordRepository.deleteAll();
        ticketRepository.deleteAll();
        bookingRepository.deleteAll();
        showSeatRepository.deleteAll();
        showRepository.deleteAll();
        seatRepository.deleteAll();
        screenRepository.deleteAll();
        theaterRepository.deleteAll();
        reviewRepository.deleteAll();
        watchlistRepository.deleteAll();
        couponRepository.deleteAll();
        movieRepository.deleteAll();
        userRepository.deleteAll();

        // 1. Users
        customer = userRepository.save(User.builder()
                .name("John Doe")
                .email("john@example.com")
                .phoneNumber("9876543210")
                .password(passwordEncoder.encode("Pass@123"))
                .role(Role.ROLE_CUSTOMER)
                .build());

        admin = userRepository.save(User.builder()
                .name("Admin Boss")
                .email("admin@example.com")
                .phoneNumber("9999999999")
                .password(passwordEncoder.encode("Admin@123"))
                .role(Role.ROLE_ADMIN)
                .build());

        customerToken = jwtUtils.generateToken(customer);
        adminToken = jwtUtils.generateToken(admin);

        // 2. Movie
        movie = movieRepository.save(Movie.builder()
                .title("Inception")
                .description("Dream within a dream")
                .language("English")
                .genre("Sci-Fi")
                .durationMins(148)
                .build());

        // 3. Theater & Screen
        Theater theater = theaterRepository.save(Theater.builder()
                .name("Cinepolis Nexus")
                .address("Whitefield")
                .city("Bangalore")
                .totalScreens(1)
                .build());

        screen = screenRepository.save(Screen.builder()
                .name("Audi 1")
                .totalSeats(4)
                .theater(theater)
                .build());

        // 4. Seats
        seatRepository.save(Seat.builder().seatNumber("A1").rowName("A").colNumber(1).seatType("STANDARD").basePrice("200.0").screen(screen).build());
        seatRepository.save(Seat.builder().seatNumber("A2").rowName("A").colNumber(2).seatType("STANDARD").basePrice("200.0").screen(screen).build());
        seatRepository.save(Seat.builder().seatNumber("B1").rowName("B").colNumber(1).seatType("PREMIUM").basePrice("300.0").screen(screen).build());
        seatRepository.save(Seat.builder().seatNumber("B2").rowName("B").colNumber(2).seatType("PREMIUM").basePrice("300.0").screen(screen).build());

        // 5. Schedule Show (tomorrow 6 PM)
        LocalDateTime start = LocalDateTime.now().plusDays(1).withHour(18).withMinute(0);
        scheduledShow = showService.scheduleShow(ShowCreateRequest.builder()
                .movieId(movie.getId())
                .screenId(screen.getId())
                .startTime(start)
                .endTime(start.plusHours(3))
                .showFormat("2D")
                .build());

        // 6. Create Coupon: FLAT50
        couponRepository.save(Coupon.builder()
                .code("FLAT50")
                .description("Flat Rs. 50 off")
                .discountType("FLAT")
                .discountValue(50.0)
                .minOrderAmount(100.0)
                .active(true)
                .build());
    }

    @Test
    @DisplayName("End-to-End Booking Lifecycle: Lock Seats -> Calculate Price -> Book with Idempotency -> Issue Ticket -> Check-In -> Cancel & Refund")
    void fullBookingLifecycle() throws Exception {
        List<ShowSeat> showSeats = showSeatRepository.findByShowId(scheduledShow.getId());
        List<Long> targetSeatIds = List.of(showSeats.get(0).getId(), showSeats.get(1).getId()); // 2 seats: A1 & A2 (200 + 200 = 400 base)

        // Step 1: Customer locks seats
        SeatLockRequest lockRequest = SeatLockRequest.builder()
                .showId(scheduledShow.getId())
                .seatIds(targetSeatIds)
                .lockDurationMinutes(5)
                .build();

        String lockRes = mockMvc.perform(post("/api/shows/" + scheduledShow.getId() + "/lock")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(lockRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.lockToken").exists())
                .andReturn().getResponse().getContentAsString();

        SeatLockResponse lockResponse = objectMapper.readValue(lockRes, SeatLockResponse.class);
        String lockToken = lockResponse.getLockToken();

        // Step 2: Price Calculation preview with coupon
        Map<String, Object> priceCalcReq = Map.of(
                "seatIds", targetSeatIds,
                "couponCode", "FLAT50"
        );

        mockMvc.perform(post("/api/bookings/calculate-price")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(priceCalcReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.baseAmount").value(400.0))
                .andExpect(jsonPath("$.discountAmount").value(50.0))
                .andExpect(jsonPath("$.couponCode").value("FLAT50"));

        // Step 3: Create Booking with lockToken and Idempotency-Key
        String idempotencyKey = "idemp-" + System.currentTimeMillis();
        BookingRequestDto bookingRequest = BookingRequestDto.builder()
                .showId(scheduledShow.getId())
                .seatIds(targetSeatIds)
                .lockToken(lockToken)
                .couponCode("FLAT50")
                .paymentMethod("UPI")
                .build();

        String bookingRes = mockMvc.perform(post("/api/bookings")
                        .header("Authorization", "Bearer " + customerToken)
                        .header("Idempotency-Key", idempotencyKey)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bookingRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.status").value("CONFIRMED"))
                .andExpect(jsonPath("$.baseAmount").value(400.0))
                .andExpect(jsonPath("$.discountAmount").value(50.0))
                .andReturn().getResponse().getContentAsString();

        BookingDto bookingDto = objectMapper.readValue(bookingRes, BookingDto.class);
        Long bookingId = bookingDto.getId();

        // Step 4: Verify Idempotency - repeated submission returns same booking without error
        mockMvc.perform(post("/api/bookings")
                        .header("Authorization", "Bearer " + customerToken)
                        .header("Idempotency-Key", idempotencyKey)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bookingRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(bookingId))
                .andExpect(jsonPath("$.bookingNumber").value(bookingDto.getBookingNumber()));

        // Step 5: Verify Ticket auto-generated with QR code
        List<Ticket> tickets = ticketRepository.findByBookingId(bookingId);
        assertThat(tickets).hasSize(1);
        Ticket ticket = tickets.get(0);
        assertThat(ticket.getTicketNumber()).startsWith("TKT-");
        assertThat(ticket.getQrCodeData()).startsWith("BMS:");
        assertThat(ticket.getStatus()).isEqualTo("ISSUED");

        // Step 6: Staff Gate Check-In using QR payload
        mockMvc.perform(post("/api/tickets/check-in")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("qrPayload", ticket.getQrCodeData()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CHECKED_IN"))
                .andExpect(jsonPath("$.checkedInAt").exists());

        // Step 7: Duplicate Check-In rejected
        mockMvc.perform(post("/api/tickets/check-in")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("qrPayload", ticket.getQrCodeData()))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("was already checked in")));

        // Step 8: Customer Cancellation & Refund
        mockMvc.perform(post("/api/bookings/" + bookingId + "/cancel")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("reason", "Changed plans"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"))
                .andExpect(jsonPath("$.cancellationReason").value("Changed plans"))
                .andExpect(jsonPath("$.payment.status").value("REFUNDED"));

        // Step 9: Verify seats released back to AVAILABLE
        List<ShowSeat> refreshedSeats = showSeatRepository.findAllById(targetSeatIds);
        assertThat(refreshedSeats.get(0).getStatus()).isEqualTo("AVAILABLE");
        assertThat(refreshedSeats.get(0).getBooking()).isNull();

        // Step 10: Verify notifications were recorded in ledger
        var notifications = notificationRecordRepository.findByRecipientOrderBySentAtDesc(customer.getEmail());
        assertThat(notifications).isNotEmpty();
    }

    @Test
    @DisplayName("Admin Dashboard Analytics provides real-time GBV and occupancy statistics")
    void adminAnalyticsDashboard() throws Exception {
        mockMvc.perform(get("/api/admin/analytics")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.grossBookingValue").exists())
                .andExpect(jsonPath("$.netRevenue").exists())
                .andExpect(jsonPath("$.overallOccupancyPercentage").exists());
    }

    @Test
    @DisplayName("Customer Movie Review and Rating recalculation")
    void reviewAndRatingWorkflow() throws Exception {
        ReviewRequest reviewRequest = ReviewRequest.builder()
                .movieId(movie.getId())
                .rating(5)
                .comment("Absolute masterpiece!")
                .build();

        mockMvc.perform(post("/api/reviews")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reviewRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rating").value(5))
                .andExpect(jsonPath("$.comment").value("Absolute masterpiece!"));

        Movie updatedMovie = movieRepository.findById(movie.getId()).orElseThrow();
        assertThat(updatedMovie.getRating()).isEqualTo(5.0);
        assertThat(updatedMovie.getTotalRatings()).isEqualTo(1);
    }

    @Test
    @DisplayName("Customer Movie Watchlist: Add, List, and Delete")
    void watchlistWorkflow() throws Exception {
        // 1. Add to watchlist
        mockMvc.perform(post("/api/watchlist/" + movie.getId())
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(movie.getId()));

        // 2. List watchlist
        mockMvc.perform(get("/api/watchlist")
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].title").value("Inception"));

        // 3. Remove from watchlist
        mockMvc.perform(delete("/api/watchlist/" + movie.getId())
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Movie removed from watchlist"));

        // 4. Verify empty watchlist
        mockMvc.perform(get("/api/watchlist")
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }
}

