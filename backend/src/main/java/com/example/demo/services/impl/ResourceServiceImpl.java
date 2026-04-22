package com.example.demo.services.impl;

import com.example.demo.dto.ResourceRequest;
import com.example.demo.dto.ResourceResponse;
import com.example.demo.models.Resource;
import com.example.demo.models.ResourceStatus;
import com.example.demo.models.ResourceType;
import com.example.demo.repositories.ResourceRepository;
import com.example.demo.services.ResourceService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ResourceServiceImpl implements ResourceService {

    private final ResourceRepository resourceRepository;

    @Override
    public ResourceResponse createResource(ResourceRequest request) {
        if (resourceRepository.findByResourceCode(request.getResourceCode()).isPresent()) {
            throw new IllegalArgumentException("Resource code already exists: " + request.getResourceCode());
        }

        Resource resource = Resource.builder()
                .resourceCode(request.getResourceCode())
                .resourceName(request.getResourceName())
                .resourceType(request.getResourceType())
                .capacity(request.getCapacity())
                .building(request.getBuilding())
                .floor(request.getFloor())
                .roomNumber(request.getRoomNumber())
                .description(request.getDescription())
                .availableFrom(request.getAvailableFrom())
                .availableTo(request.getAvailableTo())
                .status(request.getStatus())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Resource savedResource = resourceRepository.save(resource);
        if (savedResource == null) {
            throw new RuntimeException("Critical failure: Data persistence returned null for resource " + resource.getResourceCode());
        }
        return mapToResponse(savedResource);
    }

    @Override
    public ResourceResponse updateResource(String id, ResourceRequest request) {
        Resource existing = resourceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Resource not found: " + id));

        existing.setResourceName(request.getResourceName());
        existing.setResourceType(request.getResourceType());
        existing.setCapacity(request.getCapacity());
        existing.setBuilding(request.getBuilding());
        existing.setFloor(request.getFloor());
        existing.setRoomNumber(request.getRoomNumber());
        existing.setDescription(request.getDescription());
        existing.setAvailableFrom(request.getAvailableFrom());
        existing.setAvailableTo(request.getAvailableTo());
        existing.setStatus(request.getStatus());
        existing.setUpdatedAt(LocalDateTime.now());

        Resource updatedResource = resourceRepository.save(existing);
        return mapToResponse(updatedResource);
    }

    @Override
    public ResourceResponse updateStatus(String id, ResourceStatus status) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Resource not found: " + id));
        
        resource.setStatus(status);
        resource.setUpdatedAt(LocalDateTime.now());
        
        Resource updated = resourceRepository.save(resource);
        return mapToResponse(updated);
    }

    @Override
    public void deleteResource(String id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Resource not found: " + id));
        
        resource.setStatus(ResourceStatus.INACTIVE);
        resource.setUpdatedAt(LocalDateTime.now());
        resourceRepository.save(resource);
    }

    @Override
    public ResourceResponse getResourceById(String id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Resource not found: " + id));
        return mapToResponse(resource);
    }

    @Override
    public Page<ResourceResponse> getAllResources(String keyword, ResourceType type, String building, Integer minCapacity, ResourceStatus status, Pageable pageable) {
        String searchKeyword = (keyword == null) ? "" : keyword;
        int minCap = (minCapacity == null) ? 0 : minCapacity;
        
        Page<Resource> resourcePage = resourceRepository.searchResources(searchKeyword, type, building, minCap, status, pageable);
        return resourcePage.map(this::mapToResponse);
    }

    private ResourceResponse mapToResponse(Resource resource) {
        return ResourceResponse.builder()
                .id(resource.getId())
                .resourceCode(resource.getResourceCode())
                .resourceName(resource.getResourceName())
                .resourceType(resource.getResourceType())
                .capacity(resource.getCapacity())
                .building(resource.getBuilding())
                .floor(resource.getFloor())
                .roomNumber(resource.getRoomNumber())
                .description(resource.getDescription())
                .availableFrom(resource.getAvailableFrom())
                .availableTo(resource.getAvailableTo())
                .status(resource.getStatus())
                .createdAt(resource.getCreatedAt())
                .updatedAt(resource.getUpdatedAt())
                .build();
    }
}
