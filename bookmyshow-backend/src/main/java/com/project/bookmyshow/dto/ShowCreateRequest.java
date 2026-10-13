package com.project.bookmyshow.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShowCreateRequest {

    @NotNull(message = "Movie ID is required")
    private Long movieId;

    @NotNull(message = "Screen ID is required")
    private Long screenId;

    @NotNull(message = "Start time is required")
    private LocalDateTime startTime;

    // Optional end time (auto-calculated from movie duration + 15 min buffer if null)
    private LocalDateTime endTime;

    @Builder.Default
    private String showFormat = "2D"; // 2D, 3D, IMAX, 4DX

    @Builder.Default
    private Double surcharge = 0.0;
}

