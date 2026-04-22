package com.example.demo.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "resources")
public class Resource {

    @Id
    private String id;

    @NotBlank(message = "Resource code is required")
    @Indexed(unique = true)
    private String resourceCode;

    @NotBlank(message = "Resource name is required")
    private String resourceName;

    @NotNull(message = "Resource type is required")
    private ResourceType resourceType;

    @Min(value = 0, message = "Capacity must be at least 0")
    private int capacity;

    @NotBlank(message = "Building is required")
    private String building;

    @NotBlank(message = "Floor is required")
    private String floor;

    @NotBlank(message = "Room number is required")
    private String roomNumber;

    private String description;

    @NotBlank(message = "Available from time is required")
    private String availableFrom; // format: "HH:mm"

    @NotBlank(message = "Available to time is required")
    private String availableTo;   // format: "HH:mm"

    @NotNull(message = "Status is required")
    private ResourceStatus status;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
