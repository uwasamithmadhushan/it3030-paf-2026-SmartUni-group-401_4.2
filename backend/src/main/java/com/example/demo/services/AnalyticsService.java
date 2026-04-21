package com.example.demo.services;

import com.example.demo.bookings.BookingCountByResource;
import com.example.demo.bookings.BookingRepository;
import com.example.demo.bookings.BookingStatus;
import com.example.demo.bookings.BookingTrendPoint;
import com.example.demo.dto.AdminDashboardStatsDTO;
import com.example.demo.dto.ResourceUsageDTO;
import com.example.demo.dto.TechnicianStatsResult;
import com.example.demo.models.Resource;
import com.example.demo.models.TicketStatus;
import com.example.demo.repositories.IncidentTicketRepository;
import com.example.demo.repositories.ResourceRepository;
import com.example.demo.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final UserRepository userRepository;
    private final ResourceRepository resourceRepository;
    private final BookingRepository bookingRepository;
    private final IncidentTicketRepository ticketRepository;

    // ── system summary ────────────────────────────────────────────────────────

    public AdminDashboardStatsDTO getSystemSummary() {
        long totalUsers     = userRepository.count();
        long activeBookings = bookingRepository.countByStatus(BookingStatus.APPROVED);
        long pendingTickets = ticketRepository.countByStatus(TicketStatus.OPEN);
        long totalResources = resourceRepository.count();
        return new AdminDashboardStatsDTO(totalUsers, activeBookings, pendingTickets, totalResources);
    }

    // ── resource usage ────────────────────────────────────────────────────────

    public List<ResourceUsageDTO> getResourceUsageStats() {
        List<BookingCountByResource> counts = bookingRepository.countBookingsByResource();
        long totalBookings = counts.stream().mapToLong(BookingCountByResource::getCount).sum();

        return counts.stream()
                .map(c -> {
                    String name = resourceRepository.findById(c.getResourceId())
                            .map(Resource::getName)
                            .orElse("Unknown Resource");
                    double pct = totalBookings > 0
                            ? Math.round((c.getCount() * 1000.0 / totalBookings)) / 10.0
                            : 0.0;
                    return new ResourceUsageDTO(c.getResourceId(), name, c.getCount(), pct);
                })
                .sorted(Comparator.comparingLong(ResourceUsageDTO::getBookingCount).reversed())
                .collect(Collectors.toList());
    }

    // ── technician performance ────────────────────────────────────────────────

    public List<TechnicianStatsResult> getTechnicianPerformance() {
        List<TechnicianStatsResult> stats = ticketRepository.findTechnicianStats();
        stats.forEach(s -> userRepository.findById(s.getTechnicianId()).ifPresent(u ->
                s.setTechnicianName(u.getName() != null ? u.getName() : u.getUsername())
        ));
        return stats;
    }

    // ── booking trends ────────────────────────────────────────────────────────

    public List<BookingTrendPoint> getBookingTrends() {
        return bookingRepository.findMonthlyBookingTrends();
    }
}
