package com.example.demo.repositories;

import com.example.demo.models.Resource;
import com.example.demo.models.ResourceStatus;
import com.example.demo.models.ResourceType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ResourceRepositoryCustom {
    Page<Resource> searchResources(String keyword, ResourceType type, String building, int minCapacity, ResourceStatus status, Pageable pageable);
}
