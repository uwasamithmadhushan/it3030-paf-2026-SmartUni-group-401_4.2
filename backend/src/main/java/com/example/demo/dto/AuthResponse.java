package com.example.demo.dto;

import com.example.demo.models.UserRole;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {

    private String token;
    private String username;
    private String email;
    private UserRole role;
}
