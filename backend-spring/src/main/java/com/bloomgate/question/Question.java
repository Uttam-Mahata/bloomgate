package com.bloomgate.question;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class Question {
    private String id;
    private String text;
    private QuestionType type;
    private QuestionComplexity complexity;
    private int weight;
    private String subject;
    private String topic;
    private List<String> tags;
    private List<QuestionOption> options;
    private String answer;
    private String explanation;
    private String imageUrl;
    private Instant createdAt;
    private Instant updatedAt;
    private String createdBy;
    @JsonProperty("isActive")
    private boolean isActive;
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
    public boolean isActive() { return isActive; }

    @JsonProperty("isActive")
    public void setActive(boolean active) { isActive = active; }

    public int getVersion() { return version; }
    public void setVersion(int version) { this.version = version; }

    @com.fasterxml.jackson.annotation.JsonIgnore
    public String getBloomKey() {
        return id + ":" + version;
    }
}
