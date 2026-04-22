package com.example.demo.controllers;

import com.example.demo.models.User;
import com.example.demo.models.UserRole;
import com.example.demo.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
public class TestController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/seed")
    public String seed() {
        if (userRepository.findByUsername("admin").isEmpty()) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@smartuni.com");
            admin.setPassword(passwordEncoder.encode("password123"));
            admin.setRole(UserRole.ADMIN);
            admin.setApproved(true);
            userRepository.save(admin);
            return "Admin user created: admin / password123";
        }
        return "Admin already exists";
    }
}
