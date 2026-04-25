package com.example.demo.controllers;

import com.example.demo.dto.*;
import com.example.demo.models.User;
import com.example.demo.services.IncidentTicketService;
import com.example.demo.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import jakarta.validation.Valid;

import java.security.Principal;
import java.util.List;

/**
 * CONTROLLER CLASS: IncidentTicketController
 * This class handles all incoming HTTP requests related to support tickets.
 * It maps URL paths (endpoints) to specific service methods.
 */
@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class IncidentTicketController {

    private final IncidentTicketService ticketService;
    private final UserService userService;

    /**
     * FETCH ALL TICKETS
     * Endpoint: GET /api/tickets
     * Allows users to see a list of tickets with optional filters (status, priority, search).
     */
    @GetMapping
    public ResponseEntity<List<TicketResponse>> getTickets(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String sort,
            Principal principal) {
        User user = userService.findUserByUsername(principal.getName());
        return ResponseEntity.ok(ticketService.getTickets(user, status, priority, category, search, sort));
    }

    /**
     * FETCH LOGGED-IN USER'S TICKETS
     * Endpoint: GET /api/tickets/my
     * Returns only the tickets created by the person currently logged in.
     */
    @GetMapping("/my")
    public ResponseEntity<List<TicketResponse>> getMyTickets(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String sort,
            Principal principal) {
        User user = userService.findUserByUsername(principal.getName());
        return ResponseEntity.ok(ticketService.getMyTickets(user, status, priority, category, search, sort));
    }

    /**
     * FETCH ASSIGNED TICKETS (Technician Only)
     * Endpoint: GET /api/tickets/assigned/me
     * Returns tickets that are assigned to the logged-in technician.
     */
    @GetMapping("/assigned/me")
    @PreAuthorize("hasRole('TECHNICIAN') or hasRole('ADMIN')")
    public ResponseEntity<List<TicketResponse>> getAssignedTickets(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String sort,
            Principal principal) {
        User user = userService.findUserByUsername(principal.getName());
        return ResponseEntity.ok(ticketService.getAssignedTickets(user, status, priority, category, search, sort));
    }

    /**
     * CREATE NEW TICKET
     * Endpoint: POST /api/tickets
     * Accepts ticket details from the frontend and saves them to the database.
     */
    @PostMapping
    public ResponseEntity<TicketResponse> createTicket(@Valid @RequestBody TicketRequest request, Principal principal) {
        User user = userService.findUserByUsername(principal.getName());
        return ResponseEntity.ok(ticketService.createTicket(request, user.getId()));
    }

    /**
     * FETCH SINGLE TICKET DETAILS
     * Endpoint: GET /api/tickets/{id}
     * Returns full information for one specific ticket.
     */
    @GetMapping("/{id}")
    public ResponseEntity<TicketResponse> getTicket(@PathVariable String id, Principal principal) {
        User user = userService.findUserByUsername(principal.getName());
        return ResponseEntity.ok(ticketService.getTicketById(id, user));
    }

    /**
     * ASSIGN TECHNICIAN (Admin Only)
     * Endpoint: PATCH /api/tickets/{id}/assign
     * Allows an admin to assign a technician to a specific ticket.
     */
    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TicketResponse> assignTechnician(
            @PathVariable String id, 
            @RequestBody AssignmentRequest request) {
        return ResponseEntity.ok(ticketService.assignTechnician(id, request.getTechnicianId()));
    }

    /**
     * UPDATE TICKET STATUS
     * Endpoint: PATCH /api/tickets/{id}/status
     * Changes the lifecycle stage of a ticket (e.g., OPEN -> IN_PROGRESS).
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public ResponseEntity<TicketResponse> updateStatus(
            @PathVariable String id, 
            @RequestBody StatusUpdateRequest request,
            Principal principal) {
        User user = userService.findUserByUsername(principal.getName());
        return ResponseEntity.ok(ticketService.updateStatus(id, request, user.getId()));
    }

    /**
     * RESOLVE TICKET
     * Endpoint: PATCH /api/tickets/{id}/resolve
     * Marks a ticket as fixed and adds resolution notes.
     */
    @PatchMapping("/{id}/resolve")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public ResponseEntity<TicketResponse> resolveTicket(
            @PathVariable String id, 
            @Valid @RequestBody ResolveRequest request,
            Principal principal) {
        User user = userService.findUserByUsername(principal.getName());
        return ResponseEntity.ok(ticketService.resolveTicket(id, request, user.getId()));
    }

    /**
     * ADD COMMENT
     * Endpoint: POST /api/tickets/{id}/comments
     * Allows users and technicians to communicate on a ticket.
     */
    @PostMapping("/{id}/comments")
    public ResponseEntity<TicketResponse> addComment(
            @PathVariable String id,
            @RequestBody String text,
            Principal principal) {
        User user = userService.findUserByUsername(principal.getName());
        return ResponseEntity.ok(ticketService.addComment(id, text, user));
    }

    /**
     * UPLOAD ATTACHMENT
     * Endpoint: POST /api/tickets/{id}/attachments
     * Handles file uploads (images/screenshots) for a ticket.
     */
    @PostMapping("/{id}/attachments")
    public ResponseEntity<TicketResponse> addAttachment(
            @PathVariable String id,
            @RequestParam("file") MultipartFile file,
            Principal principal) {
        User user = userService.findUserByUsername(principal.getName());
        return ResponseEntity.ok(ticketService.addAttachment(id, file, user));
    }
}
