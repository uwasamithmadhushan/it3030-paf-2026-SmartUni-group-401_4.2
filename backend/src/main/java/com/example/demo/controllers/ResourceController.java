package com.example.demo.controllers;

import com.example.demo.models.Resource;
import com.example.demo.models.ResourceType;
import com.example.demo.services.ResourceService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/assets")
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceService resourceService;

    @PostMapping
    public ResponseEntity<Resource> createResource(@Valid @RequestBody Resource resource) {
        Resource createdResource = resourceService.addResource(resource);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdResource);
    }

    @GetMapping
    public ResponseEntity<List<Resource>> getResources(
        @RequestParam(required = false) ResourceType type,
        @RequestParam(required = false) Integer capacity,
        @RequestParam(required = false) String location
    ) {
        List<Resource> resources = resourceService.getAllResources(type, capacity, location);
        return ResponseEntity.ok(resources);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Resource> updateResource(@PathVariable String id, @Valid @RequestBody Resource resource) {
        try {
            Resource updatedResource = resourceService.updateResource(id, resource);
            return ResponseEntity.ok(updatedResource);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(@PathVariable String id) {
        try {
            resourceService.deleteResource(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}
