package com.project.bookmyshow.repository;

import com.project.bookmyshow.model.ShowSeat;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ShowSeatRepository extends JpaRepository<ShowSeat, Long> {

    List<ShowSeat> findByShowId(Long showId);

    List<ShowSeat> findByShowIdAndStatus(Long showId, String status);

    List<ShowSeat> findByBookingId(Long bookingId);

    Optional<ShowSeat> findByShowIdAndSeatId(Long showId, Long seatId);

    long countByStatus(String status);

    // Pessimistic write locking for atomic concurrency control during seat locking
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM ShowSeat s WHERE s.id IN :ids")
    List<ShowSeat> findAllByIdForUpdate(@Param("ids") List<Long> ids);

    // Expired locks query for background cleanup
    @Query("SELECT s FROM ShowSeat s WHERE s.status = 'LOCKED' AND s.lockExpiresAt < :now")
    List<ShowSeat> findExpiredLocks(@Param("now") LocalDateTime now);
}
