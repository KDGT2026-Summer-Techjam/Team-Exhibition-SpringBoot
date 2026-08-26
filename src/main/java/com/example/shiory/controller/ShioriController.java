package com.example.shiory.controller;

import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.shiory.dto.ShioriCreateRequest;
import com.example.shiory.dto.ShioriDeleteRequest;
import com.example.shiory.dto.ShioriPeriodUpdateRequest;
import com.example.shiory.dto.ShioriUpdateRequest;
import com.example.shiory.service.ShioriService;

@RestController
@RequestMapping("/api/shioris")
public class ShioriController {

	private final ShioriService shioriService;

	public ShioriController(ShioriService shioriService) {
		this.shioriService = shioriService;
	}

	@PostMapping
	public ResponseEntity<Void> createShiori(
			@Valid @RequestBody ShioriCreateRequest request) {

		UUID ownerId = currentUserId();

		shioriService.createShiori(request, ownerId);

		return ResponseEntity.ok().build();
	}

	@PatchMapping("/{shioriId}/period")
	public ResponseEntity<Void> updatePeriod(
			@PathVariable UUID shioriId,
			@Valid @RequestBody ShioriPeriodUpdateRequest request) {

		shioriService.updatePeriod(shioriId, currentUserId(), request);

		return ResponseEntity.ok().build();
	}

	@PatchMapping("/{shioriId}")
	public ResponseEntity<Void> updateShiori(
			@PathVariable UUID shioriId,
			@RequestBody ShioriUpdateRequest request) {

		shioriService.updateShiori(
				shioriId,
				currentUserId(),
				request);

		return ResponseEntity.ok().build();
	}

	@DeleteMapping("/{shioriId}")
	public ResponseEntity<Void> deleteShiori(
			@PathVariable UUID shioriId,
			@Valid @RequestBody ShioriDeleteRequest request) {

		shioriService.deleteShiori(
				shioriId,
				currentUserId(),
				request);

		return ResponseEntity.noContent().build();
	}

	private UUID currentUserId() {

		String principal = (String) SecurityContextHolder.getContext()
				.getAuthentication()
				.getPrincipal();

		return UUID.fromString(principal);
	}
}
