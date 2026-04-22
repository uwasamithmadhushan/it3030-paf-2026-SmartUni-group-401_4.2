package com.example.demo.services;

import com.example.demo.dto.AuthResponse;
import com.example.demo.models.User;
import com.example.demo.models.UserRole;
import com.example.demo.repositories.UserRepository;
import com.example.demo.security.JwtUtil;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class GoogleAuthService {

    @Value("${google.client-id}")
    private String googleClientId;

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    public AuthResponse loginWithGoogle(String idTokenString) {
        GoogleIdToken.Payload payload = verifyToken(idTokenString);

        String email = payload.getEmail();
        String name  = (String) payload.get("name");
        String sub   = payload.getSubject();

        // Find existing user or auto-register with role USER
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setName(name);

            // Derive unique username from email prefix
            String base = email.split("@")[0].replaceAll("[^a-zA-Z0-9_]", "_");
            String username = base;
            int suffix = 1;
            while (userRepository.findByUsername(username).isPresent()) {
                username = base + "_" + suffix++;
            }
            newUser.setUsername(username);
            newUser.setPassword(""); // No password for Google-only accounts
            newUser.setRole(UserRole.USER);
            newUser.setApproved(true);
            return userRepository.save(newUser);
        });

        if (Boolean.FALSE.equals(user.getApproved())) {
            throw new IllegalArgumentException("Your account is pending admin approval.");
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        String token = jwtUtil.generateToken(userDetails);

        return new AuthResponse(token, user.getUsername(), user.getEmail(), user.getRole());
    }

    private GoogleIdToken.Payload verifyToken(String idTokenString) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(), GsonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken == null) {
                throw new IllegalArgumentException("Invalid Google ID token.");
            }
            return idToken.getPayload();
        } catch (Exception e) {
            throw new IllegalArgumentException("Google token verification failed: " + e.getMessage());
        }
    }
}
