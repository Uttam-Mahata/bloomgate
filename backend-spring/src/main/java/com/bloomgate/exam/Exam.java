package com.bloomgate.exam;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

public class Exam {
    private String id;
    private String title;
    private String subject;
    private String description;
    private String instructions;
    private int duration;
    private int totalMarks;
    private int passingMarks;
    private List<ExamSection> sections;
    private ExamStatus status;
    private Instant createdAt;
    private Instant updatedAt;
    private String createdBy;
    private Instant publishedAt;
    private List<ExamDistribution> distributions;
    private List<ExamModification> modifications;
    private int version;
    private String pdfUrl;
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

    @com.fasterxml.jackson.annotation.JsonIgnore
    public List<String> getAllQuestionIds() {
        return sections.stream()
                .flatMap(s -> s.getQuestionIds().stream())
                .collect(Collectors.toList());
    }

    @com.fasterxml.jackson.annotation.JsonIgnore
    public String getBloomKey() {
        return "exam:" + id + ":v" + version;
    }

    @com.fasterxml.jackson.annotation.JsonIgnore
    public List<String> getModificationIds() {
        return modifications.stream().map(ExamModification::getId).collect(Collectors.toList());
    }
}
