package com.example.demo.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Comment {
    private String id = UUID.randomUUID().toString();
    private String userId;
    private String username;
    private String text;
    private LocalDateTime timestamp = LocalDateTime.now();
}
