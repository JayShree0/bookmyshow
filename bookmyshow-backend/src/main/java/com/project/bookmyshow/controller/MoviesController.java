package com.project.bookmyshow.controller;

import com.project.bookmyshow.dto.MovieDto;
import com.project.bookmyshow.service.MovieService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/movies")
public class MoviesController {

    @Autowired
    private MovieService movieService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MovieDto> createMovie(@Valid @RequestBody MovieDto movieDto) {
        return new ResponseEntity<>(movieService.createMovie(movieDto), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MovieDto> getMovieById(@PathVariable Long id) {
        return ResponseEntity.ok(movieService.getMovieById(id));
    }

    @GetMapping
    public ResponseEntity<List<MovieDto>> getAllMovies() {
        return ResponseEntity.ok(movieService.getAllMovies());
    }

    @GetMapping("/search")
    public ResponseEntity<List<MovieDto>> searchMovie(@RequestParam String title) {
        return ResponseEntity.ok(movieService.searchMovie(title));
    }

    @GetMapping("/city/{city}")
    public ResponseEntity<List<MovieDto>> getMoviesByCity(@PathVariable String city) {
        return ResponseEntity.ok(movieService.getMoviesByCity(city));
    }

    @GetMapping("/language/{language}")
    public ResponseEntity<List<MovieDto>> getMoviesByLanguage(@PathVariable String language) {
        return ResponseEntity.ok(movieService.getMovieByLanguage(language));
    }

    @GetMapping("/genre/{genre}")
    public ResponseEntity<List<MovieDto>> getMoviesByGenre(@PathVariable String genre) {
        return ResponseEntity.ok(movieService.getMovieByGenre(genre));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<MovieDto>> getMoviesByStatus(@PathVariable String status) {
        return ResponseEntity.ok(movieService.getMoviesByStatus(status));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MovieDto> updateMovie(@PathVariable Long id, @Valid @RequestBody MovieDto movieDto) {
        return ResponseEntity.ok(movieService.updateMovie(id, movieDto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteMovie(@PathVariable Long id) {
        movieService.deleteMovie(id);
        return ResponseEntity.noContent().build();
    }
}
