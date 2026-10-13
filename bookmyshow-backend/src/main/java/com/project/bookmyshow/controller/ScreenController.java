package com.project.bookmyshow.controller;

import com.project.bookmyshow.dto.ScreenCreateRequest;
import com.project.bookmyshow.dto.ScreenDto;
import com.project.bookmyshow.service.ScreenService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/screens")
public class ScreenController {

    @Autowired
    private ScreenService screenService;

    @PostMapping("/theater/{theaterId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ScreenDto> createScreenWithLayout(
            @PathVariable Long theaterId,
            @Valid @RequestBody ScreenCreateRequest request) {
        return new ResponseEntity<>(screenService.createScreenWithLayout(theaterId, request), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ScreenDto> getScreenById(@PathVariable Long id) {
        return ResponseEntity.ok(screenService.getScreenById(id));
    }

    @GetMapping("/theater/{theaterId}")
    public ResponseEntity<List<ScreenDto>> getScreensByTheater(@PathVariable Long theaterId) {
        return ResponseEntity.ok(screenService.getScreensByTheater(theaterId));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteScreen(@PathVariable Long id) {
        screenService.deleteScreen(id);
        return ResponseEntity.noContent().build();
    }
}

