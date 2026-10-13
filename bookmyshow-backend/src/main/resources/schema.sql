-- ========================================================================
-- BookMyShow Production Database Schema (MySQL 8.0+)
-- ========================================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'ROLE_CUSTOMER',
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    account_non_locked BOOLEAN NOT NULL DEFAULT TRUE,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (email),
    INDEX idx_user_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Refresh Tokens Table
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expiry_date DATETIME NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_refreshtoken_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_refreshtoken_user (user_id),
    INDEX idx_refreshtoken_token (token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Cities Table
CREATE TABLE IF NOT EXISTS cities (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    INDEX idx_city_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Theaters Table
CREATE TABLE IF NOT EXISTS theaters (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(500) NOT NULL,
    city VARCHAR(100) NOT NULL,
    total_screens INT NOT NULL DEFAULT 1,
    latitude DOUBLE,
    longitude DOUBLE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    INDEX idx_theater_city (city)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Screens Table
CREATE TABLE IF NOT EXISTS screens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    total_seats INT NOT NULL,
    format VARCHAR(50) NOT NULL DEFAULT '2D',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    theater_id BIGINT NOT NULL,
    CONSTRAINT fk_screen_theater FOREIGN KEY (theater_id) REFERENCES theaters(id) ON DELETE CASCADE,
    INDEX idx_screen_theater (theater_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Seats Table
CREATE TABLE IF NOT EXISTS seats (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    seat_number VARCHAR(50) NOT NULL,
    row_name VARCHAR(10),
    col_number INT,
    seat_type VARCHAR(50) NOT NULL DEFAULT 'STANDARD',
    base_price VARCHAR(50) NOT NULL DEFAULT '200.0',
    screen_id BIGINT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    accessible BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT uq_seat_screen_number UNIQUE (screen_id, seat_number),
    CONSTRAINT fk_seat_screen FOREIGN KEY (screen_id) REFERENCES screens(id) ON DELETE CASCADE,
    INDEX idx_seat_screen (screen_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Movies Table
CREATE TABLE IF NOT EXISTS movies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    language VARCHAR(100) NOT NULL,
    genre VARCHAR(100) NOT NULL,
    duration_mins INT,
    release_date DATE,
    poster_url VARCHAR(1000),
    trailer_url VARCHAR(1000),
    rating DOUBLE DEFAULT 0.0,
    total_ratings INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'NOW_SHOWING',
    certificate VARCHAR(20) DEFAULT 'UA',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    INDEX idx_movie_title (title),
    INDEX idx_movie_genre (genre),
    INDEX idx_movie_lang (language),
    INDEX idx_movie_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Shows Table
CREATE TABLE IF NOT EXISTS shows (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    show_format VARCHAR(50) NOT NULL DEFAULT '2D',
    status VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED',
    surcharge DOUBLE DEFAULT 0.0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    movie_id BIGINT NOT NULL,
    screen_id BIGINT NOT NULL,
    CONSTRAINT fk_show_movie FOREIGN KEY (movie_id) REFERENCES movies(id),
    CONSTRAINT fk_show_screen FOREIGN KEY (screen_id) REFERENCES screens(id),
    INDEX idx_show_movie (movie_id),
    INDEX idx_show_screen (screen_id),
    INDEX idx_show_start_time (start_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    transaction_id VARCHAR(255) NOT NULL UNIQUE,
    order_id VARCHAR(255),
    payment_gateway VARCHAR(50) NOT NULL DEFAULT 'MOCK',
    amount DOUBLE NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    payment_time DATETIME NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'INITIATED',
    gateway_payment_id VARCHAR(255),
    gateway_signature VARCHAR(500),
    failure_reason VARCHAR(500),
    refund_id VARCHAR(255),
    refund_amount DOUBLE,
    refunded_at DATETIME,
    INDEX idx_payment_txn (transaction_id),
    INDEX idx_payment_order (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_number VARCHAR(255) NOT NULL UNIQUE,
    booking_time DATETIME NOT NULL,
    user_id BIGINT NOT NULL,
    show_id BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING_PAYMENT',
    total_amount DOUBLE NOT NULL,
    base_amount DOUBLE,
    convenience_fee DOUBLE,
    tax_amount DOUBLE,
    discount_amount DOUBLE,
    coupon_code VARCHAR(100),
    idempotency_key VARCHAR(255) UNIQUE,
    lock_token VARCHAR(255),
    cancelled_at DATETIME,
    cancellation_reason VARCHAR(500),
    refund_amount DOUBLE,
    payment_id BIGINT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_booking_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_booking_show FOREIGN KEY (show_id) REFERENCES shows(id),
    CONSTRAINT fk_booking_payment FOREIGN KEY (payment_id) REFERENCES payments(id),
    INDEX idx_booking_user (user_id),
    INDEX idx_booking_show (show_id),
    INDEX idx_booking_number (booking_number),
    INDEX idx_booking_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Show Seats Table (Inventory + Atomic Concurrency Locking)
CREATE TABLE IF NOT EXISTS show_seats (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    show_id BIGINT NOT NULL,
    seat_id BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE',
    price DOUBLE NOT NULL,
    booking_id BIGINT,
    lock_token VARCHAR(255),
    locked_by_user_id BIGINT,
    locked_at DATETIME,
    lock_expires_at DATETIME,
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT uq_show_seat UNIQUE (show_id, seat_id),
    CONSTRAINT fk_showseat_show FOREIGN KEY (show_id) REFERENCES shows(id) ON DELETE CASCADE,
    CONSTRAINT fk_showseat_seat FOREIGN KEY (seat_id) REFERENCES seats(id) ON DELETE CASCADE,
    CONSTRAINT fk_showseat_booking FOREIGN KEY (booking_id) REFERENCES bookings(id),
    INDEX idx_showseat_show_status (show_id, status),
    INDEX idx_showseat_booking (booking_id),
    INDEX idx_showseat_lock_expiry (status, lock_expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Coupons Table
CREATE TABLE IF NOT EXISTS coupons (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    discount_type VARCHAR(50) NOT NULL DEFAULT 'PERCENTAGE',
    discount_value DOUBLE NOT NULL,
    max_discount_amount DOUBLE,
    min_order_amount DOUBLE DEFAULT 0.0,
    valid_from DATETIME,
    valid_until DATETIME,
    usage_limit INT DEFAULT 1000,
    times_used INT DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    INDEX idx_coupon_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Tickets Table
CREATE TABLE IF NOT EXISTS tickets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ticket_number VARCHAR(255) NOT NULL UNIQUE,
    qr_code_data VARCHAR(1000) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ISSUED',
    seat_numbers VARCHAR(500) NOT NULL,
    issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    checked_in_at DATETIME,
    checked_in_by_staff_id BIGINT,
    booking_id BIGINT NOT NULL,
    CONSTRAINT fk_ticket_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    INDEX idx_ticket_number (ticket_number),
    INDEX idx_ticket_booking (booking_id),
    INDEX idx_ticket_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. Movie Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    movie_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    rating INT NOT NULL,
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_review_user_movie UNIQUE (user_id, movie_id),
    CONSTRAINT fk_review_movie FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
    CONSTRAINT fk_review_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_review_movie (movie_id),
    INDEX idx_review_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. User Watchlist Table
CREATE TABLE IF NOT EXISTS watchlists (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    movie_id BIGINT NOT NULL,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_watchlist_user_movie UNIQUE (user_id, movie_id),
    CONSTRAINT fk_watchlist_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_watchlist_movie FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
    INDEX idx_watchlist_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. Notification Records Table
CREATE TABLE IF NOT EXISTS notification_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recipient VARCHAR(255) NOT NULL,
    channel VARCHAR(50) NOT NULL DEFAULT 'EMAIL',
    type VARCHAR(100) NOT NULL,
    subject VARCHAR(255),
    message TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'SENT',
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_notif_recipient (recipient),
    INDEX idx_notif_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

