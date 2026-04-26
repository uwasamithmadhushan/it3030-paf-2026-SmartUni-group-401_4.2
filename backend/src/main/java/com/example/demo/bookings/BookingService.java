package com.example.demo.bookings;

import com.example.demo.exception.BookingConflictException;
import com.example.demo.models.Resource;
import com.example.demo.models.ResourceStatus;
import com.example.demo.models.User;
import com.example.demo.repositories.ResourceRepository;
import com.example.demo.repositories.UserRepository;
import com.example.demo.services.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    // ── helpers ──────────────────────────────────────────────────────────────

    /**
     * Returns true when no APPROVED or PENDING booking for the same resource
     * overlaps the requested [start, end) window.
     * An optional excludeId lets the approval path ignore the booking being
     * evaluated (it would otherwise always conflict with itself).
     */
    private boolean isResourceAvailable(String resourceId,
                                         LocalDateTime start,
                                         LocalDateTime end,
                                         String excludeId) {
        return bookingRepository
                .findConflictingBookings(resourceId, start, end)
                .stream()
                .noneMatch(b -> !b.getId().equals(excludeId));
    }

    /**
     * Validates availability and persists the booking.
     * Passing a non-null excludeId (the booking's own ID) prevents the booking
     * from conflicting with itself on updates.
     */
    private Booking saveBooking(Booking booking, String excludeId) {
        if (booking.getStartTime() == null || booking.getEndTime() == null ||
                !booking.getEndTime().isAfter(booking.getStartTime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }
        if (booking.getStartTime().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Cannot make a booking in the past");
        }
        if (!isResourceAvailable(booking.getResourceId(),
                booking.getStartTime(), booking.getEndTime(), excludeId)) {
            throw new BookingConflictException(
                    "Resource is already booked for that time slot");
        }
        return bookingRepository.save(booking);
    }

    private BookingResponse toResponse(Booking b) {
        String resourceName = resourceRepository.findById(b.getResourceId())
            .map(Resource::getResourceName).orElse("Unknown Resource");
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
        Resource resource = resourceRepository.findById(request.getResourceId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Resource not found: " + request.getResourceId()));

        if (resource.getStatus() != ResourceStatus.ACTIVE) {
            throw new IllegalArgumentException(
                "Resource '" + resource.getResourceName() + "' is not available for booking");
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

        return toResponse(saveBooking(booking, null));
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

        booking.setStatus(request.getStatus());
        booking.setRejectionReason(request.getReason());

        BookingResponse response;
        // saveBooking re-checks availability; pass booking.getId() to exclude itself
        if (request.getStatus() == BookingStatus.APPROVED) {
            response = toResponse(saveBooking(booking, booking.getId()));
        } else {
            response = toResponse(bookingRepository.save(booking));
        }

        // Send email notification asynchronously
        userRepository.findById(booking.getUserId()).ifPresent(user -> {
            Resource resource = resourceRepository.findById(booking.getResourceId()).orElse(null);
            String resourceName = resource != null ? resource.getResourceName() : "Resource";
            String location = resource != null
                ? resource.getBuilding() + ", Floor " + resource.getFloor() + ", Room " + resource.getRoomNumber()
                : null;
            if (request.getStatus() == BookingStatus.APPROVED) {
                emailService.sendBookingApprovedEmail(
                    user.getEmail(), user.getUsername(),
                    resourceName, location,
                    booking.getStartTime(), booking.getEndTime(),
                    booking.getPurpose());
            } else {
                emailService.sendBookingRejectedEmail(
                    user.getEmail(), user.getUsername(),
                    resourceName,
                    booking.getStartTime(), booking.getEndTime(),
                    request.getReason());
            }
        });

        return response;
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
