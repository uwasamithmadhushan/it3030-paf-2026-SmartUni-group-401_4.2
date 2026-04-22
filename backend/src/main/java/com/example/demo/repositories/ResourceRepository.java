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
public interface ResourceRepository extends MongoRepository<Resource, String> {
    
    Optional<Resource> findByResourceCode(String resourceCode);

    @Query("{ $and: [ " +
           "  { $or: [ { 'resourceName': { $regex: ?0, $options: 'i' } }, { 'resourceCode': { $regex: ?0, $options: 'i' } }, { 'description': { $regex: ?0, $options: 'i' } } ] }, " +
           "  { $and: [ " +
           "    { $or: [ { $expr: { $eq: [?1, null] } }, { 'resourceType': ?1 } ] }, " +
           "    { $or: [ { $expr: { $eq: [?2, null] } }, { 'building': { $regex: ?2, $options: 'i' } } ] }, " +
           "    { 'capacity': { $gte: ?3 } }, " +
           "    { $or: [ { $expr: { $eq: [?4, null] } }, { 'status': ?4 } ] } " +
           "  ] } " +
           "] }")
    Page<Resource> searchResources(String keyword, ResourceType type, String building, int minCapacity, ResourceStatus status, Pageable pageable);
}
