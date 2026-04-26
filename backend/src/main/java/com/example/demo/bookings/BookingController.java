package com.example.demo.bookings;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    /**
     * POST /api/bookings
     * Any authenticated user can request a booking (status = PENDING).
     */
    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(
            @Valid @RequestBody BookingRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        BookingResponse response = bookingService.createBooking(request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * GET /api/bookings/my
     * Returns all bookings belonging to the logged-in user.
     */
    @GetMapping("/my")
    public ResponseEntity<List<BookingResponse>> getMyBookings(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(bookingService.getMyBookings(userDetails.getUsername()));
    }

    /**
     * GET /api/bookings?status=PENDING
     * Admin only — view all bookings, optionally filtered by status.
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<BookingResponse>> getAllBookings(
            @RequestParam(required = false) BookingStatus status) {
        return ResponseEntity.ok(bookingService.getAllBookings(status));
    }

    /**
     * GET /api/bookings/{id}
     * Admin can view any booking; user can view only their own.
     */
    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getBookingById(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails) {
        BookingResponse booking = bookingService.getBookingById(id);
        boolean isAdmin = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin && !booking.getUsername().equals(userDetails.getUsername())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(booking);
    }

    /**
     * PUT /api/bookings/{id}
     * Booking owner can update their own PENDING booking.
     */
    @PutMapping("/{id}")
    public ResponseEntity<BookingResponse> updateBooking(
            @PathVariable String id,
            @Valid @RequestBody BookingRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(bookingService.updateBooking(id, request, userDetails.getUsername()));
    }

    /**
     * PUT /api/bookings/{id}/status
     * Admin only — approve or reject a PENDING booking.
     */
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingResponse> updateStatus(
            @PathVariable String id,
            @Valid @RequestBody StatusUpdateRequest request) {
        return ResponseEntity.ok(bookingService.updateBookingStatus(id, request));
    }

    /**
     * PUT /api/bookings/{id}/cancel
     * Booking owner can cancel their own PENDING booking.
     */
    @PutMapping("/{id}/cancel")
    public ResponseEntity<BookingResponse> cancelBooking(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(bookingService.cancelBooking(id, userDetails.getUsername()));
    }
}
