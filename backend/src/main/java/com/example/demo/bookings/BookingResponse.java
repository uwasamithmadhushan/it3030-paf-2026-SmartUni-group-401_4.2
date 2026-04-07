package com.example.demo.bookings;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class BookingResponse {

    private String id;
    private String resourceId;
    private String resourceName;
    private String userId;
    private String username;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String purpose;
    private int expectedAttendees;
    private BookingStatus status;
    private String rejectionReason;
}
