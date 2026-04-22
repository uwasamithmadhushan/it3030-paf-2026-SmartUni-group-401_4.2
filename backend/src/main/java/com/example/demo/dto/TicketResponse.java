package com.example.demo.dto;

import com.example.demo.models.Attachment;
import com.example.demo.models.Comment;
import com.example.demo.models.TechnicianUpdate;
import com.example.demo.models.TicketPriority;
import com.example.demo.models.TicketStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketResponse {
    private String id;
    private String ticketCode;
    private String title;
    private String description;
    private String category;
    private String resourceId;
    private String location;
    
    private String preferredContactName;
    private String preferredContactEmail;
    private String preferredContactPhone;
    
    private TicketPriority priority;
    private TicketStatus status;
    private String createdById;
    private String createdByUsername;
    private String assignedTechnicianId;
    private String assignedTechnicianName;
    
    private String resolutionNotes;
    private String rejectionReason;
    
    private List<Attachment> attachments;
    private List<TechnicianUpdate> updates;
    private List<Comment> comments;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;
    private LocalDateTime closedAt;
}
