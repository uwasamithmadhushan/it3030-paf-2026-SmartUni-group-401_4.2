package com.example.demo.repositories;

import com.example.demo.models.Resource;
import com.example.demo.models.ResourceStatus;
import com.example.demo.models.ResourceType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ResourceRepository extends MongoRepository<Resource, String>, ResourceRepositoryCustom {
    
    Optional<Resource> findByResourceCode(String resourceCode);
}
