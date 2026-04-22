package com.example.demo.repositories;

import com.example.demo.models.Resource;
import com.example.demo.models.ResourceStatus;
import com.example.demo.models.ResourceType;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;

import java.util.ArrayList;
import java.util.List;

/**
 * Custom repository implementation for ResourceRepository.
 * MUST be named ResourceRepositoryImpl (main interface name + "Impl")
 * so Spring Data MongoDB can auto-detect it as a repository fragment.
 */
@RequiredArgsConstructor
public class ResourceRepositoryImpl implements ResourceRepositoryCustom {

    private final MongoTemplate mongoTemplate;

    @Override
    public Page<Resource> searchResources(
            String keyword,
            ResourceType type,
            String building,
            int minCapacity,
            ResourceStatus status,
            Pageable pageable) {

        List<Criteria> criteriaList = new ArrayList<>();

        // Keyword: match resourceCode, resourceName, or description (case-insensitive)
        if (keyword != null && !keyword.isBlank()) {
            criteriaList.add(new Criteria().orOperator(
                    Criteria.where("resourceCode").regex(keyword, "i"),
                    Criteria.where("resourceName").regex(keyword, "i"),
                    Criteria.where("description").regex(keyword, "i")
            ));
        }

        // Type filter (skip if null → no filter applied)
        if (type != null) {
            criteriaList.add(Criteria.where("resourceType").is(type));
        }

        // Building filter (skip if blank → no filter applied)
        if (building != null && !building.isBlank()) {
            criteriaList.add(Criteria.where("building").regex(building, "i"));
        }

        // Capacity filter (always applied; 0 means no effective lower bound)
        criteriaList.add(Criteria.where("capacity").gte(minCapacity));

        // Status filter (skip if null → no filter applied)
        if (status != null) {
            criteriaList.add(Criteria.where("status").is(status));
        }

        Query query = new Query().with(pageable);
        if (!criteriaList.isEmpty()) {
            query.addCriteria(new Criteria().andOperator(criteriaList.toArray(new Criteria[0])));
        }

        long count = mongoTemplate.count(Query.of(query).limit(-1).skip(-1), Resource.class);
        List<Resource> resources = mongoTemplate.find(query, Resource.class);

        return new PageImpl<>(resources, pageable, count);
    }
}
