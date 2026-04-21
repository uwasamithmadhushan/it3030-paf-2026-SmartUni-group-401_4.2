package com.example.demo.bookings;

import org.springframework.data.mongodb.repository.Aggregation;
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

    // Returns the total number of bookings for each resourceId across all statuses.
    @Aggregation(pipeline = {
        "{ $group: { _id: '$resourceId', count: { $sum: 1 } } }",
        "{ $project: { _id: 0, resourceId: '$_id', count: 1 } }"
    })
    List<BookingCountByResource> countBookingsByResource();

    long countByStatus(BookingStatus status);

    // Returns booking counts grouped by month of startTime, sorted chronologically.
    // Capped to the last 12 months of data.
    @Aggregation(pipeline = {
        "{ $group: { _id: { year: { $year: '$startTime' }, month: { $month: '$startTime' } }, count: { $sum: 1 } } }",
        "{ $sort: { '_id.year': 1, '_id.month': 1 } }",
        "{ $limit: 12 }",
        "{ $project: { _id: 0, year: '$_id.year', month: '$_id.month', count: 1 } }"
    })
    List<BookingTrendPoint> findMonthlyBookingTrends();

    // Returns booking counts grouped by the hour of startTime, sorted by count descending.
    // Useful for identifying peak booking hours (0–23).
    @Aggregation(pipeline = {
        "{ $group: { _id: { $hour: '$startTime' }, count: { $sum: 1 } } }",
        "{ $sort: { count: -1 } }",
        "{ $project: { _id: 0, hour: '$_id', count: 1 } }"
    })
    List<PeakHourResult> findPeakBookingHours();
}
