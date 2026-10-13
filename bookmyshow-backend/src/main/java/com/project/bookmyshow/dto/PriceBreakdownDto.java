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
public class PriceBreakdownDto {

    private int seatCount;
    private Double baseAmount;
    private Double convenienceFee;
    private Double taxAmount; // e.g., 18% GST on convenience fee
    private Double discountAmount;
    private String couponCode;
    private Double totalAmount;
    private List<SeatPriceItem> seatPrices;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SeatPriceItem {
        private Long showSeatId;
        private String seatNumber;
        private String seatType;
        private Double price;
    }
}

