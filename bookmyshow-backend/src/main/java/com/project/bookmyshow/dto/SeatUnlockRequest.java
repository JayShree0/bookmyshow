package com.project.bookmyshow.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
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
public class SeatUnlockRequest {

    private Long showId;

    @NotBlank(message = "Lock token is required")
    @JsonAlias({"lockSessionId", "token"})
    private String lockToken;

    @NotEmpty(message = "At least one seat must be specified")
    @JsonAlias({"showSeatIds", "selectedSeats"})
    private List<Long> seatIds;
}

