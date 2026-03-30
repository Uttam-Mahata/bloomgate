package com.bloomgate.exam;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum ChangeType {
    ADD("add"),
    REMOVE("remove"),
    UPDATE("update");

    private final String value;

    ChangeType(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static ChangeType fromValue(String value) {
        for (ChangeType ct : values()) {
            if (ct.value.equalsIgnoreCase(value)) return ct;
        }
        throw new IllegalArgumentException("Unknown change type: " + value);
    }
}
