package com.example.demo.models;

/**
 * ENUM: TicketPriority
 * Defines the level of urgency for a support ticket.
 */
public enum TicketPriority {
    LOW,    // Non-critical issues
    MEDIUM, // Standard maintenance requests
    HIGH,   // Significant issues affecting productivity
    URGENT  // Emergency situations (e.g., power outage, security risk)
}
