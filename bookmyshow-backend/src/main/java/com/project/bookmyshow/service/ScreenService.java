package com.project.bookmyshow.service;

import com.project.bookmyshow.dto.ScreenCreateRequest;
import com.project.bookmyshow.dto.ScreenDto;
import com.project.bookmyshow.dto.SeatDto;
import com.project.bookmyshow.dto.TheaterDto;
import com.project.bookmyshow.exception.ResourceNotFoundException;
import com.project.bookmyshow.model.Screen;
import com.project.bookmyshow.model.Seat;
import com.project.bookmyshow.model.Theater;
import com.project.bookmyshow.repository.ScreenRepository;
import com.project.bookmyshow.repository.SeatRepository;
import com.project.bookmyshow.repository.TheaterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ScreenService {

    @Autowired
    private ScreenRepository screenRepository;

    @Autowired
    private TheaterRepository theaterRepository;

    @Autowired
    private SeatRepository seatRepository;

    @Autowired
    private TheaterService theaterService;

    @Transactional
    public ScreenDto createScreenWithLayout(Long theaterId, ScreenCreateRequest request) {
        Theater theater = theaterRepository.findById(theaterId)
                .orElseThrow(() -> new ResourceNotFoundException("Theater not found with id: " + theaterId));

        Screen screen = Screen.builder()
                .name(request.getName())
                .format(request.getFormat() != null ? request.getFormat().toUpperCase() : "2D")
                .theater(theater)
                .active(true)
                .build();

        Screen savedScreen = screenRepository.save(screen);

        List<Seat> generatedSeats = new ArrayList<>();
        char currentRow = 'A';

        // 1. Generate Standard Seats
        for (int r = 0; r < request.getStandardRows(); r++) {
            String rowName = String.valueOf(currentRow++);
            for (int c = 1; c <= request.getSeatsPerRow(); c++) {
                generatedSeats.add(Seat.builder()
                        .seatNumber(rowName + c)
                        .rowName(rowName)
                        .colNumber(c)
                        .seatType("STANDARD")
                        .basePrice(String.valueOf(request.getStandardPrice()))
                        .screen(savedScreen)
                        .active(true)
                        .accessible(r == 0 && (c == 1 || c == request.getSeatsPerRow())) // aisle accessible
                        .build());
            }
        }

        // 2. Generate Premium Seats
        for (int r = 0; r < request.getPremiumRows(); r++) {
            String rowName = String.valueOf(currentRow++);
            for (int c = 1; c <= request.getSeatsPerRow(); c++) {
                generatedSeats.add(Seat.builder()
                        .seatNumber(rowName + c)
                        .rowName(rowName)
                        .colNumber(c)
                        .seatType("PREMIUM")
                        .basePrice(String.valueOf(request.getPremiumPrice()))
                        .screen(savedScreen)
                        .active(true)
                        .accessible(false)
                        .build());
            }
        }

        // 3. Generate Recliner Seats
        for (int r = 0; r < request.getReclinerRows(); r++) {
            String rowName = String.valueOf(currentRow++);
            for (int c = 1; c <= request.getSeatsPerRow(); c++) {
                generatedSeats.add(Seat.builder()
                        .seatNumber(rowName + c)
                        .rowName(rowName)
                        .colNumber(c)
                        .seatType("RECLINER")
                        .basePrice(String.valueOf(request.getReclinerPrice()))
                        .screen(savedScreen)
                        .active(true)
                        .accessible(false)
                        .build());
            }
        }

        List<Seat> savedSeats = seatRepository.saveAll(generatedSeats);
        savedScreen.setTotalSeats(savedSeats.size());
        savedScreen.setSeats(savedSeats);
        screenRepository.save(savedScreen);

        return mapToDto(savedScreen, savedSeats);
    }

    public ScreenDto getScreenById(Long id) {
        Screen screen = screenRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Screen not found with id: " + id));
        List<Seat> seats = seatRepository.findByScreenIdAndActiveTrue(screen.getId());
        return mapToDto(screen, seats);
    }

    public List<ScreenDto> getScreensByTheater(Long theaterId) {
        List<Screen> screens = screenRepository.findByTheaterId(theaterId);
        return screens.stream()
                .map(screen -> {
                    List<Seat> seats = seatRepository.findByScreenIdAndActiveTrue(screen.getId());
                    return mapToDto(screen, seats);
                })
                .collect(Collectors.toList());
    }

    public void deleteScreen(Long id) {
        Screen screen = screenRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Screen not found with id: " + id));
        screen.setActive(false);
        screenRepository.save(screen);
    }

    private ScreenDto mapToDto(Screen screen, List<Seat> seats) {
        TheaterDto theaterDto = screen.getTheater() != null ? theaterService.mapToDto(screen.getTheater()) : null;

        List<SeatDto> seatDtos = seats != null ? seats.stream()
                .map(seat -> SeatDto.builder()
                        .id(seat.getId())
                        .seatNumber(seat.getSeatNumber())
                        .rowName(seat.getRowName())
                        .colNumber(seat.getColNumber())
                        .seatType(seat.getSeatType())
                        .basePrice(seat.getBasePrice())
                        .active(seat.getActive())
                        .accessible(seat.getAccessible())
                        .build())
                .collect(Collectors.toList()) : new ArrayList<>();

        return ScreenDto.builder()
                .id(screen.getId())
                .name(screen.getName())
                .format(screen.getFormat())
                .totalSeats(screen.getTotalSeats())
                .active(screen.getActive())
                .theater(theaterDto)
                .seats(seatDtos)
                .build();
    }
}
