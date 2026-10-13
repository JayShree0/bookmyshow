package com.project.bookmyshow.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "coupons")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code; // e.g. "SUPER50", "FLAT100"

    private String description;

    @Column(nullable = false)
    @Builder.Default
    private String discountType = "PERCENTAGE"; // PERCENTAGE or FLAT

    @Column(nullable = false)
    private Double discountValue; // 20.0 for 20%, or 100.0 for Rs.100

    private Double maxDiscountAmount; // e.g. 150.0 cap for percentage

    @Builder.Default
    private Double minOrderAmount = 0.0; // Minimum booking amount required

    private LocalDateTime validFrom;
    private LocalDateTime validUntil;

    @Builder.Default
    private Integer usageLimit = 1000;

    @Builder.Default
    private Integer timesUsed = 0;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    public boolean isValid(Double orderAmount, LocalDateTime now) {
        if (!Boolean.TRUE.equals(this.active)) {
            return false;
        }
        if (this.validFrom != null && this.validFrom.isAfter(now)) {
            return false;
        }
        if (this.validUntil != null && this.validUntil.isBefore(now)) {
            return false;
        }
        if (this.usageLimit != null && this.timesUsed != null && this.timesUsed >= this.usageLimit) {
            return false;
        }
        if (this.minOrderAmount != null && orderAmount < this.minOrderAmount) {
            return false;
        }
        return true;
    }

    public double calculateDiscount(Double orderAmount) {
        if (orderAmount == null || orderAmount <= 0.0) {
            return 0.0;
        }
        double discount = 0.0;
        if ("FLAT".equalsIgnoreCase(this.discountType)) {
            discount = Math.min(this.discountValue, orderAmount);
        } else {
            // PERCENTAGE
            discount = (orderAmount * this.discountValue) / 100.0;
            if (this.maxDiscountAmount != null && this.maxDiscountAmount > 0) {
                discount = Math.min(discount, this.maxDiscountAmount);
            }
        }
        return Math.round(discount * 100.0) / 100.0;
    }
}

