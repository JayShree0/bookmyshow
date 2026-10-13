package com.project.bookmyshow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketDto {

    private Long id;
    private String ticketNumber;
    private String qrCodeData;
    private String status;
    private String seatNumbers;
    private LocalDateTime issuedAt;
    private LocalDateTime checkedInAt;
    private Long bookingId;
    private String bookingNumber;
    private String movieTitle;
    private String theaterName;
    private String screenName;
    private LocalDateTime showStartTime;
}

