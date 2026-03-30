package com.bloomgate.email;

import jakarta.persistence.*;

import java.time.Instant;

/**
 * JPA entity that records every email dispatch attempt made by the
 * {@link EmailService}.
 *
 * <p>This provides an audit trail of all outbound communications
 * (distributions, modification alerts, ad-hoc sends) for operational
 * visibility and debugging.</p>
 */
@Entity
@Table(name = "email_logs",
       indexes = @Index(name = "idx_email_log_recipient", columnList = "recipient"))
public class EmailLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "recipient", nullable = false)
    private String recipient;

    @Column(name = "subject", nullable = false)
    private String subject;

    /** "sent" or "failed" */
    @Column(name = "status", nullable = false, length = 10)
    private String status;

    @Column(name = "sent_at", nullable = false)
    private Instant sentAt;

    @Column(name = "email_type", length = 30)
    private String emailType;

    public EmailLog() {}

    public EmailLog(String recipient, String subject, String status,
                    Instant sentAt, String emailType) {
        this.recipient = recipient;
        this.subject = subject;
        this.status = status;
        this.sentAt = sentAt;
        this.emailType = emailType;
    }

    // ── Getters & Setters ──────────────────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getRecipient() { return recipient; }
    public void setRecipient(String recipient) { this.recipient = recipient; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Instant getSentAt() { return sentAt; }
    public void setSentAt(Instant sentAt) { this.sentAt = sentAt; }

    public String getEmailType() { return emailType; }
    public void setEmailType(String emailType) { this.emailType = emailType; }
}
