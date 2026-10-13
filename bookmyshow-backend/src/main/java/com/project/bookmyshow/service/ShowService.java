package com.project.bookmyshow.service;

import com.project.bookmyshow.dto.*;
import com.project.bookmyshow.exception.BadRequestException;
import com.project.bookmyshow.exception.ResourceNotFoundException;
import com.project.bookmyshow.model.Movie;
import com.project.bookmyshow.model.Screen;
import com.project.bookmyshow.model.Seat;
import com.project.bookmyshow.model.Show;
import com.project.bookmyshow.model.ShowSeat;
import com.project.bookmyshow.repository.MovieRepository;
import com.project.bookmyshow.repository.ScreenRepository;
import com.project.bookmyshow.repository.SeatRepository;
import com.project.bookmyshow.repository.ShowRepository;
import com.project.bookmyshow.repository.ShowSeatRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ShowService {

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private ScreenRepository screenRepository;

    @Autowired
    private SeatRepository seatRepository;

    @Autowired
    private ShowRepository showRepository;

    @Autowired
    private ShowSeatRepository showSeatRepository;

    /**
     * Schedules a show with screen conflict validation and automatic ShowSeat inventory creation.
     */
    @Transactional
    public ShowDto scheduleShow(ShowCreateRequest request) {
        Movie movie = movieRepository.findById(request.getMovieId())
                .orElseThrow(() -> new ResourceNotFoundException("Movie not found with id: " + request.getMovieId()));

        Screen screen = screenRepository.findById(request.getScreenId())
                .orElseThrow(() -> new ResourceNotFoundException("Screen not found with id: " + request.getScreenId()));

        LocalDateTime startTime = request.getStartTime();
        LocalDateTime endTime = request.getEndTime();

        if (endTime == null) {
            int durationMins = movie.getDurationMins() != null ? movie.getDurationMins() : 120;
            // Add 15 minutes intermission and cleanup buffer
            endTime = startTime.plusMinutes(durationMins + 15);
        }

        if (!endTime.isAfter(startTime)) {
            throw new BadRequestException("Show end time must be after start time");
        }

        // Screen overlap validation
        List<Show> overlaps = showRepository.findOverlappingShows(screen.getId(), startTime, endTime, null);
        if (!overlaps.isEmpty()) {
            throw new BadRequestException("Screen '" + screen.getName() + "' is already occupied by another show during this time slot (" +
                    startTime + " to " + endTime + ")");
        }

        Show show = Show.builder()
                .movie(movie)
                .screen(screen)
                .startTime(startTime)
                .endTime(endTime)
                .showFormat(request.getShowFormat() != null ? request.getShowFormat() : "2D")
                .surcharge(request.getSurcharge() != null ? request.getSurcharge() : 0.0)
                .status("SCHEDULED")
                .active(true)
                .build();

        Show savedShow = showRepository.save(show);

        // Auto-generate ShowSeat inventory from physical Screen seats
        List<Seat> physicalSeats = seatRepository.findByScreenIdAndActiveTrue(screen.getId());
        if (physicalSeats.isEmpty()) {
            physicalSeats = seatRepository.findByScreenId(screen.getId());
        }

        List<ShowSeat> showSeats = new ArrayList<>();
        for (Seat physicalSeat : physicalSeats) {
            double finalSeatPrice = physicalSeat.getNumericBasePrice() + (savedShow.getSurcharge() != null ? savedShow.getSurcharge() : 0.0);
            ShowSeat showSeat = ShowSeat.builder()
                    .show(savedShow)
                    .seat(physicalSeat)
                    .status("AVAILABLE")
                    .price(finalSeatPrice)
                    .build();
            showSeats.add(showSeat);
        }

        if (!showSeats.isEmpty()) {
            showSeatRepository.saveAll(showSeats);
        }

        return mapToDto(savedShow, showSeats);
    }

    /**
     * Backward-compatible show creation method.
     */
    @Transactional
    public ShowDto createShow(ShowDto showDto) {
        ShowCreateRequest request = ShowCreateRequest.builder()
                .movieId(showDto.getMovie() != null ? showDto.getMovie().getId() : null)
                .screenId(showDto.getScreen() != null ? showDto.getScreen().getId() : null)
                .startTime(showDto.getStartTime())
                .endTime(showDto.getEndTime())
                .showFormat(showDto.getShowFormat())
                .surcharge(showDto.getSurcharge())
                .build();
        return scheduleShow(request);
    }

    public ShowDto getShowById(Long id) {
        Show show = showRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Show not found with id: " + id));

        List<ShowSeat> seats = showSeatRepository.findByShowId(show.getId());
        LocalDateTime now = LocalDateTime.now();

        // Dynamically compute effective status for locked seats that have expired
        seats.forEach(seat -> {
            if ("LOCKED".equalsIgnoreCase(seat.getStatus()) && seat.isAvailable(now)) {
                seat.setStatus("AVAILABLE");
            }
        });

        return mapToDto(show, seats);
    }

    public List<ShowSeatDto> getShowSeatingLayout(Long showId) {
        Show show = showRepository.findById(showId)
                .orElseThrow(() -> new ResourceNotFoundException("Show not found with id: " + showId));

        List<ShowSeat> seats = showSeatRepository.findByShowId(show.getId());
        LocalDateTime now = LocalDateTime.now();

        return seats.stream().map(seat -> {
            String effectiveStatus = seat.getStatus();
            if ("LOCKED".equalsIgnoreCase(effectiveStatus) && seat.isAvailable(now)) {
                effectiveStatus = "AVAILABLE";
            }

            ShowSeatDto dto = new ShowSeatDto();
            dto.setId(seat.getId());
            dto.setStatus(effectiveStatus);
            dto.setPrice(seat.getPrice());

            Seat base = seat.getSeat();
            SeatDto seatDto = SeatDto.builder()
                    .id(base.getId())
                    .seatNumber(base.getSeatNumber())
                    .rowName(base.getRowName())
                    .colNumber(base.getColNumber())
                    .seatType(base.getSeatType())
                    .basePrice(base.getBasePrice())
                    .active(base.getActive())
                    .accessible(base.getAccessible())
                    .build();
            dto.setSeat(seatDto);
            return dto;
        }).collect(Collectors.toList());
    }

    public List<ShowDto> getAllShows() {
        return showRepository.findAll().stream()
                .filter(Show::getActive)
                .map(show -> {
                    List<ShowSeat> availableSeats = showSeatRepository.findByShowIdAndStatus(show.getId(), "AVAILABLE");
                    return mapToDto(show, availableSeats);
                })
                .collect(Collectors.toList());
    }

    public List<ShowDto> getShowsByMovie(Long movieId) {
        return showRepository.findByMovieId(movieId).stream()
                .filter(Show::getActive)
                .map(show -> {
                    List<ShowSeat> availableSeats = showSeatRepository.findByShowIdAndStatus(show.getId(), "AVAILABLE");
                    return mapToDto(show, availableSeats);
                })
                .collect(Collectors.toList());
    }

    public List<ShowDto> getShowByMovieAndCity(Long movieId, String city) {
        return showRepository.findByMovie_IdAndScreen_Theater_City(movieId, city).stream()
                .filter(Show::getActive)
                .map(show -> {
                    List<ShowSeat> availableSeats = showSeatRepository.findByShowIdAndStatus(show.getId(), "AVAILABLE");
                    return mapToDto(show, availableSeats);
                })
                .collect(Collectors.toList());
    }

    public List<ShowDto> getShowByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return showRepository.findByStartTimeBetween(startDate, endDate).stream()
                .filter(Show::getActive)
                .map(show -> {
                    List<ShowSeat> availableSeats = showSeatRepository.findByShowIdAndStatus(show.getId(), "AVAILABLE");
                    return mapToDto(show, availableSeats);
                })
                .collect(Collectors.toList());
    }

    public List<ShowDto> searchShows(Long movieId, String city, LocalDate date, String showFormat, String language) {
        List<Show> allShows;
        if (movieId != null && city != null && !city.isBlank()) {
            allShows = showRepository.findFutureShowsByMovieAndCity(movieId, city, LocalDateTime.now());
        } else if (movieId != null) {
            allShows = showRepository.findByMovieId(movieId);
        } else {
            allShows = showRepository.findAll();
        }

        return allShows.stream()
                .filter(Show::getActive)
                .filter(show -> !"CANCELLED".equalsIgnoreCase(show.getStatus()))
                .filter(show -> {
                    if (city != null && !city.isBlank()) {
                        String theaterCity = show.getScreen().getTheater().getCity();
                        if (theaterCity == null || !theaterCity.equalsIgnoreCase(city)) return false;
                    }
                    if (date != null) {
                        if (!show.getStartTime().toLocalDate().isEqual(date)) return false;
                    }
                    if (showFormat != null && !showFormat.isBlank()) {
                        if (!showFormat.equalsIgnoreCase(show.getShowFormat())) return false;
                    }
                    if (language != null && !language.isBlank()) {
                        String movieLang = show.getMovie().getLanguage();
                        if (movieLang == null || !movieLang.equalsIgnoreCase(language)) return false;
                    }
                    return true;
                })
                .map(show -> {
                    List<ShowSeat> availableSeats = showSeatRepository.findByShowIdAndStatus(show.getId(), "AVAILABLE");
                    return mapToDto(show, availableSeats);
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public ShowDto cancelShow(Long showId) {
        Show show = showRepository.findById(showId)
                .orElseThrow(() -> new ResourceNotFoundException("Show not found with id: " + showId));

        show.setStatus("CANCELLED");
        show.setActive(false);
        Show savedShow = showRepository.save(show);

        // Release any active locks
        List<ShowSeat> seats = showSeatRepository.findByShowId(showId);
        seats.forEach(seat -> {
            if ("LOCKED".equalsIgnoreCase(seat.getStatus())) {
                seat.releaseLock();
            }
        });
        showSeatRepository.saveAll(seats);

        return mapToDto(savedShow, seats);
    }

    private ShowDto mapToDto(Show show, List<ShowSeat> seats) {
        ShowDto showDto = new ShowDto();
        showDto.setId(show.getId());
        showDto.setStartTime(show.getStartTime());
        showDto.setEndTime(show.getEndTime());
        showDto.setShowFormat(show.getShowFormat());
        showDto.setStatus(show.getStatus());
        showDto.setSurcharge(show.getSurcharge());

        showDto.setMovie(new MovieDto(
                show.getMovie().getId(),
                show.getMovie().getTitle(),
                show.getMovie().getDescription(),
                show.getMovie().getLanguage(),
                show.getMovie().getGenre(),
                show.getMovie().getDurationMins(),
                show.getMovie().getReleaseDate(),
                show.getMovie().getPosterUrl()
        ));

        TheaterDto theaterDto = new TheaterDto(
                show.getScreen().getTheater().getId(),
                show.getScreen().getTheater().getName(),
                show.getScreen().getTheater().getAddress(),
                show.getScreen().getTheater().getCity(),
                show.getScreen().getTheater().getTotalScreens()
        );

        showDto.setScreen(new ScreenDto(
                show.getScreen().getId(),
                show.getScreen().getName(),
                show.getScreen().getTotalSeats(),
                theaterDto
        ));

        if (seats != null) {
            List<ShowSeatDto> seatDtos = seats.stream()
                    .map(seat -> {
                        ShowSeatDto seatDto = new ShowSeatDto();
                        seatDto.setId(seat.getId());
                        seatDto.setStatus(seat.getStatus());
                        seatDto.setPrice(seat.getPrice());

                        Seat base = seat.getSeat();
                        SeatDto baseSeatDto = SeatDto.builder()
                                .id(base.getId())
                                .seatNumber(base.getSeatNumber())
                                .rowName(base.getRowName())
                                .colNumber(base.getColNumber())
                                .seatType(base.getSeatType())
                                .basePrice(base.getBasePrice())
                                .active(base.getActive())
                                .accessible(base.getAccessible())
                                .build();
                        seatDto.setSeat(baseSeatDto);
                        return seatDto;
                    })
                    .collect(Collectors.toList());
            showDto.setAvailableSeats(seatDtos);
        }

        return showDto;
    }
}
