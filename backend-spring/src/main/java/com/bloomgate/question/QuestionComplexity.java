package com.bloomgate.question;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum QuestionComplexity {
    EASY("easy"),
    MEDIUM("medium"),
    HARD("hard"),
    EXPERT("expert");

    private final String value;

    QuestionComplexity(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static QuestionComplexity fromValue(String value) {
        for (QuestionComplexity c : values()) {
            if (c.value.equalsIgnoreCase(value)) return c;
        }
        throw new IllegalArgumentException("Unknown complexity: " + value);
    }
}
