package com.project.bookmyshow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShowDto {

    private Long id;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String showFormat;
    private String status;
    private Double surcharge;
    private MovieDto movie;
    private ScreenDto screen;
    private List<ShowSeatDto> availableSeats;

    public ShowDto(Long id, LocalDateTime startTime, LocalDateTime endTime, MovieDto movie, ScreenDto screen, List<ShowSeatDto> availableSeats) {
        this.id = id;
        this.startTime = startTime;
        this.endTime = endTime;
        this.movie = movie;
        this.screen = screen;
        this.availableSeats = availableSeats;
        this.showFormat = "2D";
        this.status = "SCHEDULED";
        this.surcharge = 0.0;
    }
}
