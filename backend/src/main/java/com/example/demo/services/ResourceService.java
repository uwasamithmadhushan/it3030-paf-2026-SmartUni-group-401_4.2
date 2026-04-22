package com.example.demo.services;

import com.example.demo.dto.ResourceRequest;
import com.example.demo.dto.ResourceResponse;
import com.example.demo.models.ResourceStatus;
import com.example.demo.models.ResourceType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ResourceService {
    ResourceResponse createResource(ResourceRequest request);
    ResourceResponse updateResource(String id, ResourceRequest request);
    ResourceResponse updateStatus(String id, ResourceStatus status);
    void deleteResource(String id);
    ResourceResponse getResourceById(String id);
    Page<ResourceResponse> getAllResources(String keyword, ResourceType type, String building, Integer minCapacity, ResourceStatus status, Pageable pageable);
}
