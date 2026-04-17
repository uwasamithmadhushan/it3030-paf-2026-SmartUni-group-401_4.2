package com.example.demo.dto;

import com.example.demo.models.TicketPriority;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketRequest {
    private String title;
    private String description;
    private String category;
    private TicketPriority priority;
}
