package com.bloomgate.exam;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

import java.util.UUID;

/**
 * JPA entity representing a college that can receive distributed exam papers.
 */
@Entity
@Table(name = "colleges")
public class College {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private String id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "email", nullable = false)
    private String email;

    @Column(name = "address")
    private String address;

    @Column(name = "contact_person")
    private String contactPerson;

    @Column(name = "phone")
    private String phone;

    @Column(name = "is_active", nullable = false)
    @JsonProperty("isActive")
    private boolean isActive;

    public College() {
        this.id = UUID.randomUUID().toString();
        this.isActive = true;
    }

    // ── Getters & Setters ──────────────────────────────────────────────────────

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getContactPerson() { return contactPerson; }
    public void setContactPerson(String contactPerson) { this.contactPerson = contactPerson; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    @JsonProperty("isActive")
    public boolean getIsActive() { return isActive; }

    @JsonProperty("isActive")
    public void setIsActive(boolean isActive) { this.isActive = isActive; }
}
