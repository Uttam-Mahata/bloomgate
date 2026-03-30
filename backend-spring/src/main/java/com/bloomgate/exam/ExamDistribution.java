package com.bloomgate.exam;

import java.time.Instant;

public class ExamDistribution {
    private String collegeId;
    private String collegeName;
    private String email;
    private Instant distributedAt;
    private Instant syncedAt;
    private String bloomFilterHash;

    public ExamDistribution() {}

    public ExamDistribution(String collegeId, String collegeName, String email) {
        this.collegeId = collegeId;
        this.collegeName = collegeName;
        this.email = email;
        this.distributedAt = Instant.now();
    }

    public String getCollegeId() { return collegeId; }
    public void setCollegeId(String collegeId) { this.collegeId = collegeId; }

    public String getCollegeName() { return collegeName; }
    public void setCollegeName(String collegeName) { this.collegeName = collegeName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Instant getDistributedAt() { return distributedAt; }
    public void setDistributedAt(Instant distributedAt) { this.distributedAt = distributedAt; }

    public Instant getSyncedAt() { return syncedAt; }
    public void setSyncedAt(Instant syncedAt) { this.syncedAt = syncedAt; }

    public String getBloomFilterHash() { return bloomFilterHash; }
    public void setBloomFilterHash(String bloomFilterHash) { this.bloomFilterHash = bloomFilterHash; }
}
