package com.example.shiory.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.shiory.entity.User;

public interface UserRepository extends JpaRepository<User, UUID> {

	boolean existsByUsername(String username);

	boolean existsByEmail(String email);

	Optional<User> findByUsernameOrEmail(String username, String email);
}