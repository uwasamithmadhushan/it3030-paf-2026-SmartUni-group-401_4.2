package com.example.demo.bookings;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StatusUpdateRequest {

    @NotNull(message = "Status is required")
    private BookingStatus status;

    // Mandatory only when status is REJECTED
    private String reason;
}
