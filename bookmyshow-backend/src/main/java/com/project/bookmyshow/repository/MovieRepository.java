package com.project.bookmyshow.repository;

import com.project.bookmyshow.model.Movie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MovieRepository extends JpaRepository<Movie, Long> {

    List<Movie> findByLanguage(String language);

    List<Movie> findByGenre(String genre);

    List<Movie> findByTitleContaining(String title);

    List<Movie> findByTitleContainingIgnoreCase(String title);

    List<Movie> findByLanguageIgnoreCase(String language);

    List<Movie> findByGenreIgnoreCase(String genre);

    List<Movie> findByStatus(String status);

    List<Movie> findByActiveTrue();

    @Query("SELECT DISTINCT s.movie FROM Show s WHERE LOWER(s.screen.theater.city) = LOWER(:city) AND s.startTime >= :currentTime AND s.movie.active = true")
    List<Movie> findMoviesRunningInCity(@Param("city") String city, @Param("currentTime") LocalDateTime currentTime);
}