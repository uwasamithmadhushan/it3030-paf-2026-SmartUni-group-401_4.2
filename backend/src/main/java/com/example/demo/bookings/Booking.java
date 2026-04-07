package com.example.demo.bookings;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "bookings")
public class Booking {

    @Id
    private String id;

    private String resourceId;

    private String userId;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private String purpose;

    private int expectedAttendees;

    private BookingStatus status;

    private String rejectionReason;
}
