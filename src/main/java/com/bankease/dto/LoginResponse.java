package com.bankease.dto;

public class LoginResponse {

    private String token;
    private String tokenType;
    private Long userid;
    private String name;
    private String email;

    public LoginResponse(String token, Long userid, String name, String email) {
        this.token = token;
        this.tokenType = "Bearer";
        this.userid = userid;
        this.name = name;
        this.email = email;
    }

    public String getToken() {
        return token;
    }

    public String getTokenType() {
        return tokenType;
    }

    public Long getUserid() {
        return userid;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }
}