package com.project.bookmyshow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MovieDto {

    private Long id;
    private String title;
    private String description;
    private String language;
    private String genre;
    private Integer durationMins;
    private String releaseDate;
    private String posterUrl;
    private String trailerUrl;
    private String certificate;
    private String status;
    private Double rating;
    private Integer totalRatings;
    private Boolean active;

    // Existing constructor for backward compatibility with existing ShowService / mapToDto calls
    public MovieDto(Long id, String title, String description, String language, String genre,
                    Integer durationMins, String releaseDate, String posterUrl) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.language = language;
        this.genre = genre;
        this.durationMins = durationMins;
        this.releaseDate = releaseDate;
        this.posterUrl = posterUrl;
        this.certificate = "UA";
        this.status = "NOW_SHOWING";
        this.rating = 0.0;
        this.totalRatings = 0;
        this.active = true;
    }
}
