package com.project.bookmyshow.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeatLockRequest {

    private Long showId;

    @NotEmpty(message = "At least one seat must be selected")
    @JsonAlias({"showSeatIds", "selectedSeats"})
    private List<Long> seatIds;

    @Builder.Default
    private Integer lockDurationMinutes = 5;
}

