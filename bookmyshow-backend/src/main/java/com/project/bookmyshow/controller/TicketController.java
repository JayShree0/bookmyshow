package com.project.bookmyshow.controller;

import com.project.bookmyshow.dto.TicketDto;
import com.project.bookmyshow.exception.BadRequestException;
import com.project.bookmyshow.model.User;
import com.project.bookmyshow.repository.UserRepository;
import com.project.bookmyshow.service.TicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    @Autowired
    private TicketService ticketService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/{ticketNumber}")
    public ResponseEntity<TicketDto> getTicketByNumber(@PathVariable String ticketNumber) {
        return ResponseEntity.ok(ticketService.getTicketByNumber(ticketNumber));
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<List<TicketDto>> getTicketsByBooking(@PathVariable Long bookingId) {
        return ResponseEntity.ok(ticketService.getTicketsByBooking(bookingId));
    }

    @PostMapping("/check-in")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPPORT')")
    public ResponseEntity<TicketDto> checkInTicket(
            @RequestBody Map<String, String> request,
            @AuthenticationPrincipal UserDetails userDetails) {
        String tokenOrNumber = request.get("ticketNumber");
        if (tokenOrNumber == null || tokenOrNumber.isBlank()) {
            tokenOrNumber = request.get("qrPayload");
        }
        if (tokenOrNumber == null || tokenOrNumber.isBlank()) {
            throw new BadRequestException("ticketNumber or qrPayload is required");
        }

        Long staffId = null;
        if (userDetails != null) {
            staffId = userRepository.findByEmail(userDetails.getUsername()).map(User::getId).orElse(null);
        }

        return ResponseEntity.ok(ticketService.checkInTicket(tokenOrNumber, staffId));
    }
}

