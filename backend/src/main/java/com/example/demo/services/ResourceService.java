package com.example.demo.services;

import com.example.demo.models.Resource;
import com.example.demo.models.ResourceType;
import com.example.demo.repositories.ResourceRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;

    public Resource addResource(Resource resource) {
        return resourceRepository.save(resource);
    }

    public List<Resource> getAllResources(ResourceType type, Integer minCapacity, String location) {
        if (type != null && minCapacity != null && location != null && !location.isBlank()) {
            return resourceRepository.findByTypeAndCapacityGreaterThanEqualAndLocation(type, minCapacity, location);
        }

        return resourceRepository.findAll().stream()
            .filter(resource -> type == null || resource.getType() == type)
            .filter(resource -> minCapacity == null || resource.getCapacity() >= minCapacity)
            .filter(resource -> location == null || location.isBlank() || location.equalsIgnoreCase(resource.getLocation()))
            .toList();
    }

    public Resource getResourceById(String id) {
        return resourceRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Resource not found with id: " + id));
    }

    public Resource updateResource(String id, Resource updatedResource) {
        Resource existing = getResourceById(id);

        existing.setName(updatedResource.getName());
        existing.setType(updatedResource.getType());
        existing.setCapacity(updatedResource.getCapacity());
        existing.setLocation(updatedResource.getLocation());
        existing.setStatus(updatedResource.getStatus());
        existing.setAvailabilityWindows(updatedResource.getAvailabilityWindows());

        return resourceRepository.save(existing);
    }

    public void deleteResource(String id) {
        if (!resourceRepository.existsById(id)) {
            throw new IllegalArgumentException("Resource not found with id: " + id);
        }
        resourceRepository.deleteById(id);
    }
}
