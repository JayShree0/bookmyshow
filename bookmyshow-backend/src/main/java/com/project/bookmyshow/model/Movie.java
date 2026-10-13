package com.project.bookmyshow.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Entity
@Table(name = "movies")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Movie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    @Column(nullable = false)
    private String language;

    @Column(nullable = false)
    private String genre;

    @Column(nullable = false)
    private Integer durationMins;

    private String releaseDate;
    private String posterUrl;
    private String trailerUrl;

    @Builder.Default
    private String certificate = "UA"; // U, UA, A

    @Column(nullable = false)
    @Builder.Default
    private String status = "NOW_SHOWING"; // UPCOMING, NOW_SHOWING, ENDED

    @Builder.Default
    private Double rating = 0.0;

    @Builder.Default
    private Integer totalRatings = 0;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    @OneToMany(mappedBy = "movie", cascade = CascadeType.ALL)
    private List<Show> show;
}
