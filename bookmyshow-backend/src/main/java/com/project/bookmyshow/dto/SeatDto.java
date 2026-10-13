package com.project.bookmyshow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeatDto {

    private Long id;
    private String seatNumber;
    private String seatType;
    private String basePrice;
    private String rowName;
    private Integer colNumber;
    private Boolean active;
    private Boolean accessible;

    public SeatDto(Long id, String seatNumber, String seatType, String basePrice) {
        this.id = id;
        this.seatNumber = seatNumber;
        this.seatType = seatType;
        this.basePrice = basePrice;
        this.active = true;
        this.accessible = false;
    }
}
