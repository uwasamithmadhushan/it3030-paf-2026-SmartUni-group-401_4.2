package com.example.demo.dto;

import com.example.demo.models.ResourceType;
import com.example.demo.models.ResourceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResourceRequest {

    @NotBlank(message = "Resource code is required")
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
    private String availableFrom;

    @NotBlank(message = "Available to time is required")
    private String availableTo;

    @NotNull(message = "Status is required")
    private ResourceStatus status;
}
