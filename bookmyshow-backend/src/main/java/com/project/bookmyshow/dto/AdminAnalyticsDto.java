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
public class AdminAnalyticsDto {

    private Double grossBookingValue; // Total confirmed bookings amount
    private Double netRevenue;         // GBV minus refunds
    private Double totalRefundAmount;
    private Long totalConfirmedBookings;
    private Long totalCancelledBookings;
    private Long totalTicketsIssued;
    private Double overallOccupancyPercentage;
    private List<MovieRevenueStat> topGrossingMovies;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MovieRevenueStat {
        private Long movieId;
        private String movieTitle;
        private Double totalRevenue;
        private Long totalBookings;
    }
}

