package com.project.bookmyshow.service;

import com.project.bookmyshow.dto.MovieDto;
import com.project.bookmyshow.exception.ResourceNotFoundException;
import com.project.bookmyshow.model.Movie;
import com.project.bookmyshow.model.User;
import com.project.bookmyshow.model.Watchlist;
import com.project.bookmyshow.repository.MovieRepository;
import com.project.bookmyshow.repository.UserRepository;
import com.project.bookmyshow.repository.WatchlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class WatchlistService {

    @Autowired
    private WatchlistRepository watchlistRepository;

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public MovieDto addToWatchlist(Long movieId, Long userId) {
        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new ResourceNotFoundException("Movie not found with id: " + movieId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (watchlistRepository.findByUserIdAndMovieId(userId, movieId).isEmpty()) {
            Watchlist item = Watchlist.builder()
                    .user(user)
                    .movie(movie)
                    .build();
            watchlistRepository.save(item);
        }

        return mapToDto(movie);
    }

    @Transactional
    public void removeFromWatchlist(Long movieId, Long userId) {
        watchlistRepository.deleteByUserIdAndMovieId(userId, movieId);
    }

    public List<MovieDto> getWatchlist(Long userId) {
        return watchlistRepository.findByUserIdOrderByAddedAtDesc(userId).stream()
                .map(Watchlist::getMovie)
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private MovieDto mapToDto(Movie movie) {
        return new MovieDto(
                movie.getId(),
                movie.getTitle(),
                movie.getDescription(),
                movie.getLanguage(),
                movie.getGenre(),
                movie.getDurationMins(),
                movie.getReleaseDate(),
                movie.getPosterUrl()
        );
    }
}

