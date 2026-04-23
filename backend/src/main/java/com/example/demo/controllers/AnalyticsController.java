package com.example.demo.controllers;

import com.example.demo.bookings.BookingTrendPoint;
import com.example.demo.dto.AdminDashboardStatsDTO;
import com.example.demo.dto.ResourceUsageDTO;
import com.example.demo.dto.TechnicianStatsResult;
import com.example.demo.services.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    /** GET /api/analytics/summary — totals across users, bookings, tickets, resources. */
    @GetMapping("/summary")
    public ResponseEntity<AdminDashboardStatsDTO> getSummary() {
        return ResponseEntity.ok(analyticsService.getSystemSummary());
    }

    /** GET /api/analytics/resource-stats — booking frequency and percentage per resource. */
    @GetMapping("/resource-stats")
    public ResponseEntity<List<ResourceUsageDTO>> getResourceStats() {
        return ResponseEntity.ok(analyticsService.getResourceUsageStats());
    }

    /** GET /api/analytics/performance — resolved-ticket count and avg resolution time per technician. */
    @GetMapping("/performance")
    public ResponseEntity<List<TechnicianStatsResult>> getPerformance() {
        return ResponseEntity.ok(analyticsService.getTechnicianPerformance());
    }

    /** GET /api/analytics/booking-trends — monthly booking counts for the last 12 months. */
    @GetMapping("/booking-trends")
    public ResponseEntity<List<BookingTrendPoint>> getBookingTrends() {
        return ResponseEntity.ok(analyticsService.getBookingTrends());
    }
}
