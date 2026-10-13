package com.project.bookmyshow.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScreenCreateRequest {

    @NotBlank(message = "Screen name is required")
    private String name;

    @Builder.Default
    private String format = "2D"; // 2D, 3D, IMAX, 4DX

    // Automated seat layout generator parameters
    @Min(value = 1, message = "At least 1 standard row is required")
    @Builder.Default
    private int standardRows = 5; // Rows A, B, C, D, E

    @Builder.Default
    private int premiumRows = 3;  // Rows F, G, H

    @Builder.Default
    private int reclinerRows = 1; // Row I

    @Min(value = 1, message = "At least 1 column per row is required")
    @Builder.Default
    private int seatsPerRow = 10; // 1 to 10

    @Builder.Default
    private Double standardPrice = 180.0;

    @Builder.Default
    private Double premiumPrice = 280.0;

    @Builder.Default
    private Double reclinerPrice = 450.0;
}

