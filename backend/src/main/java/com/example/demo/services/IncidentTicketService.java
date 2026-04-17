package com.example.demo.services;

import com.example.demo.dto.*;
import com.example.demo.models.*;
import com.example.demo.repositories.IncidentTicketRepository;
import com.example.demo.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IncidentTicketService {

    private final IncidentTicketRepository ticketRepository;
    private final UserRepository userRepository;

    public TicketResponse createTicket(TicketRequest request, String userId) {
        IncidentTicket ticket = new IncidentTicket();
        ticket.setTitle(request.getTitle());
        ticket.setDescription(request.getDescription());
        ticket.setCategory(request.getCategory());
        ticket.setPriority(request.getPriority());
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setCreatedBy(userId);
        
        IncidentTicket saved = ticketRepository.save(ticket);
        return mapToResponse(saved);
    }

    public List<TicketResponse> getTickets(User user) {
        List<IncidentTicket> tickets;
        if (user.getRole() == UserRole.ADMIN || user.getRole() == UserRole.TECHNICIAN) {
            tickets = ticketRepository.findAll();
        } else {
            tickets = ticketRepository.findByCreatedBy(user.getId());
        }
        return tickets.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public TicketResponse getTicketById(String id, User user) {
        IncidentTicket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        
        if (user.getRole() != UserRole.ADMIN && user.getRole() != UserRole.TECHNICIAN 
                && !ticket.getCreatedBy().equals(user.getId())) {
            throw new AccessDeniedException("You don't have access to this ticket");
        }
        
        return mapToResponse(ticket);
    }

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

    public TicketResponse updateStatus(String id, StatusUpdateRequest request, String technicianId) {
        IncidentTicket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        ticket.setStatus(request.getStatus());
        
        if (request.getNote() != null && !request.getNote().isEmpty()) {
            TechnicianUpdate update = new TechnicianUpdate(technicianId, request.getNote(), LocalDateTime.now());
            ticket.getUpdates().add(update);
        }

        return mapToResponse(ticketRepository.save(ticket));
    }

    private TicketResponse mapToResponse(IncidentTicket ticket) {
        TicketResponse response = new TicketResponse();
        response.setId(ticket.getId());
        response.setTitle(ticket.getTitle());
        response.setDescription(ticket.getDescription());
        response.setCategory(ticket.getCategory());
        response.setPriority(ticket.getPriority());
        response.setStatus(ticket.getStatus());
        response.setCreatedById(ticket.getCreatedBy());
        response.setAssignedTechnicianId(ticket.getAssignedTechnician());
        response.setAttachments(ticket.getAttachments());
        response.setUpdates(ticket.getUpdates());
        response.setCreatedAt(ticket.getCreatedAt());
        response.setUpdatedAt(ticket.getUpdatedAt());

        userRepository.findById(ticket.getCreatedBy())
                .ifPresent(u -> response.setCreatedByUsername(u.getUsername()));

        if (ticket.getAssignedTechnician() != null) {
            userRepository.findById(ticket.getAssignedTechnician())
                    .ifPresent(u -> response.setAssignedTechnicianName(u.getName() != null ? u.getName() : u.getUsername()));
        }

        return response;
    }
}
