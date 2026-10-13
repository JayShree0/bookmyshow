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
public class SeatLockResponse {

    private String lockToken;
    private Long showId;
    private List<Long> lockedSeatIds;
    private LocalDateTime lockExpiresAt;
    private Long remainingSeconds;
    private String message;
}

