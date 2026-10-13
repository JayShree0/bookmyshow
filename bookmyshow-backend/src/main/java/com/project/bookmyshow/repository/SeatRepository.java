package com.project.bookmyshow.repository;

import com.project.bookmyshow.model.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SeatRepository extends JpaRepository<Seat, Long> {

    List<Seat> findByScreenId(Long screenId);

    List<Seat> findByScreenIdAndActiveTrue(Long screenId);

    Optional<Seat> findByScreenIdAndSeatNumber(Long screenId, String seatNumber);
}

