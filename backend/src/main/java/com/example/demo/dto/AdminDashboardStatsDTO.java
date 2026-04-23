package com.example.demo.dto;

public class AdminDashboardStatsDTO {

    private long totalUsers;
    private long activeBookings;
    private long pendingTickets;
    private long totalResources;

    public AdminDashboardStatsDTO() {}

    public AdminDashboardStatsDTO(long totalUsers, long activeBookings,
                                   long pendingTickets, long totalResources) {
        this.totalUsers = totalUsers;
        this.activeBookings = activeBookings;
        this.pendingTickets = pendingTickets;
        this.totalResources = totalResources;
    }

    public long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }

    public long getActiveBookings() { return activeBookings; }
    public void setActiveBookings(long activeBookings) { this.activeBookings = activeBookings; }

    public long getPendingTickets() { return pendingTickets; }
    public void setPendingTickets(long pendingTickets) { this.pendingTickets = pendingTickets; }

    public long getTotalResources() { return totalResources; }
    public void setTotalResources(long totalResources) { this.totalResources = totalResources; }
}
