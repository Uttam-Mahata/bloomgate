package com.bloomgate.exam;

import com.fasterxml.jackson.annotation.JsonProperty;

public class College {
    private String id;
    private String name;
    private String email;
    private String address;
    private String contactPerson;
    private String phone;
    @JsonProperty("isActive")
    private boolean isActive;

    public College() {
        this.isActive = true;
    }

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
    public boolean isActive() { return isActive; }

    @JsonProperty("isActive")
    public void setActive(boolean active) { isActive = active; }
}
