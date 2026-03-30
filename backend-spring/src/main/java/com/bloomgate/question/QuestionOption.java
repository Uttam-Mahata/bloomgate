package com.bloomgate.question;

import com.fasterxml.jackson.annotation.JsonProperty;

public class QuestionOption {
    private String id;
    private String text;
    @JsonProperty("isCorrect")
    private boolean isCorrect;

    public QuestionOption() {}

    public QuestionOption(String id, String text, boolean isCorrect) {
        this.id = id;
        this.text = text;
        this.isCorrect = isCorrect;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    @JsonProperty("isCorrect")
    public boolean getIsCorrect() { return isCorrect; }

    @JsonProperty("isCorrect")
    public void setIsCorrect(boolean isCorrect) { this.isCorrect = isCorrect; }
}
