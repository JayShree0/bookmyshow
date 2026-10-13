package com.project.bookmyshow.service;

import com.project.bookmyshow.dto.AdminAnalyticsDto;
import com.project.bookmyshow.model.Booking;
import com.project.bookmyshow.model.Movie;
import com.project.bookmyshow.repository.BookingRepository;
import com.project.bookmyshow.repository.ShowSeatRepository;
import com.project.bookmyshow.repository.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminAnalyticsService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ShowSeatRepository showSeatRepository;

    @Autowired
    private TicketRepository ticketRepository;

    public AdminAnalyticsDto getDashboardAnalytics() {
        List<Booking> allBookings = bookingRepository.findAll();

        double gbv = 0.0;
        double totalRefunds = 0.0;
        long confirmedCount = 0;
        long cancelledCount = 0;

        Map<Long, Double> movieRevenueMap = new HashMap<>();
        Map<Long, Long> movieBookingCountMap = new HashMap<>();
        Map<Long, String> movieTitleMap = new HashMap<>();

        for (Booking b : allBookings) {
            if ("CONFIRMED".equalsIgnoreCase(b.getStatus())) {
                confirmedCount++;
                double amt = b.getTotalAmount() != null ? b.getTotalAmount() : 0.0;
                gbv += amt;

                if (b.getShow() != null && b.getShow().getMovie() != null) {
                    Movie m = b.getShow().getMovie();
                    movieRevenueMap.put(m.getId(), movieRevenueMap.getOrDefault(m.getId(), 0.0) + amt);
                    movieBookingCountMap.put(m.getId(), movieBookingCountMap.getOrDefault(m.getId(), 0L) + 1);
                    movieTitleMap.put(m.getId(), m.getTitle());
                }
            } else if ("CANCELLED".equalsIgnoreCase(b.getStatus())) {
                cancelledCount++;
                if (b.getRefundAmount() != null) {
                    totalRefunds += b.getRefundAmount();
                } else if (b.getTotalAmount() != null) {
                    totalRefunds += b.getTotalAmount();
                }
            }
        }

        double netRevenue = Math.max(0.0, gbv - totalRefunds);

        long totalSeats = showSeatRepository.count();
        long bookedSeats = showSeatRepository.countByStatus("BOOKED");
        double occupancyRate = (totalSeats > 0) ? (bookedSeats * 100.0) / totalSeats : 0.0;

        List<AdminAnalyticsDto.MovieRevenueStat> topMovies = movieRevenueMap.entrySet().stream()
                .sorted(Map.Entry.<Long, Double>comparingByValue().reversed())
                .limit(5)
                .map(entry -> AdminAnalyticsDto.MovieRevenueStat.builder()
                        .movieId(entry.getKey())
                        .movieTitle(movieTitleMap.get(entry.getKey()))
                        .totalRevenue(Math.round(entry.getValue() * 100.0) / 100.0)
                        .totalBookings(movieBookingCountMap.getOrDefault(entry.getKey(), 0L))
                        .build())
                .collect(Collectors.toList());

        return AdminAnalyticsDto.builder()
                .grossBookingValue(Math.round(gbv * 100.0) / 100.0)
                .netRevenue(Math.round(netRevenue * 100.0) / 100.0)
                .totalRefundAmount(Math.round(totalRefunds * 100.0) / 100.0)
                .totalConfirmedBookings(confirmedCount)
                .totalCancelledBookings(cancelledCount)
                .totalTicketsIssued(ticketRepository.count())
                .overallOccupancyPercentage(Math.round(occupancyRate * 10.0) / 10.0)
                .topGrossingMovies(topMovies)
                .build();
    }
}

