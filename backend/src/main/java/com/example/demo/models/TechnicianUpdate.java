package com.example.demo.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TechnicianUpdate {
    private String technicianId;
    private String note;
    private LocalDateTime timestamp;
}
