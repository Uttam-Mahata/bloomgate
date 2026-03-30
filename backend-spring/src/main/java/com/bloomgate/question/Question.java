package com.bloomgate.question;

import com.bloomgate.common.QuestionOptionListConverter;
import com.bloomgate.common.StringListConverter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * JPA entity representing a single exam question stored in the H2 database.
 * Complex fields (tags, options) are serialised as JSON strings via custom
 * {@link AttributeConverter} implementations.
 */
@Entity
@Table(name = "questions")
public class Question {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private String id;

    @Column(name = "text", nullable = false, columnDefinition = "TEXT")
    private String text;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private QuestionType type;

    @Enumerated(EnumType.STRING)
    @Column(name = "complexity", nullable = false)
    private QuestionComplexity complexity;

    @Column(name = "weight", nullable = false)
    private int weight;

    @Column(name = "subject")
    private String subject;

    @Column(name = "topic")
    private String topic;

    /** Stored as a JSON array string, e.g. '["search","algorithms"]' */
    @Convert(converter = StringListConverter.class)
    @Column(name = "tags", columnDefinition = "TEXT")
    private List<String> tags;

    /** Stored as a JSON array string representing the list of {@link QuestionOption} objects. */
    @Convert(converter = QuestionOptionListConverter.class)
    @Column(name = "options", columnDefinition = "TEXT")
    private List<QuestionOption> options;

    @Column(name = "answer", columnDefinition = "TEXT")
    private String answer;

    @Column(name = "explanation", columnDefinition = "TEXT")
    private String explanation;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "is_active", nullable = false)
    @JsonProperty("isActive")
    private boolean isActive;

    @Column(name = "version", nullable = false)
    private int version;

    public Question() {
        this.id = UUID.randomUUID().toString();
        this.tags = new ArrayList<>();
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
        this.createdBy = "admin";
        this.isActive = true;
        this.version = 1;
        this.weight = 1;
        this.type = QuestionType.SHORT_ANSWER;
        this.complexity = QuestionComplexity.MEDIUM;
    }

    // ── Getters & Setters ──────────────────────────────────────────────────────

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    public QuestionType getType() { return type; }
    public void setType(QuestionType type) { this.type = type; }

    public QuestionComplexity getComplexity() { return complexity; }
    public void setComplexity(QuestionComplexity complexity) { this.complexity = complexity; }

    public int getWeight() { return weight; }
    public void setWeight(int weight) { this.weight = weight; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }

    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags != null ? tags : new ArrayList<>(); }

    public List<QuestionOption> getOptions() { return options; }
    public void setOptions(List<QuestionOption> options) { this.options = options; }

    public String getAnswer() { return answer; }
    public void setAnswer(String answer) { this.answer = answer; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    @JsonProperty("isActive")
    public boolean getIsActive() { return isActive; }

    @JsonProperty("isActive")
    public void setIsActive(boolean isActive) { this.isActive = isActive; }

    public int getVersion() { return version; }
    public void setVersion(int version) { this.version = version; }

    @JsonIgnore
    public String getBloomKey() { return id + ":" + version; }
}

