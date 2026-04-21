package com.example.demo.bookings;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface BookingRepository extends MongoRepository<Booking, String> {

    List<Booking> findByResourceIdAndStatus(String resourceId, BookingStatus status);

    List<Booking> findByUserId(String userId);

    List<Booking> findByStatus(BookingStatus status);

    // Finds APPROVED or PENDING bookings for a resource that overlap with [start, end).
    // Overlap condition: existingStart < newEnd AND existingEnd > newStart
    @Query("{ 'resourceId': ?0, " +
           "'status': { $in: ['APPROVED', 'PENDING'] }, " +
           "'startTime': { $lt: ?2 }, " +
           "'endTime': { $gt: ?1 } }")
    List<Booking> findConflictingBookings(String resourceId,
                                          LocalDateTime start,
                                          LocalDateTime end);
}
