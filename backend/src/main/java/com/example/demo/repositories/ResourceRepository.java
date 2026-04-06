package com.example.demo.repositories;

import com.example.demo.models.Resource;
import com.example.demo.models.ResourceType;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ResourceRepository extends MongoRepository<Resource, String> {
    List<Resource> findByType(ResourceType type);
    List<Resource> findByLocation(String location);
    List<Resource> findByCapacityGreaterThanEqual(int capacity);
    List<Resource> findByTypeAndCapacityGreaterThanEqual(ResourceType type, int capacity);
}
