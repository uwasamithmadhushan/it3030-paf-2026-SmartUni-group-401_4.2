package com.example.demo.repositories;

import com.example.demo.models.User;
import com.example.demo.models.UserRole;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {

    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByRole(UserRole role);

    List<User> findByApprovedFalse();
}
