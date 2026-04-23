package com.example.demo.dto;

import com.example.demo.models.ResourceStatus;
import com.example.demo.models.ResourceType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResourceResponse {
    private String id;
    private String resourceCode;
    private String resourceName;
    private ResourceType resourceType;
    private int capacity;
    private String building;
    private String floor;
    private String roomNumber;
    private String description;
    private String availableFrom;
    private String availableTo;
    private ResourceStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
