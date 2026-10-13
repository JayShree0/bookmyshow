package com.project.bookmyshow.config;

import com.project.bookmyshow.dto.ShowCreateRequest;
import com.project.bookmyshow.model.*;
import com.project.bookmyshow.repository.*;
import com.project.bookmyshow.service.ShowService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CityRepository cityRepository;

    @Autowired
    private TheaterRepository theaterRepository;

    @Autowired
    private ScreenRepository screenRepository;

    @Autowired
    private SeatRepository seatRepository;

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private CouponRepository couponRepository;

    @Autowired
    private ShowService showService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        log.info("Checking if database seeding is required...");

        if (movieRepository.count() > 0) {
            log.info("Database already seeded with {} movies. Skipping initialization.", movieRepository.count());
            return;
        }

        log.info("Starting initial seed data population...");

        // 1. Seed Users
        seedUsers();

        // 2. Seed Cities
        seedCities();

        // 3. Seed Theaters, Screens & Physical Seats
        List<Screen> createdScreens = seedTheatersAndScreens();

        // 4. Seed Movies
        List<Movie> createdMovies = seedMovies();

        // 5. Seed Shows & ShowSeat Inventory
        seedShows(createdMovies, createdScreens);

        // 6. Seed Promotional Coupons
        seedCoupons();

        log.info("Seed data population successfully completed!");
    }

    private void seedUsers() {
        if (userRepository.count() == 0) {
            User admin = User.builder()
                    .name("BookMyShow Admin")
                    .email("admin@bookmyshow.com")
                    .password(passwordEncoder.encode("Admin@123"))
                    .phoneNumber("9999999999")
                    .role(Role.ROLE_ADMIN)
                    .enabled(true)
                    .emailVerified(true)
                    .build();

            User demoUser = User.builder()
                    .name("Rohan Sharma")
                    .email("rohan.sharma@example.com")
                    .password(passwordEncoder.encode("password123"))
                    .phoneNumber("9876543210")
                    .role(Role.ROLE_CUSTOMER)
                    .enabled(true)
                    .emailVerified(true)
                    .build();

            User demoUser2 = User.builder()
                    .name("Priya Patel")
                    .email("priya.patel@example.com")
                    .password(passwordEncoder.encode("password123"))
                    .phoneNumber("9876543211")
                    .role(Role.ROLE_CUSTOMER)
                    .enabled(true)
                    .emailVerified(true)
                    .build();

            userRepository.saveAll(List.of(admin, demoUser, demoUser2));
            log.info("Seeded 3 initial users.");
        }
    }

    private void seedCities() {
        if (cityRepository.count() == 0) {
            List<City> cities = List.of(
                    City.builder().name("Mumbai").state("Maharashtra").active(true).build(),
                    City.builder().name("Delhi-NCR").state("National Capital Region").active(true).build(),
                    City.builder().name("Bengaluru").state("Karnataka").active(true).build(),
                    City.builder().name("Hyderabad").state("Telangana").active(true).build(),
                    City.builder().name("Chandigarh").state("Punjab / Haryana").active(true).build(),
                    City.builder().name("Pune").state("Maharashtra").active(true).build()
            );
            cityRepository.saveAll(cities);
            log.info("Seeded 6 cities.");
        }
    }

    private List<Screen> seedTheatersAndScreens() {
        List<Screen> allScreens = new ArrayList<>();

        // Mumbai Theaters
        Theater pvrMumbai = Theater.builder()
                .name("PVR ICON — Infinity Mall, Versova")
                .address("4th Floor, Infinity Mall, Link Road, Versova, Mumbai - 400053")
                .city("Mumbai")
                .totalScreens(3)
                .active(true)
                .build();
        pvrMumbai = theaterRepository.save(pvrMumbai);

        Theater inoxMumbai = Theater.builder()
                .name("INOX Megaplex — Inorbit Mall, Malad")
                .address("3rd Floor, Inorbit Mall, New Link Road, Malad West, Mumbai - 400064")
                .city("Mumbai")
                .totalScreens(2)
                .active(true)
                .build();
        inoxMumbai = theaterRepository.save(inoxMumbai);

        Theater cinepolisMumbai = Theater.builder()
                .name("Cinepolis Grand Plaza — Fun Republic, Andheri")
                .address("Fun Republic Mall, Shah Industrial Estate, Off Veera Desai Road, Mumbai - 400053")
                .city("Mumbai")
                .totalScreens(2)
                .active(true)
                .build();
        cinepolisMumbai = theaterRepository.save(cinepolisMumbai);

        // Delhi Theaters
        Theater pvrDelhi = Theater.builder()
                .name("PVR Director's Cut — Ambience Mall, Vasant Kunj")
                .address("Ambience Mall, Nelson Mandela Marg, Vasant Kunj, New Delhi - 110070")
                .city("Delhi-NCR")
                .totalScreens(2)
                .active(true)
                .build();
        pvrDelhi = theaterRepository.save(pvrDelhi);

        // Bengaluru Theaters
        Theater pvrBlr = Theater.builder()
                .name("PVR Superplex — Forum Mall, Koramangala")
                .address("The Forum Mall, Hosur Road, Koramangala, Bengaluru - 560095")
                .city("Bengaluru")
                .totalScreens(2)
                .active(true)
                .build();
        pvrBlr = theaterRepository.save(pvrBlr);

        // Hyderabad Theaters
        Theater prasadsHyd = Theater.builder()
                .name("Prasads Multiplex — Necklace Road")
                .address("NTR Gardens, Khairatabad, Hyderabad - 500004")
                .city("Hyderabad")
                .totalScreens(2)
                .active(true)
                .build();
        prasadsHyd = theaterRepository.save(prasadsHyd);

        // Screens for PVR Mumbai
        allScreens.add(createScreenWithSeats(pvrMumbai, "Audi 1 (Dolby 7.1)", "2D"));
        allScreens.add(createScreenWithSeats(pvrMumbai, "Audi 2 (Dolby Atmos)", "3D"));
        allScreens.add(createScreenWithSeats(pvrMumbai, "Audi 3 (IMAX Laser)", "IMAX"));

        // Screens for INOX Mumbai
        allScreens.add(createScreenWithSeats(inoxMumbai, "Audi 1 (Dolby Atmos)", "2D"));
        allScreens.add(createScreenWithSeats(inoxMumbai, "Audi 2 (4DX Motion)", "4DX"));

        // Screens for Cinepolis Mumbai
        allScreens.add(createScreenWithSeats(cinepolisMumbai, "Audi 1 (Dolby 7.1)", "2D"));
        allScreens.add(createScreenWithSeats(cinepolisMumbai, "Audi 2 (RealD 3D)", "3D"));

        // Screens for other cities
        allScreens.add(createScreenWithSeats(pvrDelhi, "Audi 1 (IMAX)", "IMAX"));
        allScreens.add(createScreenWithSeats(pvrDelhi, "Audi 2 (Dolby Atmos)", "2D"));

        allScreens.add(createScreenWithSeats(pvrBlr, "Audi 1 (Dolby Atmos)", "2D"));
        allScreens.add(createScreenWithSeats(pvrBlr, "Audi 2 (IMAX 3D)", "IMAX"));

        allScreens.add(createScreenWithSeats(prasadsHyd, "Audi 1 (Large Screen)", "2D"));
        allScreens.add(createScreenWithSeats(prasadsHyd, "Audi 2 (IMAX)", "IMAX"));

        log.info("Seeded 6 theaters and {} screens with full seat layouts.", allScreens.size());
        return allScreens;
    }

    private Screen createScreenWithSeats(Theater theater, String screenName, String format) {
        Screen screen = Screen.builder()
                .name(screenName)
                .format(format)
                .theater(theater)
                .active(true)
                .totalSeats(64) // 8 rows x 8 cols = 64 seats
                .build();
        screen = screenRepository.save(screen);

        List<Seat> seats = new ArrayList<>();
        String[] rows = {"A", "B", "C", "D", "E", "F", "G", "H"};

        for (String row : rows) {
            String tier = "STANDARD";
            String price = "180.0";

            if (row.equals("A") || row.equals("B")) {
                tier = "RECLINER";
                price = "450.0";
            } else if (row.equals("C") || row.equals("D") || row.equals("E")) {
                tier = "PREMIUM";
                price = "280.0";
            }

            for (int col = 1; col <= 8; col++) {
                Seat seat = Seat.builder()
                        .seatNumber(row + col)
                        .rowName(row)
                        .colNumber(col)
                        .seatType(tier)
                        .basePrice(price)
                        .screen(screen)
                        .active(true)
                        .accessible(row.equals("H") && col <= 2)
                        .build();
                seats.add(seat);
            }
        }

        seatRepository.saveAll(seats);
        return screen;
    }

    private List<Movie> seedMovies() {
        List<Movie> movies = new ArrayList<>();

        movies.add(Movie.builder()
                .title("Dune: Part Two")
                .description("Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe, he endeavors to prevent a terrible future only he can foresee.")
                .language("English, Hindi, Tamil, Telugu")
                .genre("Sci-Fi, Action, Drama")
                .durationMins(166)
                .releaseDate("2024-03-01")
                .certificate("UA")
                .rating(9.1)
                .totalRatings(28450)
                .status("NOW_SHOWING")
                .posterUrl("https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80")
                .trailerUrl("https://www.youtube.com/embed/Way9Dexny3w")
                .active(true)
                .build());

        movies.add(Movie.builder()
                .title("Kalki 2898 AD")
                .description("Set in a post-apocalyptic world in the year 2898 AD, the film follows a perilous mission to protect laboratory subject SUM-80, the pregnant mother of Kalki, the prophesied tenth avatar of Hindu deity Vishnu.")
                .language("Telugu, Hindi, Tamil, English")
                .genre("Sci-Fi, Action, Thriller")
                .durationMins(181)
                .releaseDate("2024-06-27")
                .certificate("UA")
                .rating(8.8)
                .totalRatings(41200)
                .status("NOW_SHOWING")
                .posterUrl("https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=800&q=80")
                .trailerUrl("https://www.youtube.com/embed/kQDd1AhGIHk")
                .active(true)
                .build());

        movies.add(Movie.builder()
                .title("Deadpool & Wolverine")
                .description("A listless Wade Wilson toils away in civilian life with his days as the morally flexible mercenary Deadpool behind him. But when his homeworld faces an existential threat, Wade must reluctantly suit up again with an even more reluctant Wolverine.")
                .language("English, Hindi, Telugu")
                .genre("Action, Comedy, Sci-Fi")
                .durationMins(128)
                .releaseDate("2024-07-26")
                .certificate("A")
                .rating(8.9)
                .totalRatings(32000)
                .status("NOW_SHOWING")
                .posterUrl("https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=800&q=80")
                .trailerUrl("https://www.youtube.com/embed/73_1biulkYk")
                .active(true)
                .build());

        movies.add(Movie.builder()
                .title("Oppenheimer")
                .description("The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.")
                .language("English, Hindi")
                .genre("Drama, History, Thriller")
                .durationMins(180)
                .releaseDate("2023-07-21")
                .certificate("A")
                .rating(9.3)
                .totalRatings(55000)
                .status("NOW_SHOWING")
                .posterUrl("https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=800&q=80")
                .trailerUrl("https://www.youtube.com/embed/uYPbbksJxIg")
                .active(true)
                .build());

        movies.add(Movie.builder()
                .title("Stree 2")
                .description("After the events of Stree, the town of Chanderi is being haunted again. This time, women are mysteriously abducted by a headless entity called Sarkata.")
                .language("Hindi")
                .genre("Comedy, Horror")
                .durationMins(147)
                .releaseDate("2024-08-15")
                .certificate("UA")
                .rating(8.5)
                .totalRatings(19000)
                .status("NOW_SHOWING")
                .posterUrl("https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80")
                .trailerUrl("https://www.youtube.com/embed/KVnhe0keWj0")
                .active(true)
                .build());

        movies.add(Movie.builder()
                .title("Interstellar")
                .description("When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft along with a team of researchers to find a new planet for humans.")
                .language("English, Hindi")
                .genre("Sci-Fi, Adventure, Drama")
                .durationMins(169)
                .releaseDate("2014-11-07")
                .certificate("UA")
                .rating(9.2)
                .totalRatings(68000)
                .status("NOW_SHOWING")
                .posterUrl("https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80")
                .trailerUrl("https://www.youtube.com/embed/zSWdZVtXT7E")
                .active(true)
                .build());

        List<Movie> savedMovies = movieRepository.saveAll(movies);
        log.info("Seeded {} movies.", savedMovies.size());
        return savedMovies;
    }

    private void seedShows(List<Movie> movies, List<Screen> screens) {
        LocalTime[] slotTimes = {
                LocalTime.of(10, 30),
                LocalTime.of(13, 45),
                LocalTime.of(17, 15),
                LocalTime.of(20, 45)
        };

        LocalDate today = LocalDate.now();
        int showCount = 0;

        for (int dayOffset = 0; dayOffset < 5; dayOffset++) {
            LocalDate date = today.plusDays(dayOffset);

            for (int i = 0; i < screens.size(); i++) {
                Screen screen = screens.get(i);
                Movie movie = movies.get(i % movies.size());

                for (LocalTime slotTime : slotTimes) {
                    LocalDateTime startTime = LocalDateTime.of(date, slotTime);

                    // Skip past showtimes for today
                    if (startTime.isBefore(LocalDateTime.now())) {
                        continue;
                    }

                    int duration = movie.getDurationMins() != null ? movie.getDurationMins() : 120;
                    LocalDateTime endTime = startTime.plusMinutes(duration + 15);

                    ShowCreateRequest req = ShowCreateRequest.builder()
                            .movieId(movie.getId())
                            .screenId(screen.getId())
                            .startTime(startTime)
                            .endTime(endTime)
                            .showFormat(screen.getFormat() != null ? screen.getFormat() : "2D")
                            .surcharge(screen.getFormat().equalsIgnoreCase("IMAX") ? 100.0 : (screen.getFormat().equalsIgnoreCase("3D") ? 50.0 : 0.0))
                            .build();

                    try {
                        showService.scheduleShow(req);
                        showCount++;
                    } catch (Exception e) {
                        log.debug("Skipping show creation slot: {}", e.getMessage());
                    }
                }
            }
        }

        log.info("Scheduled {} shows with full seat inventories across 5 days.", showCount);
    }

    private void seedCoupons() {
        if (couponRepository.count() == 0) {
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime expiry = now.plusYears(1);

            List<Coupon> coupons = List.of(
                    Coupon.builder()
                            .code("BMS50")
                            .description("Flat ₹50 off on total booking value above ₹300")
                            .discountType("FLAT")
                            .discountValue(50.0)
                            .maxDiscountAmount(50.0)
                            .minOrderAmount(300.0)
                            .validFrom(now)
                            .validUntil(expiry)
                            .active(true)
                            .build(),
                    Coupon.builder()
                            .code("MOVIEBUFF")
                            .description("Get 15% off up to ₹150 on tickets and snacks on orders above ₹500")
                            .discountType("PERCENTAGE")
                            .discountValue(15.0)
                            .maxDiscountAmount(150.0)
                            .minOrderAmount(500.0)
                            .validFrom(now)
                            .validUntil(expiry)
                            .active(true)
                            .build(),
                    Coupon.builder()
                            .code("SNACK10")
                            .description("Save 10% on popcorn, nachos, and drinks up to ₹100")
                            .discountType("PERCENTAGE")
                            .discountValue(10.0)
                            .maxDiscountAmount(100.0)
                            .minOrderAmount(200.0)
                            .validFrom(now)
                            .validUntil(expiry)
                            .active(true)
                            .build(),
                    Coupon.builder()
                            .code("FIRSTSHOW")
                            .description("Enjoy ₹100 off on premium bookings above ₹600")
                            .discountType("FLAT")
                            .discountValue(100.0)
                            .maxDiscountAmount(100.0)
                            .minOrderAmount(600.0)
                            .validFrom(now)
                            .validUntil(expiry)
                            .active(true)
                            .build()
            );

            couponRepository.saveAll(coupons);
            log.info("Seeded 4 promotional coupons.");
        }
    }
}

