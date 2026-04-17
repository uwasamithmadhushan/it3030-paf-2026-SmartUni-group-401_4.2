package com.example.demo.dto;

import com.example.demo.models.Attachment;
import com.example.demo.models.TicketPriority;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketRequest {
    private String title;
    private String description;
    private String category;
    private String resourceId;
    private String location;
    private String contactDetails;
    private TicketPriority priority;
    private List<Attachment> attachments;
}
