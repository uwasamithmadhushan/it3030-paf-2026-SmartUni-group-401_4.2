package com.example.demo.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "incident_tickets")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class IncidentTicket {

    @Id
    private String id;

    private String title;
    private String description;
    private String category;
    private String resourceId;
    private String location;
    private String contactDetails;
    private TicketPriority priority;
    private TicketStatus status;

    private String createdBy; // User ID
    private String assignedTechnician; // User ID (can be null)

    private List<Attachment> attachments = new ArrayList<>();
    private List<TechnicianUpdate> updates = new ArrayList<>();
    private List<Comment> comments = new ArrayList<>();

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    /** Set when status transitions to RESOLVED. Used for performance metrics. */
    private LocalDateTime resolvedAt;
}
