package com.example.demo.repositories;

import com.example.demo.models.IncidentTicket;
import com.example.demo.models.TicketStatus;
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
}
