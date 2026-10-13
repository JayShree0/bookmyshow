package com.project.bookmyshow.service;

import com.project.bookmyshow.dto.PriceBreakdownDto;
import com.project.bookmyshow.exception.BadRequestException;
import com.project.bookmyshow.model.Coupon;
import com.project.bookmyshow.model.ShowSeat;
import com.project.bookmyshow.repository.CouponRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class PricingService {

    @Autowired
    private CouponRepository couponRepository;

    @Value("${app.pricing.convenience-fee-per-ticket:30.0}")
    private double convenienceFeePerTicket;

    @Value("${app.pricing.tax-rate:0.18}")
    private double taxRate; // 18% GST

    public PriceBreakdownDto calculatePrice(List<ShowSeat> seats, String couponCode) {
        if (seats == null || seats.isEmpty()) {
            throw new BadRequestException("At least one seat must be selected to calculate pricing");
        }

        double baseAmount = 0.0;
        List<PriceBreakdownDto.SeatPriceItem> seatPriceItems = new ArrayList<>();

        for (ShowSeat seat : seats) {
            double price = seat.getPrice() != null ? seat.getPrice() : 0.0;
            baseAmount += price;

            String seatNum = (seat.getSeat() != null) ? seat.getSeat().getSeatNumber() : String.valueOf(seat.getId());
            String seatType = (seat.getSeat() != null) ? seat.getSeat().getSeatType() : "STANDARD";

            seatPriceItems.add(PriceBreakdownDto.SeatPriceItem.builder()
                    .showSeatId(seat.getId())
                    .seatNumber(seatNum)
                    .seatType(seatType)
                    .price(price)
                    .build());
        }

        // Convenience fee & Tax calculations
        double convenienceFee = Math.round(convenienceFeePerTicket * seats.size() * 100.0) / 100.0;
        double taxAmount = Math.round((convenienceFee * taxRate) * 100.0) / 100.0;

        // Discount calculation
        double discountAmount = 0.0;
        String appliedCouponCode = null;

        if (couponCode != null && !couponCode.trim().isEmpty()) {
            String trimmedCode = couponCode.trim();
            Coupon coupon = couponRepository.findByCodeIgnoreCase(trimmedCode)
                    .orElseThrow(() -> new BadRequestException("Invalid coupon code: " + trimmedCode));

            if (!coupon.isValid(baseAmount, LocalDateTime.now())) {
                throw new BadRequestException("Coupon '" + trimmedCode + "' is expired, exhausted, or minimum order requirement not met");
            }

            discountAmount = coupon.calculateDiscount(baseAmount);
            appliedCouponCode = coupon.getCode();
        }

        double totalAmount = Math.max(0.0, baseAmount + convenienceFee + taxAmount - discountAmount);
        totalAmount = Math.round(totalAmount * 100.0) / 100.0;

        return PriceBreakdownDto.builder()
                .seatCount(seats.size())
                .baseAmount(Math.round(baseAmount * 100.0) / 100.0)
                .convenienceFee(convenienceFee)
                .taxAmount(taxAmount)
                .discountAmount(discountAmount)
                .couponCode(appliedCouponCode)
                .totalAmount(totalAmount)
                .seatPrices(seatPriceItems)
                .build();
    }
}

