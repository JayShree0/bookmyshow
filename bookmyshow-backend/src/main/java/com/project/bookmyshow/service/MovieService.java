package com.project.bookmyshow.service;

import com.project.bookmyshow.dto.MovieDto;
import com.project.bookmyshow.exception.ResourceNotFoundException;
import com.project.bookmyshow.model.Movie;
import com.project.bookmyshow.repository.MovieRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MovieService {

    @Autowired
    private MovieRepository movieRepository;

    public MovieDto createMovie(MovieDto movieDto) {
        Movie movie = mapToEntity(movieDto);
        Movie saveMovie = movieRepository.save(movie);
        return mapToDto(saveMovie);
    }

    public MovieDto getMovieById(Long id) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Movie Not Found with id : " + id));
        return mapToDto(movie);
    }

    public List<MovieDto> getAllMovies() {
        List<Movie> movies = movieRepository.findByActiveTrue();
        return movies.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<MovieDto> getMovieByLanguage(String language) {
        List<Movie> movies = movieRepository.findByLanguageIgnoreCase(language);
        return movies.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<MovieDto> getMovieByGenre(String genre) {
        List<Movie> movies = movieRepository.findByGenreIgnoreCase(genre);
        return movies.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<MovieDto> searchMovie(String title) {
        List<Movie> movies = movieRepository.findByTitleContainingIgnoreCase(title);
        return movies.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<MovieDto> getMoviesByCity(String city) {
        List<Movie> movies = movieRepository.findMoviesRunningInCity(city.trim().toLowerCase(), LocalDateTime.now());
        return movies.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<MovieDto> getMoviesByStatus(String status) {
        List<Movie> movies = movieRepository.findByStatus(status.toUpperCase());
        return movies.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public MovieDto updateMovie(Long id, MovieDto movieDto) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Movie not found with id : " + id));

        movie.setTitle(movieDto.getTitle());
        movie.setDescription(movieDto.getDescription());
        movie.setLanguage(movieDto.getLanguage());
        movie.setGenre(movieDto.getGenre());
        movie.setDurationMins(movieDto.getDurationMins());
        movie.setReleaseDate(movieDto.getReleaseDate());
        movie.setPosterUrl(movieDto.getPosterUrl());
        if (movieDto.getTrailerUrl() != null) movie.setTrailerUrl(movieDto.getTrailerUrl());
        if (movieDto.getCertificate() != null) movie.setCertificate(movieDto.getCertificate());
        if (movieDto.getStatus() != null) movie.setStatus(movieDto.getStatus());
        if (movieDto.getActive() != null) movie.setActive(movieDto.getActive());

        Movie updatedMovie = movieRepository.save(movie);
        return mapToDto(updatedMovie);
    }

    public void deleteMovie(Long id) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Movie not found with id : " + id));

        movie.setActive(false);
        movieRepository.save(movie);
    }

    public Movie mapToEntity(MovieDto movieDto) {
        return Movie.builder()
                .title(movieDto.getTitle())
                .description(movieDto.getDescription())
                .language(movieDto.getLanguage())
                .genre(movieDto.getGenre())
                .durationMins(movieDto.getDurationMins())
                .releaseDate(movieDto.getReleaseDate())
                .posterUrl(movieDto.getPosterUrl())
                .trailerUrl(movieDto.getTrailerUrl())
                .certificate(movieDto.getCertificate() != null ? movieDto.getCertificate() : "UA")
                .status(movieDto.getStatus() != null ? movieDto.getStatus().toUpperCase() : "NOW_SHOWING")
                .rating(movieDto.getRating() != null ? movieDto.getRating() : 0.0)
                .totalRatings(movieDto.getTotalRatings() != null ? movieDto.getTotalRatings() : 0)
                .active(movieDto.getActive() != null ? movieDto.getActive() : true)
                .build();
    }

    public MovieDto mapToDto(Movie movie) {
        return MovieDto.builder()
                .id(movie.getId())
                .title(movie.getTitle())
                .description(movie.getDescription())
                .language(movie.getLanguage())
                .genre(movie.getGenre())
                .durationMins(movie.getDurationMins())
                .releaseDate(movie.getReleaseDate())
                .posterUrl(movie.getPosterUrl())
                .trailerUrl(movie.getTrailerUrl())
                .certificate(movie.getCertificate())
                .status(movie.getStatus())
                .rating(movie.getRating())
                .totalRatings(movie.getTotalRatings())
                .active(movie.getActive())
                .build();
    }
}
