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

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class ShowAndSeatLockIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ShowRepository showRepository;

    @Autowired
    private ShowSeatRepository showSeatRepository;

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private TheaterRepository theaterRepository;

    @Autowired
    private ScreenRepository screenRepository;

    @Autowired
    private SeatRepository seatRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private ShowService showService;

    @Autowired
    private SeatLockService seatLockService;

    private Movie testMovie;
    private Screen testScreen;
    private User testCustomer;
    private User testAdmin;
    private String customerToken;
    private String adminToken;

    @BeforeEach
    void setUp() {
        showSeatRepository.deleteAll();
        showRepository.deleteAll();
        seatRepository.deleteAll();
        screenRepository.deleteAll();
        theaterRepository.deleteAll();
        movieRepository.deleteAll();
        userRepository.deleteAll();

        // 1. Users
        testCustomer = userRepository.save(User.builder()
                .name("Alice Viewer")
                .email("alice@example.com")
                .phoneNumber("9876543210")
                .password(passwordEncoder.encode("Password@123"))
                .role(Role.ROLE_CUSTOMER)
                .build());

        testAdmin = userRepository.save(User.builder()
                .name("Admin Boss")
                .email("admin@example.com")
                .phoneNumber("9999999999")
                .password(passwordEncoder.encode("Admin@123"))
                .role(Role.ROLE_ADMIN)
                .build());

        customerToken = jwtUtils.generateToken(testCustomer);
        adminToken = jwtUtils.generateToken(testAdmin);

        // 2. Movie
        testMovie = movieRepository.save(Movie.builder()
                .title("Interstellar")
                .description("Epic Sci-Fi")
                .language("English")
                .genre("Sci-Fi")
                .durationMins(169)
                .build());

        // 3. Theater & Screen
        Theater theater = theaterRepository.save(Theater.builder()
                .name("PVR Forum Mall")
                .address("Koramangala")
                .city("Bangalore")
                .totalScreens(1)
                .build());

        testScreen = screenRepository.save(Screen.builder()
                .name("Screen 1")
                .totalSeats(3)
                .theater(theater)
                .build());

        // 4. Physical Seats
        seatRepository.save(Seat.builder().seatNumber("A1").rowName("A").colNumber(1).seatType("STANDARD").basePrice("250.0").screen(testScreen).build());
        seatRepository.save(Seat.builder().seatNumber("A2").rowName("A").colNumber(2).seatType("STANDARD").basePrice("250.0").screen(testScreen).build());
        seatRepository.save(Seat.builder().seatNumber("B1").rowName("B").colNumber(1).seatType("PREMIUM").basePrice("350.0").screen(testScreen).build());
    }

    @Test
    @DisplayName("Admin schedules a show successfully and ShowSeats are auto-created")
    void scheduleShow_success() throws Exception {
        LocalDateTime start = LocalDateTime.now().plusDays(1).withHour(18).withMinute(0);
        LocalDateTime end = start.plusMinutes(180);

        ShowCreateRequest request = ShowCreateRequest.builder()
                .movieId(testMovie.getId())
                .screenId(testScreen.getId())
                .startTime(start)
                .endTime(end)
                .showFormat("IMAX")
                .surcharge(50.0)
                .build();

        mockMvc.perform(post("/api/shows")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.showFormat").value("IMAX"))
                .andExpect(jsonPath("$.availableSeats.length()").value(3));

        List<ShowSeat> generatedSeats = showSeatRepository.findAll();
        assertThat(generatedSeats).hasSize(3);
        // Surcharge 50 added to base 250 = 300
        assertThat(generatedSeats.get(0).getPrice()).isEqualTo(300.0);
    }

    @Test
    @DisplayName("Prevent overlapping show on the same screen")
    void scheduleShow_overlap_fails() throws Exception {
        LocalDateTime start1 = LocalDateTime.now().plusDays(1).withHour(14).withMinute(0);
        LocalDateTime end1 = start1.plusMinutes(150);

        showService.scheduleShow(ShowCreateRequest.builder()
                .movieId(testMovie.getId())
                .screenId(testScreen.getId())
                .startTime(start1)
                .endTime(end1)
                .build());

        // Attempt overlapping show starting at 15:00 (inside 14:00 - 16:30)
        ShowCreateRequest conflictRequest = ShowCreateRequest.builder()
                .movieId(testMovie.getId())
                .screenId(testScreen.getId())
                .startTime(start1.plusHours(1))
                .endTime(start1.plusHours(3))
                .build();

        mockMvc.perform(post("/api/shows")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(conflictRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("is already occupied by another show")));
    }

    @Test
    @DisplayName("Lock seats atomically, verify conflict on duplicate lock, and unlock successfully")
    void lockAndUnlockSeatsFlow() throws Exception {
        LocalDateTime start = LocalDateTime.now().plusDays(2).withHour(19).withMinute(0);
        ShowDto show = showService.scheduleShow(ShowCreateRequest.builder()
                .movieId(testMovie.getId())
                .screenId(testScreen.getId())
                .startTime(start)
                .endTime(start.plusHours(3))
                .build());

        List<ShowSeat> showSeats = showSeatRepository.findByShowId(show.getId());
        List<Long> targetSeatIds = List.of(showSeats.get(0).getId(), showSeats.get(1).getId());

        SeatLockRequest lockRequest = SeatLockRequest.builder()
                .showId(show.getId())
                .seatIds(targetSeatIds)
                .lockDurationMinutes(5)
                .build();

        // 1. First lock succeeds
        String responseStr = mockMvc.perform(post("/api/shows/" + show.getId() + "/lock")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(lockRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.lockToken").exists())
                .andExpect(jsonPath("$.lockedSeatIds.length()").value(2))
                .andReturn().getResponse().getContentAsString();

        SeatLockResponse lockResponse = objectMapper.readValue(responseStr, SeatLockResponse.class);
        assertThat(lockResponse.getLockToken()).isNotBlank();

        // 2. Second user attempting to lock the same seats fails with 400
        SeatLockRequest conflictRequest = SeatLockRequest.builder()
                .showId(show.getId())
                .seatIds(List.of(targetSeatIds.get(0)))
                .build();

        mockMvc.perform(post("/api/shows/" + show.getId() + "/lock")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(conflictRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("is currently unavailable or locked")));

        // 3. User unlocks seats with valid token
        SeatUnlockRequest unlockRequest = SeatUnlockRequest.builder()
                .showId(show.getId())
                .lockToken(lockResponse.getLockToken())
                .seatIds(targetSeatIds)
                .build();

        mockMvc.perform(post("/api/shows/" + show.getId() + "/unlock")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(unlockRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Seats unlocked successfully"));

        // 4. Seats are available again!
        List<ShowSeat> refreshedSeats = showSeatRepository.findByShowId(show.getId());
        assertThat(refreshedSeats.get(0).getStatus()).isEqualTo("AVAILABLE");
        assertThat(refreshedSeats.get(0).getLockToken()).isNull();
    }
}
