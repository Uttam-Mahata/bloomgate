package com.bloomgate.exam;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum ExamStatus {
    DRAFT("draft"),
    PUBLISHED("published"),
    DISTRIBUTED("distributed"),
    MODIFIED("modified"),
    COMPLETED("completed");

    private final String value;

    ExamStatus(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static ExamStatus fromValue(String value) {
        for (ExamStatus s : values()) {
            if (s.value.equalsIgnoreCase(value)) return s;
        }
        throw new IllegalArgumentException("Unknown status: " + value);
    }
}
