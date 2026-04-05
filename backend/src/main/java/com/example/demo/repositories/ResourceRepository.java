package com.example.demo.repositories;

import com.example.demo.models.Resource;
import com.example.demo.models.ResourceType;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ResourceRepository extends MongoRepository<Resource, String> {

    List<Resource> findByTypeAndCapacityGreaterThanEqualAndLocation(ResourceType type, int capacity, String location);
}
