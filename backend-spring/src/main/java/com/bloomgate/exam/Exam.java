package com.bloomgate.exam;

import com.bloomgate.common.ExamDistributionListConverter;
import com.bloomgate.common.ExamModificationListConverter;
import com.bloomgate.common.ExamSectionListConverter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * JPA entity representing a complete exam paper.
 *
 * <p>Complex nested objects (sections, distributions, modifications) are
 * stored as JSON strings in dedicated TEXT columns and converted via custom
 * {@link AttributeConverter} implementations in the {@code common} package.</p>
 */
@Entity
@Table(name = "exams")
public class Exam {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private String id;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "subject", nullable = false)
    private String subject;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "instructions", columnDefinition = "TEXT")
    private String instructions;

    @Column(name = "duration", nullable = false)
    private int duration;

    @Column(name = "total_marks", nullable = false)
    private int totalMarks;

    @Column(name = "passing_marks", nullable = false)
    private int passingMarks;

    /** JSON-serialised list of {@link ExamSection} objects. */
    @Convert(converter = ExamSectionListConverter.class)
    @Column(name = "sections", columnDefinition = "TEXT")
    private List<ExamSection> sections;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ExamStatus status;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "published_at")
    private Instant publishedAt;

    /** JSON-serialised list of {@link ExamDistribution} objects. */
    @Convert(converter = ExamDistributionListConverter.class)
    @Column(name = "distributions", columnDefinition = "TEXT")
    private List<ExamDistribution> distributions;

    /** JSON-serialised list of {@link ExamModification} objects. */
    @Convert(converter = ExamModificationListConverter.class)
    @Column(name = "modifications", columnDefinition = "TEXT")
    private List<ExamModification> modifications;

    @Column(name = "version", nullable = false)
    private int version;

    @Column(name = "pdf_url")
    private String pdfUrl;

    @Column(name = "answer_key_pdf_url")
    private String answerKeyPdfUrl;

    public Exam() {
        this.id = UUID.randomUUID().toString();
        this.status = ExamStatus.DRAFT;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
        this.createdBy = "admin";
        this.sections = new ArrayList<>();
        this.distributions = new ArrayList<>();
        this.modifications = new ArrayList<>();
        this.version = 1;
        this.duration = 60;
    }

    // ── Getters & Setters ──────────────────────────────────────────────────────

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getInstructions() { return instructions; }
    public void setInstructions(String instructions) { this.instructions = instructions; }

    public int getDuration() { return duration; }
    public void setDuration(int duration) { this.duration = duration; }

    public int getTotalMarks() { return totalMarks; }
    public void setTotalMarks(int totalMarks) { this.totalMarks = totalMarks; }

    public int getPassingMarks() { return passingMarks; }
    public void setPassingMarks(int passingMarks) { this.passingMarks = passingMarks; }

    public List<ExamSection> getSections() { return sections; }
    public void setSections(List<ExamSection> sections) {
        this.sections = sections != null ? sections : new ArrayList<>();
    }

    public ExamStatus getStatus() { return status; }
    public void setStatus(ExamStatus status) { this.status = status; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public Instant getPublishedAt() { return publishedAt; }
    public void setPublishedAt(Instant publishedAt) { this.publishedAt = publishedAt; }

    public List<ExamDistribution> getDistributions() { return distributions; }
    public void setDistributions(List<ExamDistribution> distributions) {
        this.distributions = distributions != null ? distributions : new ArrayList<>();
    }

    public List<ExamModification> getModifications() { return modifications; }
    public void setModifications(List<ExamModification> modifications) {
        this.modifications = modifications != null ? modifications : new ArrayList<>();
    }

    public int getVersion() { return version; }
    public void setVersion(int version) { this.version = version; }

    public String getPdfUrl() { return pdfUrl; }
    public void setPdfUrl(String pdfUrl) { this.pdfUrl = pdfUrl; }

    public String getAnswerKeyPdfUrl() { return answerKeyPdfUrl; }
    public void setAnswerKeyPdfUrl(String answerKeyPdfUrl) { this.answerKeyPdfUrl = answerKeyPdfUrl; }

    // ── Domain helpers (excluded from JSON) ───────────────────────────────────

    @JsonIgnore
    public List<String> getAllQuestionIds() {
        return sections.stream()
                .flatMap(s -> s.getQuestionIds().stream())
                .collect(Collectors.toList());
    }

    @JsonIgnore
    public String getBloomKey() { return "exam:" + id + ":v" + version; }

    @JsonIgnore
    public List<String> getModificationIds() {
        return modifications.stream().map(ExamModification::getId).collect(Collectors.toList());
    }
}
