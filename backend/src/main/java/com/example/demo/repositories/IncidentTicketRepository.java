package com.example.demo.repositories;

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

    @Aggregation(pipeline = {
        "{ $match: { assignedTechnician: { $ne: null }, resolvedAt: { $ne: null }, createdAt: { $ne: null } } }",
        "{ $project: { technicianId: '$assignedTechnician', resolutionTimeMs: { $subtract: ['$resolvedAt', '$createdAt'] } } }",
        "{ $group: { _id: '$technicianId', resolvedCount: { $sum: 1 }, avgResolutionTimeMs: { $avg: '$resolutionTimeMs' } } }",
        "{ $project: { _id: 0, technicianId: '$_id', resolvedCount: 1, avgResolutionTimeMs: 1 } }",
        "{ $sort: { resolvedCount: -1, avgResolutionTimeMs: 1 } }"
    })
    List<TechnicianStatsResult> findTechnicianStats();
}
