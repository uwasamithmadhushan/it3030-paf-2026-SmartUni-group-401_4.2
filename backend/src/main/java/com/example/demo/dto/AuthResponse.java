package com.example.demo.dto;

import com.example.demo.models.UserRole;
import lombok.Data;

@Data
public class AuthResponse {

    private String id;
    private String token;
    private String username;
    private String email;
    private UserRole role;
    private boolean pending;

    public AuthResponse(String id, String token, String username, String email, UserRole role) {
        this.id = id;
        this.token = token;
        this.username = username;
        this.email = email;
        this.role = role;
        this.pending = false;
    }

    public AuthResponse(String id, String token, String username, String email, UserRole role, boolean pending) {
        this.id = id;
        this.token = token;
        this.username = username;
        this.email = email;
        this.role = role;
        this.pending = pending;
    }
}
