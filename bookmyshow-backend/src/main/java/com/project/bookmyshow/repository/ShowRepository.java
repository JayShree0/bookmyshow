package com.project.bookmyshow.repository;

import com.project.bookmyshow.model.Show;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ShowRepository extends JpaRepository<Show, Long> {

    List<Show> findByMovieId(Long movieId);

    List<Show> findByScreenId(Long screenId);

    List<Show> findByStartTimeBetween(LocalDateTime start, LocalDateTime end);

    List<Show> findByMovie_IdAndScreen_Theater_City(Long movieId, String city);

    // Overlap validation: Find any show on screen that overlaps with [startTime, endTime]
    @Query("SELECT s FROM Show s WHERE s.screen.id = :screenId AND s.status != 'CANCELLED' " +
            "AND s.startTime < :endTime AND s.endTime > :startTime " +
            "AND (:excludeShowId IS NULL OR s.id != :excludeShowId)")
    List<Show> findOverlappingShows(
            @Param("screenId") Long screenId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            @Param("excludeShowId") Long excludeShowId);

    // Active future shows by movie and city
    @Query("SELECT s FROM Show s WHERE s.movie.id = :movieId " +
            "AND LOWER(s.screen.theater.city) = LOWER(:city) " +
            "AND s.startTime >= :currentTime AND s.status = 'SCHEDULED' " +
            "ORDER BY s.startTime ASC")
    List<Show> findFutureShowsByMovieAndCity(
            @Param("movieId") Long movieId,
            @Param("city") String city,
            @Param("currentTime") LocalDateTime currentTime);
}
