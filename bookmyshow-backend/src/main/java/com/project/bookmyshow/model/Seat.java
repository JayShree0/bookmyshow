package com.project.bookmyshow.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@Table(name = "seats", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"screen_id", "seatNumber"})
})
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Seat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String seatNumber; // e.g. "A1", "A2", "B1"

    private String rowName; // e.g. "A", "B"
    private Integer colNumber; // e.g. 1, 2, 3

    @Column(nullable = false)
    @Builder.Default
    private String seatType = "STANDARD"; // STANDARD, PREMIUM, RECLINER

    @Column(nullable = false)
    @Builder.Default
    private String basePrice = "200.0";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "screen_id", nullable = false)
    private Screen screen;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    @Column(name = "is_accessible", nullable = false)
    @Builder.Default
    private Boolean accessible = false;

    public Double getNumericBasePrice() {
        try {
            return Double.parseDouble(this.basePrice);
        } catch (Exception e) {
            return 200.0;
        }
    }
}
