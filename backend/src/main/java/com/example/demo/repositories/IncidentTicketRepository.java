package com.example.demo.repositories;

import com.example.demo.dto.TechnicianPerformanceResult;
import com.example.demo.dto.TechnicianStatsResult;
import com.example.demo.models.IncidentTicket;
import com.example.demo.models.TicketStatus;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidentTicketRepository extends MongoRepository<IncidentTicket, String> {
    List<IncidentTicket> findByCreatedBy(String createdBy);
    List<IncidentTicket> findByAssignedTechnician(String assignedTechnician);
    List<IncidentTicket> findByStatus(TicketStatus status);
    List<IncidentTicket> findByCreatedByAndStatus(String createdBy, TicketStatus status);
    long countByStatus(TicketStatus status);

    // Returns average resolution time per technician across all RESOLVED tickets.
    // resolutionTimeMs = resolvedAt - createdAt (MongoDB $subtract on Date fields).
    // Technicians with no resolved tickets are excluded.
    @Aggregation(pipeline = {
        "{ $match: { status: 'RESOLVED', resolvedAt: { $exists: true, $ne: null } } }",
        "{ $project: { assignedTechnician: 1, resolutionTimeMs: { $subtract: ['$resolvedAt', '$createdAt'] } } }",
        "{ $group: { _id: '$assignedTechnician', avgResolutionTimeMs: { $avg: '$resolutionTimeMs' } } }",
        "{ $project: { _id: 0, technicianId: '$_id', avgResolutionTimeMs: 1 } }"
    })
    List<TechnicianPerformanceResult> findAvgResolutionTimePerTechnician();

    // Returns resolved-count and avg resolution time per technician for the analytics dashboard.
    @Aggregation(pipeline = {
        "{ $match: { status: 'RESOLVED', assignedTechnician: { $ne: null } } }",
        "{ $group: { _id: '$assignedTechnician', resolvedCount: { $sum: 1 }, " +
            "avgResolutionTimeMs: { $avg: { $cond: [ { $and: [ '$resolvedAt', '$createdAt' ] }, { $subtract: ['$resolvedAt', '$createdAt'] }, null ] } } } }",
        "{ $project: { _id: 0, technicianId: '$_id', resolvedCount: 1, avgResolutionTimeMs: 1 } }"
    })
    List<TechnicianStatsResult> findTechnicianStats();
}
