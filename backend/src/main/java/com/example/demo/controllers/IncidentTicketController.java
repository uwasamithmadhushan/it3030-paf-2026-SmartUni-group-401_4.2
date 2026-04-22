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

    @PutMapping("/{id}")
    public ResponseEntity<TicketResponse> updateTicket(
            @PathVariable String id,
            @RequestBody TicketRequest request,
            Principal principal) {
        User user = userService.findUserByUsername(principal.getName());
        return ResponseEntity.ok(ticketService.updateTicket(id, request, user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(@PathVariable String id, Principal principal) {
        User user = userService.findUserByUsername(principal.getName());
        ticketService.deleteTicket(id, user);
        return ResponseEntity.noContent().build();
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

    @PostMapping("/{id}/comments")
    public ResponseEntity<TicketResponse> addComment(
            @PathVariable String id,
            @RequestBody String text,
            Principal principal) {
        User user = userService.findUserByUsername(principal.getName());
        return ResponseEntity.ok(ticketService.addComment(id, text, user));
    }

    @PutMapping("/{id}/comments/{commentId}")
    public ResponseEntity<TicketResponse> updateComment(
            @PathVariable String id,
            @PathVariable String commentId,
            @RequestBody String text,
            Principal principal) {
        User user = userService.findUserByUsername(principal.getName());
        return ResponseEntity.ok(ticketService.updateComment(id, commentId, text, user));
    }

    @DeleteMapping("/{id}/comments/{commentId}")
    public ResponseEntity<TicketResponse> deleteComment(
            @PathVariable String id,
            @PathVariable String commentId,
            Principal principal) {
        User user = userService.findUserByUsername(principal.getName());
        return ResponseEntity.ok(ticketService.deleteComment(id, commentId, user));
    }

    @PostMapping("/{id}/attachments")
    public ResponseEntity<TicketResponse> addAttachment(
            @PathVariable String id,
            @RequestParam("file") MultipartFile file,
            Principal principal) {
        User user = userService.findUserByUsername(principal.getName());
        return ResponseEntity.ok(ticketService.addAttachment(id, file, user));
    }

    @DeleteMapping("/{id}/attachments/{filename}")
    public ResponseEntity<TicketResponse> removeAttachment(
            @PathVariable String id,
            @PathVariable String filename,
            Principal principal) {
        User user = userService.findUserByUsername(principal.getName());
        return ResponseEntity.ok(ticketService.removeAttachment(id, filename, user));
    }
}
