package com.example.demo.services;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

    private final JavaMailSender mailSender;

    // ─────────────────────────────────────────────────────────────────────────
    //  BOOKING NOTIFICATIONS
    // ─────────────────────────────────────────────────────────────────────────

    @Async
    public void sendBookingApprovedEmail(String toEmail, String username,
                                          String resourceName, String location,
                                          LocalDateTime start, LocalDateTime end,
                                          String purpose) {
        String subject = "✅ Booking Approved – " + resourceName;
        String body = buildBookingApprovedHtml(username, resourceName, location, start, end, purpose);
        send(toEmail, subject, body);
    }

    @Async
    public void sendBookingRejectedEmail(String toEmail, String username,
                                          String resourceName,
                                          LocalDateTime start, LocalDateTime end,
                                          String reason) {
        String subject = "❌ Booking Rejected – " + resourceName;
        String body = buildBookingRejectedHtml(username, resourceName, start, end, reason);
        send(toEmail, subject, body);
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  TICKET NOTIFICATIONS
    // ─────────────────────────────────────────────────────────────────────────

    @Async
    public void sendTicketAssignedEmail(String toEmail, String technicianName,
                                         String ticketCode, String title,
                                         String location, String priority,
                                         String reporterName) {
        String subject = "📋 New Ticket Assigned – " + ticketCode;
        String body = buildTicketAssignedHtml(technicianName, ticketCode, title, location, priority, reporterName);
        send(toEmail, subject, body);
    }

    @Async
    public void sendTicketResolvedEmail(String toEmail, String username,
                                         String ticketCode, String title,
                                         String location, String resolutionNotes) {
        String subject = "🔧 Ticket Resolved – " + ticketCode;
        String body = buildTicketResolvedHtml(username, ticketCode, title, location, resolutionNotes);
        send(toEmail, subject, body);
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  CORE SEND
    // ─────────────────────────────────────────────────────────────────────────

    private void send(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom("gamagedissanayake1021@gmail.com", "Smart Campus");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
            log.info("Email sent to {} | subject: {}", to, subject);
        } catch (MessagingException | java.io.UnsupportedEncodingException e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  HTML TEMPLATES
    // ─────────────────────────────────────────────────────────────────────────

    private String buildBookingApprovedHtml(String username, String resourceName,
                                             String location, LocalDateTime start,
                                             LocalDateTime end, String purpose) {
        return "<!DOCTYPE html><html><head><meta charset='UTF-8'></head><body style='" +
               "margin:0;padding:0;background:#0a0f1e;font-family:Arial,sans-serif;'>" +
               "<table width='100%' cellpadding='0' cellspacing='0' style='background:#0a0f1e;padding:40px 0;'>" +
               "<tr><td align='center'>" +
               "<table width='600' cellpadding='0' cellspacing='0' style='" +
               "background:#0d1426;border-radius:16px;border:1px solid #00e5ff22;overflow:hidden;'>" +

               // Header
               "<tr><td style='background:linear-gradient(135deg,#00e5ff15,#0d1426);padding:40px 40px 30px;" +
               "border-bottom:1px solid #00e5ff22;text-align:center;'>" +
               "<div style='width:64px;height:64px;background:#00e5ff15;border:2px solid #00e5ff44;" +
               "border-radius:50%;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;" +
               "font-size:28px;'>✅</div>" +
               "<h1 style='color:#00e5ff;font-size:24px;margin:0 0 8px;font-weight:700;" +
               "letter-spacing:-0.5px;'>Booking Confirmed</h1>" +
               "<p style='color:#94a3b8;margin:0;font-size:14px;'>Your reservation has been approved by admin</p>" +
               "</td></tr>" +

               // Body
               "<tr><td style='padding:32px 40px;'>" +
               "<p style='color:#e2e8f0;font-size:16px;margin:0 0 24px;'>Hi <strong style='color:#00e5ff;'>" +
               escHtml(username) + "</strong>,</p>" +
               "<p style='color:#94a3b8;font-size:14px;margin:0 0 24px;line-height:1.6;'>" +
               "Great news! Your booking request has been <strong style='color:#00e5ff;'>approved</strong>. " +
               "Here are your reservation details:</p>" +

               // Details card
               "<div style='background:#0a0f1e;border:1px solid #00e5ff22;border-radius:12px;padding:24px;margin-bottom:24px;'>" +
               detailRow("🏛️", "Resource", resourceName) +
               (location != null && !location.isBlank() ? detailRow("📍", "Location", location) : "") +
               detailRow("📅", "Start Time", start != null ? start.format(FMT) : "—") +
               detailRow("⏰", "End Time", end != null ? end.format(FMT) : "—") +
               (purpose != null && !purpose.isBlank() ? detailRow("📝", "Purpose", purpose) : "") +
               "</div>" +

               "<p style='color:#94a3b8;font-size:13px;margin:0;'>Please arrive on time. " +
               "If you need to cancel, you can do so from the Smart Campus portal.</p>" +
               "</td></tr>" +

               footer() +
               "</table></td></tr></table></body></html>";
    }

    private String buildBookingRejectedHtml(String username, String resourceName,
                                             LocalDateTime start, LocalDateTime end,
                                             String reason) {
        return "<!DOCTYPE html><html><head><meta charset='UTF-8'></head><body style='" +
               "margin:0;padding:0;background:#0a0f1e;font-family:Arial,sans-serif;'>" +
               "<table width='100%' cellpadding='0' cellspacing='0' style='background:#0a0f1e;padding:40px 0;'>" +
               "<tr><td align='center'>" +
               "<table width='600' cellpadding='0' cellspacing='0' style='" +
               "background:#0d1426;border-radius:16px;border:1px solid #ef444422;overflow:hidden;'>" +

               // Header
               "<tr><td style='background:linear-gradient(135deg,#ef444415,#0d1426);padding:40px 40px 30px;" +
               "border-bottom:1px solid #ef444422;text-align:center;'>" +
               "<div style='width:64px;height:64px;background:#ef444415;border:2px solid #ef444444;" +
               "border-radius:50%;margin:0 auto 16px;font-size:28px;line-height:64px;text-align:center;'>❌</div>" +
               "<h1 style='color:#f87171;font-size:24px;margin:0 0 8px;font-weight:700;'>Booking Not Approved</h1>" +
               "<p style='color:#94a3b8;margin:0;font-size:14px;'>Your reservation request was declined</p>" +
               "</td></tr>" +

               // Body
               "<tr><td style='padding:32px 40px;'>" +
               "<p style='color:#e2e8f0;font-size:16px;margin:0 0 24px;'>Hi <strong style='color:#f87171;'>" +
               escHtml(username) + "</strong>,</p>" +
               "<p style='color:#94a3b8;font-size:14px;margin:0 0 24px;line-height:1.6;'>" +
               "Unfortunately, your booking request for <strong style='color:#e2e8f0;'>" +
               escHtml(resourceName) + "</strong> has been <strong style='color:#f87171;'>rejected</strong>.</p>" +

               "<div style='background:#0a0f1e;border:1px solid #ef444422;border-radius:12px;padding:24px;margin-bottom:24px;'>" +
               detailRow("🏛️", "Resource", resourceName) +
               detailRow("📅", "Requested Start", start != null ? start.format(FMT) : "—") +
               detailRow("⏰", "Requested End", end != null ? end.format(FMT) : "—") +
               "<div style='margin-top:16px;padding-top:16px;border-top:1px solid #ef444422;'>" +
               "<span style='color:#94a3b8;font-size:12px;font-weight:700;text-transform:uppercase;" +
               "letter-spacing:1px;'>Reason</span>" +
               "<p style='color:#f87171;font-size:14px;margin:8px 0 0;line-height:1.5;'>" +
               escHtml(reason != null ? reason : "No reason provided") + "</p></div>" +
               "</div>" +

               "<p style='color:#94a3b8;font-size:13px;margin:0;'>You may submit a new booking request " +
               "for a different time slot via the Smart Campus portal.</p>" +
               "</td></tr>" +

               footer() +
               "</table></td></tr></table></body></html>";
    }

    private String buildTicketResolvedHtml(String username, String ticketCode,
                                            String title, String location,
                                            String resolutionNotes) {
        return "<!DOCTYPE html><html><head><meta charset='UTF-8'></head><body style='" +
               "margin:0;padding:0;background:#0a0f1e;font-family:Arial,sans-serif;'>" +
               "<table width='100%' cellpadding='0' cellspacing='0' style='background:#0a0f1e;padding:40px 0;'>" +
               "<tr><td align='center'>" +
               "<table width='600' cellpadding='0' cellspacing='0' style='" +
               "background:#0d1426;border-radius:16px;border:1px solid #22c55e22;overflow:hidden;'>" +

               // Header
               "<tr><td style='background:linear-gradient(135deg,#22c55e15,#0d1426);padding:40px 40px 30px;" +
               "border-bottom:1px solid #22c55e22;text-align:center;'>" +
               "<div style='width:64px;height:64px;background:#22c55e15;border:2px solid #22c55e44;" +
               "border-radius:50%;margin:0 auto 16px;font-size:28px;line-height:64px;text-align:center;'>🔧</div>" +
               "<h1 style='color:#4ade80;font-size:24px;margin:0 0 8px;font-weight:700;'>Issue Resolved</h1>" +
               "<p style='color:#94a3b8;margin:0;font-size:14px;'>Your maintenance ticket has been fixed</p>" +
               "</td></tr>" +

               // Body
               "<tr><td style='padding:32px 40px;'>" +
               "<p style='color:#e2e8f0;font-size:16px;margin:0 0 24px;'>Hi <strong style='color:#4ade80;'>" +
               escHtml(username) + "</strong>,</p>" +
               "<p style='color:#94a3b8;font-size:14px;margin:0 0 24px;line-height:1.6;'>" +
               "Your reported issue has been <strong style='color:#4ade80;'>resolved</strong> by our maintenance team. " +
               "Here's a summary:</p>" +

               "<div style='background:#0a0f1e;border:1px solid #22c55e22;border-radius:12px;padding:24px;margin-bottom:24px;'>" +
               detailRow("🎫", "Ticket", ticketCode) +
               detailRow("📋", "Issue", title) +
               (location != null && !location.isBlank() ? detailRow("📍", "Location", location) : "") +
               (resolutionNotes != null && !resolutionNotes.isBlank() ?
                   "<div style='margin-top:16px;padding-top:16px;border-top:1px solid #22c55e22;'>" +
                   "<span style='color:#94a3b8;font-size:12px;font-weight:700;text-transform:uppercase;" +
                   "letter-spacing:1px;'>Resolution Notes</span>" +
                   "<p style='color:#4ade80;font-size:14px;margin:8px 0 0;line-height:1.5;'>" +
                   escHtml(resolutionNotes) + "</p></div>" : "") +
               "</div>" +

               "<p style='color:#94a3b8;font-size:13px;margin:0;'>If the issue persists, you can reopen " +
               "the ticket or raise a new one through the Smart Campus portal.</p>" +
               "</td></tr>" +

               footer() +
               "</table></td></tr></table></body></html>";
    }

    // ─── shared helpers ───────────────────────────────────────────────────────

    private String buildTicketAssignedHtml(String technicianName, String ticketCode,
                                            String title, String location,
                                            String priority, String reporterName) {
        return "<!DOCTYPE html><html><head><meta charset='UTF-8'></head><body style='" +
               "margin:0;padding:0;background:#0a0f1e;font-family:Arial,sans-serif;'>" +
               "<table width='100%' cellpadding='0' cellspacing='0' style='background:#0a0f1e;padding:40px 0;'>" +
               "<tr><td align='center'>" +
               "<table width='600' cellpadding='0' cellspacing='0' style='" +
               "background:#0d1426;border-radius:16px;border:1px solid #00e5ff22;overflow:hidden;'>" +
               "<tr><td style='background:linear-gradient(135deg,#00e5ff15,#0d1426);padding:40px 40px 30px;" +
               "border-bottom:1px solid #00e5ff22;text-align:center;'>" +
               "<div style='width:64px;height:64px;background:#00e5ff15;border:2px solid #00e5ff44;" +
               "border-radius:50%;margin:0 auto 16px;font-size:28px;line-height:64px;text-align:center;'>📋</div>" +
               "<h1 style='color:#00e5ff;font-size:24px;margin:0 0 8px;font-weight:700;'>Ticket Assigned to You</h1>" +
               "<p style='color:#94a3b8;margin:0;font-size:14px;'>A new incident has been dispatched to you</p>" +
               "</td></tr>" +
               "<tr><td style='padding:32px 40px;'>" +
               "<p style='color:#e2e8f0;font-size:16px;margin:0 0 24px;'>Hi <strong style='color:#00e5ff;'>" +
               escHtml(technicianName) + "</strong>,</p>" +
               "<p style='color:#94a3b8;font-size:14px;margin:0 0 24px;line-height:1.6;'>" +
               "You have been assigned a new maintenance ticket. Please review the details below and begin working at your earliest convenience.</p>" +
               "<div style='background:#0a0f1e;border:1px solid #00e5ff22;border-radius:12px;padding:24px;margin-bottom:24px;'>" +
               detailRow("🎫", "Ticket", ticketCode) +
               detailRow("📋", "Issue", title) +
               (location != null && !location.isBlank() ? detailRow("📍", "Location", location) : "") +
               detailRow("⚡", "Priority", priority) +
               (reporterName != null && !reporterName.isBlank() ? detailRow("👤", "Reported By", reporterName) : "") +
               "</div>" +
               "<p style='color:#94a3b8;font-size:13px;margin:0;'>Log in to the Smart Campus portal to view full details and update the ticket status.</p>" +
               "</td></tr>" +
               footer() +
               "</table></td></tr></table></body></html>";
    }

    private String detailRow(String icon, String label, String value) {
        return "<div style='display:flex;align-items:flex-start;margin-bottom:12px;'>" +
               "<span style='width:28px;font-size:16px;flex-shrink:0;'>" + icon + "</span>" +
               "<div><span style='color:#94a3b8;font-size:11px;font-weight:700;text-transform:uppercase;" +
               "letter-spacing:1px;display:block;'>" + label + "</span>" +
               "<span style='color:#e2e8f0;font-size:14px;'>" + escHtml(value) + "</span></div></div>";
    }

    private String footer() {
        return "<tr><td style='padding:24px 40px;border-top:1px solid #1e293b;text-align:center;'>" +
               "<p style='color:#475569;font-size:12px;margin:0;'>" +
               "This is an automated notification from <strong style='color:#64748b;'>Smart Campus</strong>. " +
               "Please do not reply to this email.</p>" +
               "</td></tr>";
    }

    private String escHtml(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;");
    }
}
