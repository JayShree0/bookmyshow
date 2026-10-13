package com.project.bookmyshow.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingRequestDto {

    private Long userId;

    @NotNull(message = "Show ID is required")
    private Long showId;

    @NotEmpty(message = "At least one seat must be selected")
    @JsonAlias({"showSeatIds", "selectedSeats"})
    private List<Long> seatIds;

    private String lockToken;

    @Builder.Default
    private String paymentMethod = "MOCK";

    @Builder.Default
    private String paymentGateway = "MOCK";

    private String couponCode;

    private String idempotencyKey;

    public BookingRequestDto(Long userId, Long showId, List<Long> seatIds, String paymentMethod) {
        this.userId = userId;
        this.showId = showId;
        this.seatIds = seatIds;
        this.paymentMethod = paymentMethod;
        this.paymentGateway = "MOCK";
    }
}
