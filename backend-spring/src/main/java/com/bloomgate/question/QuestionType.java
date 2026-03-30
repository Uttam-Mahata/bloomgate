package com.bloomgate.question;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum QuestionType {
    MULTIPLE_CHOICE("multiple_choice"),
    SHORT_ANSWER("short_answer"),
    LONG_ANSWER("long_answer"),
    TRUE_FALSE("true_false"),
    FILL_BLANK("fill_blank");

    private final String value;

    QuestionType(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static QuestionType fromValue(String value) {
        for (QuestionType t : values()) {
            if (t.value.equalsIgnoreCase(value)) return t;
        }
        throw new IllegalArgumentException("Unknown type: " + value);
    }
}
