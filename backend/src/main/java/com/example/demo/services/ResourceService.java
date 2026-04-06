package com.example.demo.services;

import com.example.demo.models.Resource;
import com.example.demo.models.ResourceType;
import com.example.demo.repositories.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;

    public List<Resource> getAllResources(ResourceType type, Integer minCapacity, String location) {
        if (type != null && minCapacity != null) {
            return resourceRepository.findByTypeAndCapacityGreaterThanEqual(type, minCapacity);
        }
        if (type != null) {
            return resourceRepository.findByType(type);
        }
        if (minCapacity != null) {
            return resourceRepository.findByCapacityGreaterThanEqual(minCapacity);
        }
        if (location != null && !location.isBlank()) {
            return resourceRepository.findByLocation(location);
        }
        return resourceRepository.findAll();
    }

    public Resource getResourceById(String id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found with id: " + id));
    }

    public Resource addResource(Resource resource) {
        return resourceRepository.save(resource);
    }

    public Resource updateResource(String id, Resource updated) {
        Resource existing = getResourceById(id);
        existing.setName(updated.getName());
        existing.setDescription(updated.getDescription());
        existing.setType(updated.getType());
        existing.setLocation(updated.getLocation());
        existing.setCapacity(updated.getCapacity());
        existing.setStatus(updated.getStatus());
        existing.setAvailabilityWindows(updated.getAvailabilityWindows());
        return resourceRepository.save(existing);
    }

    public void deleteResource(String id) {
        getResourceById(id); // throws if not found
        resourceRepository.deleteById(id);
    }
}
