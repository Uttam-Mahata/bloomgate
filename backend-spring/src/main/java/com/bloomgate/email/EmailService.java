package com.bloomgate.email;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.*;

/**
 * Service layer for the Email module.
 *
 * <p>Contains all email-dispatch and notification business logic.
 * Each outbound message is recorded via {@link EmailLogRepository},
 * creating a full audit trail without mixing persistence concerns
 * into the business logic.</p>
 */
@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final EmailLogRepository emailLogRepository;

    public EmailService(EmailLogRepository emailLogRepository) {
        this.emailLogRepository = emailLogRepository;
    }

    // ── Core send ─────────────────────────────────────────────────────────────

    @Transactional
    public boolean sendEmail(String to, String subject, String html) {
        return sendEmail(to, subject, html, "generic");
    }

    @Transactional
    public boolean sendEmail(String to, String subject, String html, String emailType) {
        boolean success;
        try {
            logger.info("Sending [{}] email to: {} | Subject: {}", emailType, to, subject);
            // Simulate external SMTP call (replace with JavaMail / SendGrid in production)
            Thread.sleep(50);
            logger.info("Email dispatched successfully to {}", to);
            success = true;
        } catch (Exception e) {
            logger.error("Failed to send email to {}: {}", to, e.getMessage());
            success = false;
        }

        emailLogRepository.save(new EmailLog(
            to, subject, success ? "sent" : "failed", Instant.now(), emailType));

        return success;
    }

    // ── Distribution ──────────────────────────────────────────────────────────

    @Transactional
    public List<Map<String, Object>> distributeExamToColleges(
            String examTitle, String pdfHtml, List<Map<String, Object>> colleges) {

        List<Map<String, Object>> results = new ArrayList<>();
        String now = Instant.now().toString();

        for (Map<String, Object> college : colleges) {
            String name  = (String) college.get("name");
            String email = (String) college.get("email");
            String id    = (String) college.get("id");

            boolean success = sendEmail(email,
                "[BloomGate] Exam Distribution: " + examTitle,
                buildDistributionEmail(examTitle, name),
                "distribution");

            Map<String, Object> result = new LinkedHashMap<>();
            result.put("collegeId",    id);
            result.put("collegeName",  name);
            result.put("email",        email);
            result.put("status",       success ? "sent" : "failed");
            result.put("timestamp",    now);
            results.add(result);
        }
        return results;
    }

    // ── Modification notification ─────────────────────────────────────────────

    @Transactional
    public List<Map<String, Object>> sendModificationNotification(
            String examTitle,
            List<Map<String, Object>> modifications,
            List<Map<String, Object>> colleges) {

        List<Map<String, Object>> results = new ArrayList<>();
        String now = Instant.now().toString();

        StringBuilder modList = new StringBuilder();
        for (Map<String, Object> m : modifications) {
            modList.append("<li><strong>")
                   .append(m.get("changeType").toString().toUpperCase())
                   .append(":</strong> ").append(m.get("description"))
                   .append("</li>");
        }

        for (Map<String, Object> college : colleges) {
            String name  = (String) college.get("name");
            String email = (String) college.get("email");
            String id    = (String) college.get("id");

            boolean success = sendEmail(email,
                "[URGENT] Exam Modified: " + examTitle,
                buildModificationEmail(examTitle, name, modList.toString()),
                "modification");

            Map<String, Object> result = new LinkedHashMap<>();
            result.put("collegeId",    id);
            result.put("collegeName",  name);
            result.put("email",        email);
            result.put("status",       success ? "sent" : "failed");
            result.put("timestamp",    now);
            results.add(result);
        }
        return results;
    }

    // ── Email templates ───────────────────────────────────────────────────────

    private String buildDistributionEmail(String examTitle, String collegeName) {
        String date = LocalDate.now(ZoneOffset.UTC).toString();
        int year    = LocalDate.now(ZoneOffset.UTC).getYear();
        return """
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', sans-serif; line-height:1.6; color:#333; max-width:600px; margin:0 auto; padding:20px; }
    .header { background: linear-gradient(135deg,#1a365d,#2d3748); color:#fff; padding:30px; border-radius:10px 10px 0 0; text-align:center; }
    .content { background:#f7fafc; padding:30px; border:1px solid #e2e8f0; border-top:none; }
    .footer { text-align:center; padding:20px; color:#718096; font-size:12px; background:#edf2f7; border-radius:0 0 10px 10px; }
  </style>
</head>
<body>
  <div class="header"><h1>🎓 BloomGate Exam System</h1><p>Exam Paper Distribution</p></div>
  <div class="content">
    <h2>Dear %s,</h2>
    <p>An examination paper has been distributed to your institution: <strong>%s</strong> on %s.</p>
    <p>Please store the document securely and follow institutional distribution protocols.</p>
  </div>
  <div class="footer"><p>© %d BloomGate. All rights reserved.</p></div>
</body>
</html>
""".formatted(collegeName, examTitle, date, year);
    }

    private String buildModificationEmail(String examTitle, String collegeName, String modsList) {
        int year = LocalDate.now(ZoneOffset.UTC).getYear();
        return """
<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;padding:20px;">
  <div style="background:#dc2626;color:#fff;padding:30px;text-align:center;"><h1>⚠️ Exam Modification Alert</h1></div>
  <div style="padding:30px;">
    <h2>Dear %s,</h2>
    <p>The following modifications have been made to: <strong>%s</strong></p>
    <ul>%s</ul>
    <p><strong>Action Required:</strong> Download the updated exam paper from the BloomGate portal immediately.</p>
  </div>
  <div style="text-align:center;padding:20px;font-size:12px;color:#888;">© %d BloomGate. All rights reserved.</div>
</body>
</html>
""".formatted(collegeName, examTitle, modsList, year);
    }
}
