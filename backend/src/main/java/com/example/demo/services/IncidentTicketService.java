package com.example.demo.services;

import com.example.demo.dto.*;
import com.example.demo.models.*;
import com.example.demo.repositories.IncidentTicketRepository;
import com.example.demo.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IncidentTicketService {

    private final IncidentTicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final Path root = Paths.get("uploads");

    public TicketResponse createTicket(TicketRequest request, String userId) {
        if (request.getAttachments() != null && request.getAttachments().size() > 3) {
            throw new RuntimeException("Maximum 3 attachments allowed");
        }

        IncidentTicket ticket = new IncidentTicket();
        ticket.setTitle(request.getTitle());
        ticket.setDescription(request.getDescription());
        ticket.setCategory(request.getCategory());
        ticket.setResourceId(request.getResourceId());
        ticket.setLocation(request.getLocation());
        ticket.setContactDetails(request.getContactDetails());
        ticket.setPriority(request.getPriority());
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setCreatedBy(userId);
        
        if (request.getAttachments() != null) {
            ticket.setAttachments(request.getAttachments());
        }
        
        IncidentTicket saved = ticketRepository.save(ticket);
        return mapToResponse(saved);
    }

    public void deleteTicket(String id, User user) {
        IncidentTicket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        
        if (user.getRole() != UserRole.ADMIN && !ticket.getCreatedBy().equals(user.getId())) {
            throw new AccessDeniedException("You don't have permission to delete this ticket");
        }
        
        ticketRepository.delete(ticket);
    }

    public TicketResponse addComment(String ticketId, String text, User user) {
        IncidentTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        
        Comment comment = new Comment();
        comment.setUserId(user.getId());
        comment.setUsername(user.getUsername());
        comment.setText(text);
        
        ticket.getComments().add(comment);
        return mapToResponse(ticketRepository.save(ticket));
    }

    public TicketResponse updateComment(String ticketId, String commentId, String text, User user) {
        IncidentTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        
        Comment comment = ticket.getComments().stream()
                .filter(c -> c.getId().equals(commentId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        
        if (user.getRole() != UserRole.ADMIN && !comment.getUserId().equals(user.getId())) {
            throw new AccessDeniedException("You don't have permission to edit this comment");
        }
        
        comment.setText(text);
        return mapToResponse(ticketRepository.save(ticket));
    }

    public TicketResponse deleteComment(String ticketId, String commentId, User user) {
        IncidentTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        
        boolean removed = ticket.getComments().removeIf(c -> 
            c.getId().equals(commentId) && (user.getRole() == UserRole.ADMIN || c.getUserId().equals(user.getId()))
        );
        
        if (!removed) {
            throw new RuntimeException("Comment not found or access denied");
        }
        
        return mapToResponse(ticketRepository.save(ticket));
    }

    public TicketResponse addAttachment(String ticketId, MultipartFile file, User user) {
        IncidentTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        
        if (ticket.getAttachments().size() >= 3) {
            throw new RuntimeException("Maximum 3 attachments allowed per ticket");
        }

        try {
            if (!Files.exists(root)) {
                Files.createDirectories(root);
            }
            String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Files.copy(file.getInputStream(), this.root.resolve(filename));

            Attachment attachment = new Attachment(
                    file.getOriginalFilename(),
                    file.getContentType(),
                    "/api/files/" + filename
            );
            
            ticket.getAttachments().add(attachment);
            return mapToResponse(ticketRepository.save(ticket));
        } catch (IOException e) {
            throw new RuntimeException("Could not store the file. Error: " + e.getMessage());
        }
    }

    public TicketResponse removeAttachment(String ticketId, String filename, User user) {
        IncidentTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        
        if (user.getRole() != UserRole.ADMIN && !ticket.getCreatedBy().equals(user.getId())) {
            throw new AccessDeniedException("Access denied");
        }

        ticket.getAttachments().removeIf(a -> a.getUrl().endsWith(filename));
        return mapToResponse(ticketRepository.save(ticket));
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

        if (request.getStatus() == TicketStatus.RESOLVED && ticket.getResolvedAt() == null) {
            ticket.setResolvedAt(LocalDateTime.now());
        }

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
        response.setResourceId(ticket.getResourceId());
        response.setLocation(ticket.getLocation());
        response.setContactDetails(ticket.getContactDetails());
        response.setComments(ticket.getComments());
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
