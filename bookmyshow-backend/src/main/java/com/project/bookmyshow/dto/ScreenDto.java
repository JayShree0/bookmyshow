package com.project.bookmyshow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScreenDto {

    private Long id;
    private String name;
    private Integer totalSeats;
    private String format;
    private Boolean active;
    private TheaterDto theater;
    private List<SeatDto> seats;

    public ScreenDto(Long id, String name, Integer totalSeats, TheaterDto theater) {
        this.id = id;
        this.name = name;
        this.totalSeats = totalSeats;
        this.theater = theater;
        this.format = "2D";
        this.active = true;
    }
}
