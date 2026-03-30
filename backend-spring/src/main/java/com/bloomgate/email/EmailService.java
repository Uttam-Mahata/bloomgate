package com.bloomgate.email;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    public boolean sendEmail(String to, String subject, String html) {
        try {
            logger.info("Sending email to: {}", to);
            logger.info("Subject: {}", subject);
            // Simulate email sending (replace with actual email provider in production)
            Thread.sleep(100);
            logger.info("Email sent successfully to {}", to);
            return true;
        } catch (Exception e) {
            logger.error("Failed to send email to {}: {}", to, e.getMessage());
            return false;
        }
    }

    public List<Map<String, Object>> distributeExamToColleges(
            String examTitle,
            String pdfHtml,
            List<Map<String, Object>> colleges) {

        List<Map<String, Object>> results = new ArrayList<>();
        String now = Instant.now().toString();

        for (Map<String, Object> college : colleges) {
            String collegeName = (String) college.get("name");
            String email = (String) college.get("email");
            String id = (String) college.get("id");

            String emailHtml = buildDistributionEmail(examTitle, collegeName);
            boolean success = sendEmail(email, "[BloomGate] Exam Distribution: " + examTitle, emailHtml);

            Map<String, Object> result = new LinkedHashMap<>();
            result.put("collegeId", id);
            result.put("collegeName", collegeName);
            result.put("email", email);
            result.put("status", success ? "sent" : "failed");
            result.put("timestamp", now);
            results.add(result);
        }
        return results;
    }

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
                   .append(":</strong> ")
                   .append(m.get("description"))
                   .append("</li>");
        }

        for (Map<String, Object> college : colleges) {
            String collegeName = (String) college.get("name");
            String email = (String) college.get("email");
            String id = (String) college.get("id");

            String emailHtml = buildModificationEmail(examTitle, collegeName, modList.toString());
            boolean success = sendEmail(email, "[URGENT] Exam Modified: " + examTitle, emailHtml);

            Map<String, Object> result = new LinkedHashMap<>();
            result.put("collegeId", id);
            result.put("collegeName", collegeName);
            result.put("email", email);
            result.put("status", success ? "sent" : "failed");
            result.put("timestamp", now);
            results.add(result);
        }
        return results;
    }

    private String buildDistributionEmail(String examTitle, String collegeName) {
        String date = LocalDate.now(ZoneOffset.UTC).toString();
        int year = LocalDate.now(ZoneOffset.UTC).getYear();
        return """
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #1a365d 0%, #2d3748 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
    .content { background: #f7fafc; padding: 30px; border: 1px solid #e2e8f0; border-top: none; }
    .footer { text-align: center; padding: 20px; color: #718096; font-size: 12px; background: #edf2f7; border-radius: 0 0 10px 10px; }
  </style>
</head>
<body>
  <div class="header"><h1>🎓 BloomGate Exam System</h1><p>Exam Paper Distribution</p></div>
  <div class="content">
    <h2>Dear %s,</h2>
    <p>An examination paper has been distributed: <strong>%s</strong> on %s.</p>
    <p>Please store the document securely.</p>
  </div>
  <div class="footer"><p>© %d BloomGate. All rights reserved.</p></div>
</body>
</html>
""".formatted(collegeName, examTitle, date, year);
    }

    private String buildModificationEmail(String examTitle, String collegeName, String modificationsList) {
        int year = LocalDate.now(ZoneOffset.UTC).getYear();
        return """
<!DOCTYPE html>
<html>
<body>
  <div style="background:#dc2626;color:white;padding:30px;text-align:center;"><h1>⚠️ Exam Modification Alert</h1></div>
  <div style="padding:30px;">
    <h2>Dear %s,</h2>
    <p>Modifications have been made to: <strong>%s</strong></p>
    <ul>%s</ul>
    <p><strong>Action Required:</strong> Download the updated exam paper from the BloomGate portal.</p>
  </div>
  <div style="text-align:center;padding:20px;font-size:12px;">© %d BloomGate. All rights reserved.</div>
</body>
</html>
""".formatted(collegeName, examTitle, modificationsList, year);
    }
}
