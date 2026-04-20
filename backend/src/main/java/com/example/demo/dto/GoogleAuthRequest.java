package com.example.demo.dto;

import lombok.Data;

@Data
public class GoogleAuthRequest {
    private String credential; // Google ID token from the frontend
}
