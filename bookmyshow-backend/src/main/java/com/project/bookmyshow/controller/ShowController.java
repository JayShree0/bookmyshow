package com.project.bookmyshow.controller;

import com.project.bookmyshow.dto.ShowCreateRequest;
import com.project.bookmyshow.dto.ShowDto;
import com.project.bookmyshow.dto.ShowSeatDto;
import com.project.bookmyshow.service.ShowService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/shows")
public class ShowController {

    @Autowired
    private ShowService showService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ShowDto> scheduleShow(@Valid @RequestBody ShowCreateRequest request) {
        return new ResponseEntity<>(showService.scheduleShow(request), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ShowDto> getShowById(@PathVariable Long id) {
        return ResponseEntity.ok(showService.getShowById(id));
    }

    @GetMapping("/{id}/seats")
    public ResponseEntity<List<ShowSeatDto>> getShowSeatingLayout(@PathVariable Long id) {
        return ResponseEntity.ok(showService.getShowSeatingLayout(id));
    }

    @GetMapping
    public ResponseEntity<List<ShowDto>> searchShows(
            @RequestParam(required = false) Long movieId,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) String format,
            @RequestParam(required = false) String language) {
        return ResponseEntity.ok(showService.searchShows(movieId, city, date, format, language));
    }

    @GetMapping("/movie/{movieId}")
    public ResponseEntity<List<ShowDto>> getShowsByMovie(@PathVariable Long movieId) {
        return ResponseEntity.ok(showService.getShowsByMovie(movieId));
    }

    @GetMapping("/movie/{movieId}/city/{city}")
    public ResponseEntity<List<ShowDto>> getShowsByMovieAndCity(
            @PathVariable Long movieId,
            @PathVariable String city) {
        return ResponseEntity.ok(showService.getShowByMovieAndCity(movieId, city));
    }

    @GetMapping("/range")
    public ResponseEntity<List<ShowDto>> getShowsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(showService.getShowByDateRange(start, end));
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ShowDto> cancelShow(@PathVariable Long id) {
        return ResponseEntity.ok(showService.cancelShow(id));
    }
}

