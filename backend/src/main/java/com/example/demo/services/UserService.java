package com.example.demo.services;

import com.example.demo.dto.UpdateProfileRequest;
import com.example.demo.dto.UserProfileResponse;
import com.example.demo.models.User;
import com.example.demo.models.UserRole;
import com.example.demo.repositories.UserRepository;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public User findUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<UserProfileResponse> getAllUserProfiles() {
        return userRepository.findAll().stream()
                .map(u -> new UserProfileResponse(u.getId(), u.getUsername(), u.getEmail(), u.getRole(), u.getApproved()))
                .collect(Collectors.toList());
    }

    public UserProfileResponse getCurrentUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        return new UserProfileResponse(user.getId(), user.getUsername(), user.getEmail(), user.getRole(), user.getApproved());
    }

    public void deleteUser(String id, String requestingUsername) {
        User target = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));
        if (target.getUsername().equals(requestingUsername)) {
            throw new IllegalArgumentException("Cannot delete your own account");
        }
        userRepository.deleteById(id);
    }

    public UserProfileResponse updateCurrentUser(String username, UpdateProfileRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        if (!user.getUsername().equals(request.getUsername()) &&
                userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new IllegalArgumentException("Username already taken");
        }
        if (!user.getEmail().equals(request.getEmail()) &&
                userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already in use");
        }

        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        userRepository.save(user);
        return new UserProfileResponse(user.getId(), user.getUsername(), user.getEmail(), user.getRole(), user.getApproved());
    }

    public UserProfileResponse approveUser(String id, String requestingUsername) {
        User target = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));
        if (target.getRole() != UserRole.ADMIN) {
            throw new IllegalArgumentException("Only pending ADMIN accounts can be approved");
        }
        if (!Boolean.FALSE.equals(target.getApproved())) {
            throw new IllegalArgumentException("This account is already approved");
        }
        target.setApproved(true);
        userRepository.save(target);
        return new UserProfileResponse(target.getId(), target.getUsername(), target.getEmail(), target.getRole(), true);
    }
}
