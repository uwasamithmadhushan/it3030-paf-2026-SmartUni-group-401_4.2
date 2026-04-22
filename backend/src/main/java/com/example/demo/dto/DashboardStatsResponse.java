package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {
    private long totalAssigned;
    private long openTickets;
    private long inProgressTickets;
    private long resolvedToday;
    private long urgentTickets;
    private long resolvedThisWeek;
    
    // Charts Data
    private Map<String, Long> ticketsByStatus;
    private Map<String, Long> ticketsByPriority;
    private Map<String, Long> weeklyCompletedTickets;
    
    private double avgResolutionTimeHours;
}
