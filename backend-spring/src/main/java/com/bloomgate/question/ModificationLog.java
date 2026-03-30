package com.bloomgate.question;

import jakarta.persistence.*;

import java.time.Instant;

/**
 * JPA entity that records every create / update / delete operation on a
 * {@link Question}.  Used by the Bloom-filter sync mechanism to identify
 * which questions have changed since a given point in time.
 */
@Entity
@Table(name = "modification_logs",
       indexes = @Index(name = "idx_mod_log_question_id", columnList = "question_id"))
public class ModificationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "question_id", nullable = false)
    private String questionId;

    @Column(name = "timestamp", nullable = false)
    private Instant timestamp;

    @Column(name = "action", nullable = false, length = 20)
    private String action;

    public ModificationLog() {}

    public ModificationLog(String questionId, Instant timestamp, String action) {
        this.questionId = questionId;
        this.timestamp = timestamp;
        this.action = action;
    }

    // ── Getters & Setters ──────────────────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getQuestionId() { return questionId; }
    public void setQuestionId(String questionId) { this.questionId = questionId; }

    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
}
