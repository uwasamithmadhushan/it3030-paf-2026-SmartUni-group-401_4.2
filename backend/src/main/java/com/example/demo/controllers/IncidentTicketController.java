package com.example.demo.controllers;

import com.example.demo.dto.*;
import com.example.demo.models.User;
import com.example.demo.services.IncidentTicketService;
import com.example.demo.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class IncidentTicketController {

    private final IncidentTicketService ticketService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<TicketResponse>> getTickets(Principal principal) {
        User user = userService.findUserByUsername(principal.getName());
        return ResponseEntity.ok(ticketService.getTickets(user));
    }

    @PostMapping
    public ResponseEntity<TicketResponse> createTicket(@RequestBody TicketRequest request, Principal principal) {
        User user = userService.findUserByUsername(principal.getName());
        return ResponseEntity.ok(ticketService.createTicket(request, user.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketResponse> getTicket(@PathVariable String id, Principal principal) {
        User user = userService.findUserByUsername(principal.getName());
        return ResponseEntity.ok(ticketService.getTicketById(id, user));
    }

    @PutMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TicketResponse> assignTechnician(
            @PathVariable String id, 
            @RequestBody AssignmentRequest request) {
        return ResponseEntity.ok(ticketService.assignTechnician(id, request.getTechnicianId()));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public ResponseEntity<TicketResponse> updateStatus(
            @PathVariable String id, 
            @RequestBody StatusUpdateRequest request,
            Principal principal) {
        User user = userService.findUserByUsername(principal.getName());
        return ResponseEntity.ok(ticketService.updateStatus(id, request, user.getId()));
    }
}
