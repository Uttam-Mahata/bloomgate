package com.bloomgate.exam;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class ExamSection {
    private String id;
    private String title;
    private String instructions;
    private List<String> questionIds;
    private int totalMarks;

    public ExamSection() {
        this.id = UUID.randomUUID().toString();
        this.questionIds = new ArrayList<>();
    }

    public ExamSection(String id, String title, String instructions, List<String> questionIds, int totalMarks) {
        this.id = id != null ? id : UUID.randomUUID().toString();
        this.title = title;
        this.instructions = instructions;
        this.questionIds = questionIds != null ? new ArrayList<>(questionIds) : new ArrayList<>();
        this.totalMarks = totalMarks;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getInstructions() { return instructions; }
    public void setInstructions(String instructions) { this.instructions = instructions; }

    public List<String> getQuestionIds() { return questionIds; }
    public void setQuestionIds(List<String> questionIds) {
        this.questionIds = questionIds != null ? questionIds : new ArrayList<>();
    }

    public int getTotalMarks() { return totalMarks; }
    public void setTotalMarks(int totalMarks) { this.totalMarks = totalMarks; }
}
