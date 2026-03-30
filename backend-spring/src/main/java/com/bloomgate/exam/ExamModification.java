package com.bloomgate.exam;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class ExamModification {
    private String id;
    private Instant timestamp;
    private String questionId;
    private ChangeType changeType;
    private String description;
    private List<String> syncedToColleges;

    public ExamModification() {
        this.id = UUID.randomUUID().toString();
        this.timestamp = Instant.now();
        this.syncedToColleges = new ArrayList<>();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }

    public String getQuestionId() { return questionId; }
    public void setQuestionId(String questionId) { this.questionId = questionId; }

    public ChangeType getChangeType() { return changeType; }
    public void setChangeType(ChangeType changeType) { this.changeType = changeType; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public List<String> getSyncedToColleges() { return syncedToColleges; }
    public void setSyncedToColleges(List<String> syncedToColleges) { this.syncedToColleges = syncedToColleges; }
}
