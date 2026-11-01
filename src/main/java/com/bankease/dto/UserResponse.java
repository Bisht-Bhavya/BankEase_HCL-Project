package com.bankease.dto;

import java.time.LocalDate;

public class UserResponse {

    private Long id;
    private String name;
    private String email;
    private String phone;
    private LocalDate dateOfBirth;

    public UserResponse(Long id, String name, String email,String phone, LocalDate dateOfBirth) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.dateOfBirth = dateOfBirth;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getPhone() {
        return phone;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }
}