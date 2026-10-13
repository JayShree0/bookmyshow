package com.project.bookmyshow.service;

import com.project.bookmyshow.dto.TicketDto;
import com.project.bookmyshow.exception.BadRequestException;
import com.project.bookmyshow.exception.ResourceNotFoundException;
import com.project.bookmyshow.model.Booking;
import com.project.bookmyshow.model.ShowSeat;
import com.project.bookmyshow.model.Ticket;
import com.project.bookmyshow.repository.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TicketService {

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private QrCodeService qrCodeService;

    @Transactional
    public Ticket generateTicket(Booking booking, List<ShowSeat> seats) {
        String seatNumbers = seats.stream()
                .map(s -> (s.getSeat() != null) ? s.getSeat().getSeatNumber() : String.valueOf(s.getId()))
                .sorted()
                .collect(Collectors.joining(", "));

        String ticketNumber = "TKT-" + booking.getShow().getId() + "-" +
                UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();

        String qrPayload = qrCodeService.generateQrPayload(
                ticketNumber,
                booking.getShow().getId(),
                booking.getBookingNumber()
        );

        Ticket ticket = Ticket.builder()
                .ticketNumber(ticketNumber)
                .qrCodeData(qrPayload)
                .booking(booking)
                .status("ISSUED")
                .seatNumbers(seatNumbers)
                .issuedAt(LocalDateTime.now())
                .build();

        return ticketRepository.save(ticket);
    }

    public TicketDto getTicketByNumber(String ticketNumber) {
        Ticket ticket = ticketRepository.findByTicketNumber(ticketNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with number: " + ticketNumber));
        return mapToDto(ticket);
    }

    public List<TicketDto> getTicketsByBooking(Long bookingId) {
        return ticketRepository.findByBookingId(bookingId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public TicketDto checkInTicket(String ticketNumberOrQr, Long staffId) {
        Ticket ticket = ticketRepository.findByTicketNumber(ticketNumberOrQr)
                .or(() -> ticketRepository.findByQrCodeData(ticketNumberOrQr))
                .orElseThrow(() -> new ResourceNotFoundException("Valid ticket not found for scan: " + ticketNumberOrQr));

        if ("CANCELLED".equalsIgnoreCase(ticket.getStatus())) {
            throw new BadRequestException("Ticket is CANCELLED and cannot be used for admission");
        }

        if ("CHECKED_IN".equalsIgnoreCase(ticket.getStatus())) {
            throw new BadRequestException("Ticket " + ticket.getTicketNumber() + " was already checked in at " + ticket.getCheckedInAt());
        }

        ticket.setStatus("CHECKED_IN");
        ticket.setCheckedInAt(LocalDateTime.now());
        ticket.setCheckedInByStaffId(staffId);

        Ticket saved = ticketRepository.save(ticket);
        return mapToDto(saved);
    }

    public TicketDto mapToDto(Ticket ticket) {
        Booking booking = ticket.getBooking();
        TicketDto.TicketDtoBuilder builder = TicketDto.builder()
                .id(ticket.getId())
                .ticketNumber(ticket.getTicketNumber())
                .qrCodeData(ticket.getQrCodeData())
                .status(ticket.getStatus())
                .seatNumbers(ticket.getSeatNumbers())
                .issuedAt(ticket.getIssuedAt())
                .checkedInAt(ticket.getCheckedInAt())
                .bookingId(booking.getId())
                .bookingNumber(booking.getBookingNumber());

        if (booking.getShow() != null) {
            builder.showStartTime(booking.getShow().getStartTime());
            if (booking.getShow().getMovie() != null) {
                builder.movieTitle(booking.getShow().getMovie().getTitle());
            }
            if (booking.getShow().getScreen() != null) {
                builder.screenName(booking.getShow().getScreen().getName());
                if (booking.getShow().getScreen().getTheater() != null) {
                    builder.theaterName(booking.getShow().getScreen().getTheater().getName());
                }
            }
        }

        return builder.build();
    }
}

