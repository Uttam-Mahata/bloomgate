package com.bloomgate.email;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/email")
public class EmailController {

    private final EmailService emailService;

    public EmailController(EmailService emailService) {
        this.emailService = emailService;
    }

    @PostMapping("/send")
    public Map<String, Object> sendEmail(@RequestBody Map<String, Object> body) {
        String to = (String) body.get("to");
        String subject = (String) body.get("subject");
        String html = (String) body.get("html");
        boolean result = emailService.sendEmail(to, subject, html);
        return Map.of("success", result);
    }

    @PostMapping("/distribute")
    public List<Map<String, Object>> distributeExam(@RequestBody Map<String, Object> body) {
        String examTitle = (String) body.get("examTitle");
        String pdfHtml = (String) body.get("pdfHtml");
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> colleges = (List<Map<String, Object>>) body.get("colleges");
        return emailService.distributeExamToColleges(examTitle, pdfHtml, colleges);
    }

    @PostMapping("/notify-modification")
    public List<Map<String, Object>> notifyModification(@RequestBody Map<String, Object> body) {
        String examTitle = (String) body.get("examTitle");
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> modifications = (List<Map<String, Object>>) body.get("modifications");
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> colleges = (List<Map<String, Object>>) body.get("colleges");
        return emailService.sendModificationNotification(examTitle, modifications, colleges);
    }
}
