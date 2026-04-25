package com.example.demo.services;

import com.example.demo.dto.*;
import com.example.demo.models.*;
import com.example.demo.repositories.IncidentTicketRepository;
import com.example.demo.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import java.time.LocalDate;

/**
 * SERVICE CLASS: IncidentTicketService
 * This is where the core "Business Logic" lives.
 * It handles processing data before saving it to the database.
 */
@Service
@RequiredArgsConstructor
public class IncidentTicketService {

    private final IncidentTicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final MongoTemplate mongoTemplate;
    private final Path root = Paths.get("uploads");

    /**
     * GENERATE TICKET CODE
     * Creates a unique ID for each ticket (e.g., TCK-A1B2C3D4).
     */
    private String generateTicketCode() {
        return "TCK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    /**
     * CREATE TICKET LOGIC
     * 1. Validates the number of attachments.
     * 2. Sets initial values (Code, Status: OPEN).
     * 3. Saves the ticket to MongoDB.
     */
    public TicketResponse createTicket(TicketRequest request, String userId) {
        if (request.getAttachments() != null && request.getAttachments().size() > 3) {
            throw new RuntimeException("Maximum 3 attachments allowed");
        }

        IncidentTicket ticket = new IncidentTicket();
        ticket.setTicketCode(generateTicketCode());
        ticket.setTitle(request.getTitle());
        ticket.setDescription(request.getDescription());
        ticket.setCategory(request.getCategory());
        ticket.setResourceId(request.getResourceId());
        ticket.setLocation(request.getLocation());
        
        ticket.setPreferredContactName(request.getPreferredContactName());
        ticket.setPreferredContactEmail(request.getPreferredContactEmail());
        ticket.setPreferredContactPhone(request.getPreferredContactPhone());
        
        ticket.setPriority(request.getPriority());
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setCreatedBy(userId);
        
        if (request.getAttachments() != null) {
            ticket.setAttachments(request.getAttachments());
        }
        
        IncidentTicket saved = ticketRepository.save(ticket);
        return mapToResponse(saved);
    }

    /**
     * ASSIGN TECHNICIAN LOGIC
     * Links a ticket to a specific technician and sets status to IN_PROGRESS.
     */
    public TicketResponse assignTechnician(String id, String technicianId) {
        IncidentTicket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        
        User tech = userRepository.findById(technicianId)
                .orElseThrow(() -> new RuntimeException("Technician not found"));
        
        if (tech.getRole() != UserRole.TECHNICIAN) {
            throw new RuntimeException("Selected user is not a technician");
        }

        ticket.setAssignedTechnician(technicianId);
        if (ticket.getStatus() == TicketStatus.OPEN) {
            ticket.setStatus(TicketStatus.IN_PROGRESS);
        }
        
        return mapToResponse(ticketRepository.save(ticket));
    }

    /**
     * RESOLVE TICKET LOGIC
     * Marks the ticket as fixed and records resolution notes from the technician.
     */
    public TicketResponse resolveTicket(String id, ResolveRequest request, String technicianId) {
        IncidentTicket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        if (ticket.getStatus() != TicketStatus.IN_PROGRESS && ticket.getStatus() != TicketStatus.OPEN) {
             throw new RuntimeException("Ticket must be OPEN or IN_PROGRESS to be resolved");
        }

        ticket.setStatus(TicketStatus.RESOLVED);
        ticket.setResolutionNotes(request.getResolutionNotes());
        ticket.setResolvedAt(LocalDateTime.now());
        
        // Add a log entry for the resolution
        TechnicianUpdate update = new TechnicianUpdate(technicianId, "Resolved: " + request.getResolutionNotes(), LocalDateTime.now());
        ticket.getUpdates().add(update);

        return mapToResponse(ticketRepository.save(ticket));
    }

    /**
     * DATA MAPPING
     * Converts the database "Model" into a "Response DTO" for the frontend.
     * Also fetches usernames so the frontend doesn't just show IDs.
     */
    private TicketResponse mapToResponse(IncidentTicket ticket) {
        TicketResponse response = new TicketResponse();
        // ... (copying fields to response)
        response.setId(ticket.getId());
        response.setTicketCode(ticket.getTicketCode());
        response.setTitle(ticket.getTitle());
        response.setDescription(ticket.getDescription());
        response.setCategory(ticket.getCategory());
        response.setPriority(ticket.getPriority());
        response.setStatus(ticket.getStatus());
        response.setCreatedById(ticket.getCreatedBy());
        response.setAssignedTechnicianId(ticket.getAssignedTechnician());
        response.setResourceId(ticket.getResourceId());
        response.setLocation(ticket.getLocation());
        
        response.setPreferredContactName(ticket.getPreferredContactName());
        response.setPreferredContactEmail(ticket.getPreferredContactEmail());
        response.setPreferredContactPhone(ticket.getPreferredContactPhone());
        
        response.setResolutionNotes(ticket.getResolutionNotes());
        response.setRejectionReason(ticket.getRejectionReason());
        
        response.setComments(ticket.getComments());
        response.setAttachments(ticket.getAttachments());
        response.setUpdates(ticket.getUpdates());
        response.setCreatedAt(ticket.getCreatedAt());
        response.setUpdatedAt(ticket.getUpdatedAt());
        response.setResolvedAt(ticket.getResolvedAt());
        response.setClosedAt(ticket.getClosedAt());

        // Fetch user information to display names instead of just IDs
        userRepository.findById(ticket.getCreatedBy())
                .ifPresent(u -> response.setCreatedByUsername(u.getUsername()));

        if (ticket.getAssignedTechnician() != null) {
            userRepository.findById(ticket.getAssignedTechnician())
                    .ifPresent(u -> response.setAssignedTechnicianName(u.getName() != null ? u.getName() : u.getUsername()));
        }

        return response;
    }
}
