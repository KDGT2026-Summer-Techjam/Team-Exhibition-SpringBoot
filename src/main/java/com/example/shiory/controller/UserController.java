package com.example.shiory.controller;

import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PatchMapping;

import com.example.shiory.dto.UserCreateRequest;
import com.example.shiory.dto.UserResponse;
import com.example.shiory.dto.UserUpdateRequest;
import com.example.shiory.service.UserService;

@RestController
@RequestMapping("/api/users")
public class UserController {

	private final UserService userService;

	public UserController(UserService userService) {
		this.userService = userService;
	}

	@PostMapping
	public ResponseEntity<Void> createUser(
			@Valid @RequestBody UserCreateRequest request) {

		userService.createUser(request);

		return ResponseEntity.ok().build();
	}

	@PatchMapping("/me")
	public ResponseEntity<Void> updateUser(
			@RequestBody UserUpdateRequest request) {

		userService.updateUser(
				currentUserId(),
				request);

		return ResponseEntity.ok().build();
	}

	@GetMapping("/me")
	public ResponseEntity<UserResponse> getMe() {

		return ResponseEntity.ok(userService.getMe(currentUserId()));
	}

	private UUID currentUserId() {

		String principal = (String) SecurityContextHolder
				.getContext()
				.getAuthentication()
				.getPrincipal();

		return UUID.fromString(principal);
	}
}
