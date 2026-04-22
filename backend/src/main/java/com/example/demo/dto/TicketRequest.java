package com.example.demo.dto;

import com.example.demo.models.Attachment;
import com.example.demo.models.TicketPriority;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketRequest {
    @NotBlank
    @Size(min = 5, message = "Title must be at least 5 characters")
    private String title;
    
    @NotBlank
    @Size(min = 10, message = "Description must be at least 10 characters")
    private String description;
    
    @NotBlank
    private String category;
    
    private String resourceId;
    private String location;
    
    @NotBlank
    private String preferredContactName;
    
    @NotBlank
    @Email(message = "Invalid email format")
    private String preferredContactEmail;
    
    @NotBlank
    private String preferredContactPhone;
    
    @NotNull
    private TicketPriority priority;
    
    private List<Attachment> attachments;
}
