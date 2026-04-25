package com.example.demo.models;

/**
 * ENUM: TicketStatus
 * Defines the different stages of a ticket's lifecycle.
 */
public enum TicketStatus {
    OPEN,         // Newly created, waiting for review
    IN_PROGRESS,  // Assigned to a technician and being worked on
    RESOLVED,     // Fixed by the technician, waiting for user confirmation
    CLOSED,       // Final state, issue is resolved and record is archived
    REJECTED      // Declined by the system/admin (e.g., duplicate or invalid)
}
