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

@Service
@RequiredArgsConstructor
public class IncidentTicketService {

    private final IncidentTicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final MongoTemplate mongoTemplate;
    private final EmailService emailService;
    private final Path root = Paths.get("uploads");

    private String generateTicketCode() {
        return "TCK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

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

    public TicketResponse updateTicket(String id, TicketRequest request, User user) {
        IncidentTicket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        if (user.getRole() != UserRole.ADMIN && !ticket.getCreatedBy().equals(user.getId())) {
            throw new AccessDeniedException("Access denied");
        }

        ticket.setTitle(request.getTitle());
        ticket.setDescription(request.getDescription());
        ticket.setCategory(request.getCategory());
        ticket.setResourceId(request.getResourceId());
        ticket.setLocation(request.getLocation());
        
        ticket.setPreferredContactName(request.getPreferredContactName());
        ticket.setPreferredContactEmail(request.getPreferredContactEmail());
        ticket.setPreferredContactPhone(request.getPreferredContactPhone());
        
        ticket.setPriority(request.getPriority());
        
        return mapToResponse(ticketRepository.save(ticket));
    }

    public void deleteTicket(String id, User user) {
        IncidentTicket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        
        boolean isAdminOrTechnician = user.getRole() == UserRole.ADMIN || user.getRole() == UserRole.TECHNICIAN;
        if (!isAdminOrTechnician && !ticket.getCreatedBy().equals(user.getId())) {
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
        comment.setUserRole(user.getRole());
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

    public List<TicketResponse> getTickets(User user, String status, String priority, String category, String search, String sort) {
        Query query = new Query();
        if (user.getRole() != UserRole.ADMIN && user.getRole() != UserRole.TECHNICIAN) {
            query.addCriteria(Criteria.where("createdBy").is(user.getId()));
        }
        applyFilters(query, status, priority, category, search, sort);
        return mongoTemplate.find(query, IncidentTicket.class).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<TicketResponse> getMyTickets(User user, String status, String priority, String category, String search, String sort) {
        Query query = new Query();
        query.addCriteria(Criteria.where("createdBy").is(user.getId()));
        applyFilters(query, status, priority, category, search, sort);
        return mongoTemplate.find(query, IncidentTicket.class).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<TicketResponse> getAssignedTickets(User user, String status, String priority, String category, String search, String sort) {
        if (user.getRole() != UserRole.TECHNICIAN && user.getRole() != UserRole.ADMIN) {
            throw new AccessDeniedException("Only technicians and admins can view assigned tickets");
        }

        Query query = new Query();
        query.addCriteria(Criteria.where("assignedTechnician").is(user.getId()));
        applyFilters(query, status, priority, category, search, sort);
        return mongoTemplate.find(query, IncidentTicket.class).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private void applyFilters(Query query, String status, String priority, String category, String search, String sort) {
        if (status != null && !status.equalsIgnoreCase("ALL")) {
            query.addCriteria(Criteria.where("status").is(status.toUpperCase()));
        }
        if (priority != null && !priority.equalsIgnoreCase("ALL")) {
            query.addCriteria(Criteria.where("priority").is(priority.toUpperCase()));
        }
        if (category != null && !category.equalsIgnoreCase("ALL")) {
            query.addCriteria(Criteria.where("category").is(category.toUpperCase()));
        }
        if (search != null && !search.isEmpty()) {
            Criteria searchCriteria = new Criteria().orOperator(
                Criteria.where("ticketCode").regex(search, "i"),
                Criteria.where("title").regex(search, "i"),
                Criteria.where("location").regex(search, "i"),
                Criteria.where("category").regex(search, "i")
            );
            query.addCriteria(searchCriteria);
        }

        if (sort != null) {
            switch (sort) {
                case "NEWEST":
                    query.with(Sort.by(Sort.Direction.DESC, "createdAt"));
                    break;
                case "OLDEST":
                    query.with(Sort.by(Sort.Direction.ASC, "createdAt"));
                    break;
                case "PRIORITY_HIGH_TO_LOW":
                    query.with(Sort.by(Sort.Direction.DESC, "priority"));
                    break;
                case "RECENTLY_UPDATED":
                    query.with(Sort.by(Sort.Direction.DESC, "updatedAt"));
                    break;
                default:
                    query.with(Sort.by(Sort.Direction.DESC, "createdAt"));
            }
        } else {
            query.with(Sort.by(Sort.Direction.DESC, "createdAt"));
        }
    }

    public DashboardStatsResponse getTechnicianDashboardStats(User user) {
        if (user.getRole() != UserRole.TECHNICIAN && user.getRole() != UserRole.ADMIN) {
            throw new AccessDeniedException("Access denied");
        }
        
        List<IncidentTicket> tickets = ticketRepository.findByAssignedTechnician(user.getId());
        
        long totalAssigned = tickets.size();
        long openTickets = tickets.stream().filter(t -> t.getStatus() == TicketStatus.OPEN).count();
        long inProgressTickets = tickets.stream().filter(t -> t.getStatus() == TicketStatus.IN_PROGRESS).count();
        long urgentTickets = tickets.stream().filter(t -> t.getPriority() == TicketPriority.URGENT).count();
        
        LocalDate today = LocalDate.now();
        LocalDate weekAgo = today.minusDays(7);
        
        long resolvedToday = tickets.stream()
            .filter(t -> t.getStatus() == TicketStatus.RESOLVED && t.getResolvedAt() != null)
            .filter(t -> t.getResolvedAt().toLocalDate().isEqual(today))
            .count();
            
        long resolvedThisWeek = tickets.stream()
            .filter(t -> t.getStatus() == TicketStatus.RESOLVED && t.getResolvedAt() != null)
            .filter(t -> !t.getResolvedAt().toLocalDate().isBefore(weekAgo))
            .count();
            
        Map<String, Long> ticketsByStatus = tickets.stream()
            .collect(Collectors.groupingBy(t -> t.getStatus().name(), Collectors.counting()));
            
        Map<String, Long> ticketsByPriority = tickets.stream()
            .collect(Collectors.groupingBy(t -> t.getPriority().name(), Collectors.counting()));
            
        Map<String, Long> weeklyCompletedTickets = tickets.stream()
            .filter(t -> t.getStatus() == TicketStatus.RESOLVED && t.getResolvedAt() != null)
            .filter(t -> !t.getResolvedAt().toLocalDate().isBefore(weekAgo))
            .collect(Collectors.groupingBy(t -> t.getResolvedAt().toLocalDate().toString(), Collectors.counting()));
            
        double avgResolutionTime = tickets.stream()
            .filter(t -> t.getStatus() == TicketStatus.RESOLVED && t.getResolvedAt() != null && t.getCreatedAt() != null)
            .mapToLong(t -> ChronoUnit.HOURS.between(t.getCreatedAt(), t.getResolvedAt()))
            .average().orElse(0.0);
            
        return new DashboardStatsResponse(
            totalAssigned, openTickets, inProgressTickets, resolvedToday, urgentTickets, resolvedThisWeek,
            ticketsByStatus, ticketsByPriority, weeklyCompletedTickets, avgResolutionTime
        );
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

        IncidentTicket saved = ticketRepository.save(ticket);

        // Notify the assigned technician by email
        String reporterName = ticket.getCreatedBy() != null
                ? userRepository.findById(ticket.getCreatedBy())
                        .map(u -> u.getName() != null ? u.getName() : u.getUsername())
                        .orElse("Unknown")
                : "Unknown";
        emailService.sendTicketAssignedEmail(
                tech.getEmail(),
                tech.getName() != null ? tech.getName() : tech.getUsername(),
                ticket.getTicketCode(), ticket.getTitle(),
                ticket.getLocation(),
                ticket.getPriority() != null ? ticket.getPriority().name() : "NORMAL",
                reporterName);

        return mapToResponse(saved);
    }

    public TicketResponse updateStatus(String id, StatusUpdateRequest request, String technicianId) {
        IncidentTicket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        if (request.getStatus() == TicketStatus.CLOSED && ticket.getStatus() != TicketStatus.RESOLVED) {
            throw new RuntimeException("A ticket can only be CLOSED after it has been RESOLVED.");
        }

        ticket.setStatus(request.getStatus());
        
        if (request.getStatus() == TicketStatus.CLOSED) {
            ticket.setClosedAt(LocalDateTime.now());
        }

        if (request.getNote() != null && !request.getNote().isEmpty()) {
            TechnicianUpdate update = new TechnicianUpdate(technicianId, request.getNote(), LocalDateTime.now());
            ticket.getUpdates().add(update);
        }

        return mapToResponse(ticketRepository.save(ticket));
    }

    public TicketResponse resolveTicket(String id, ResolveRequest request, String technicianId) {
        IncidentTicket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        if (ticket.getStatus() != TicketStatus.IN_PROGRESS && ticket.getStatus() != TicketStatus.OPEN) {
             throw new RuntimeException("Ticket must be OPEN or IN_PROGRESS to be resolved");
        }

        ticket.setStatus(TicketStatus.RESOLVED);
        ticket.setResolutionNotes(request.getResolutionNotes());
        ticket.setResolvedAt(LocalDateTime.now());
        
        TechnicianUpdate update = new TechnicianUpdate(technicianId, "Resolved: " + request.getResolutionNotes(), LocalDateTime.now());
        ticket.getUpdates().add(update);

        IncidentTicket saved = ticketRepository.save(ticket);

        // Send resolved email to ticket creator asynchronously
        if (ticket.getCreatedBy() != null) {
            userRepository.findById(ticket.getCreatedBy()).ifPresent(user ->
                emailService.sendTicketResolvedEmail(
                    user.getEmail(), user.getUsername(),
                    ticket.getTicketCode(), ticket.getTitle(),
                    ticket.getLocation(), request.getResolutionNotes()));
        }

        return mapToResponse(saved);
    }

    public TicketResponse rejectTicket(String id, RejectRequest request, String technicianId) {
        IncidentTicket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        if (ticket.getStatus() != TicketStatus.OPEN) {
             throw new RuntimeException("Only OPEN tickets can be rejected");
        }

        ticket.setStatus(TicketStatus.REJECTED);
        ticket.setRejectionReason(request.getRejectionReason());
        ticket.setClosedAt(LocalDateTime.now()); // Close it immediately

        TechnicianUpdate update = new TechnicianUpdate(technicianId, "Rejected: " + request.getRejectionReason(), LocalDateTime.now());
        ticket.getUpdates().add(update);

        return mapToResponse(ticketRepository.save(ticket));
    }

    public TicketResponse ownerCloseTicket(String id, String userId) {
        IncidentTicket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        if (!ticket.getCreatedBy().equals(userId)) {
            throw new AccessDeniedException("Only the ticket owner can confirm resolution");
        }
        if (ticket.getStatus() != TicketStatus.RESOLVED) {
            throw new RuntimeException("Ticket must be RESOLVED before it can be closed");
        }

        ticket.setStatus(TicketStatus.CLOSED);
        ticket.setClosedAt(LocalDateTime.now());
        return mapToResponse(ticketRepository.save(ticket));
    }

    public TicketResponse ownerReopenTicket(String id, String userId) {
        IncidentTicket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        if (!ticket.getCreatedBy().equals(userId)) {
            throw new AccessDeniedException("Only the ticket owner can reopen a ticket");
        }
        if (ticket.getStatus() != TicketStatus.RESOLVED) {
            throw new RuntimeException("Only RESOLVED tickets can be reopened");
        }

        ticket.setStatus(TicketStatus.OPEN);
        ticket.setResolutionNotes(null);
        ticket.setResolvedAt(null);
        return mapToResponse(ticketRepository.save(ticket));
    }

    private TicketResponse mapToResponse(IncidentTicket ticket) {
        TicketResponse response = new TicketResponse();
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

        if (ticket.getCreatedBy() != null) {
            userRepository.findById(ticket.getCreatedBy())
                    .ifPresent(u -> response.setCreatedByUsername(u.getUsername()));
        }

        if (ticket.getAssignedTechnician() != null) {
            userRepository.findById(ticket.getAssignedTechnician())
                    .ifPresent(u -> response.setAssignedTechnicianName(u.getName() != null ? u.getName() : u.getUsername()));
        }

        return response;
    }
}
