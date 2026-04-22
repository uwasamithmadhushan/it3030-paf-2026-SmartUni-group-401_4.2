package com.example.demo.bookings;

import com.example.demo.models.Resource;
import com.example.demo.models.ResourceStatus;
import com.example.demo.models.User;
import com.example.demo.repositories.ResourceRepository;
import com.example.demo.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;

    // ── helpers ──────────────────────────────────────────────────────────────

    private BookingResponse toResponse(Booking b) {
        String resourceName = resourceRepository.findById(b.getResourceId())
                .map(Resource::getName).orElse("Unknown Resource");
        String username = userRepository.findById(b.getUserId())
                .map(User::getUsername).orElse("Unknown User");
        return new BookingResponse(
                b.getId(), b.getResourceId(), resourceName,
                b.getUserId(), username,
                b.getStartTime(), b.getEndTime(),
                b.getPurpose(), b.getExpectedAttendees(),
                b.getStatus(), b.getRejectionReason());
    }

    // ── create ───────────────────────────────────────────────────────────────

    public BookingResponse createBooking(BookingRequest request, String username) {
        if (request.getEndTime().isBefore(request.getStartTime()) ||
                request.getEndTime().isEqual(request.getStartTime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }

        Resource resource = resourceRepository.findById(request.getResourceId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Resource not found: " + request.getResourceId()));

        if (resource.getStatus() != ResourceStatus.ACTIVE) {
            throw new IllegalArgumentException(
                    "Resource '" + resource.getName() + "' is not available for booking");
        }

        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                request.getResourceId(), request.getStartTime(), request.getEndTime());
        if (!conflicts.isEmpty()) {
            throw new IllegalArgumentException(
                    "Time slot conflicts with an existing approved booking");
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        Booking booking = new Booking();
        booking.setResourceId(request.getResourceId());
        booking.setUserId(user.getId());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setPurpose(request.getPurpose());
        booking.setExpectedAttendees(request.getExpectedAttendees());
        booking.setStatus(BookingStatus.PENDING);

        return toResponse(bookingRepository.save(booking));
    }

    // ── read ─────────────────────────────────────────────────────────────────

    public List<BookingResponse> getMyBookings(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        return bookingRepository.findByUserId(user.getId())
                .stream().map(this::toResponse).toList();
    }

    public List<BookingResponse> getAllBookings(BookingStatus status) {
        List<Booking> bookings = (status != null)
                ? bookingRepository.findByStatus(status)
                : bookingRepository.findAll();
        return bookings.stream().map(this::toResponse).toList();
    }

    public BookingResponse getBookingById(String id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found: " + id));
        return toResponse(booking);
    }

    // ── status update (admin) ────────────────────────────────────────────────

    public BookingResponse updateBookingStatus(String id, StatusUpdateRequest request) {
        if (request.getStatus() != BookingStatus.APPROVED &&
                request.getStatus() != BookingStatus.REJECTED) {
            throw new IllegalArgumentException("Admins can only set status to APPROVED or REJECTED");
        }

        if (request.getStatus() == BookingStatus.REJECTED &&
                (request.getReason() == null || request.getReason().isBlank())) {
            throw new IllegalArgumentException("A reason is required when rejecting a booking");
        }

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found: " + id));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalArgumentException(
                    "Only PENDING bookings can be approved or rejected");
        }

        if (request.getStatus() == BookingStatus.APPROVED) {
            List<Booking> conflicts = bookingRepository.findConflictingBookings(
                    booking.getResourceId(), booking.getStartTime(), booking.getEndTime());
            if (!conflicts.isEmpty()) {
                throw new IllegalArgumentException(
                        "Cannot approve: time slot conflicts with an existing approved booking");
            }
        }

        booking.setStatus(request.getStatus());
        booking.setRejectionReason(request.getReason());

        return toResponse(bookingRepository.save(booking));
    }

    // ── cancel (owner) ───────────────────────────────────────────────────────

    public BookingResponse cancelBooking(String id, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found: " + id));

        if (!booking.getUserId().equals(user.getId())) {
            throw new IllegalArgumentException("You can only cancel your own bookings");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new IllegalArgumentException(
                    "Cannot cancel a booking that is already cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        return toResponse(bookingRepository.save(booking));
    }
}
