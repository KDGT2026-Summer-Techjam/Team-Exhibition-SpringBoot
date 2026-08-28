package com.example.shiory.controller;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.shiory.dto.ShioriCreateRequest;
import com.example.shiory.dto.ShioriDeleteRequest;
import com.example.shiory.dto.ShioriDetailResponse;
import com.example.shiory.dto.ShioriPagePermissionsUpdateRequest;
import com.example.shiory.dto.ShioriPeriodUpdateRequest;
import com.example.shiory.dto.ShioriSummaryResponse;
import com.example.shiory.dto.ShioriUpdateRequest;
import com.example.shiory.service.ShioriService;
import com.example.shiory.util.SecurityUtils;

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

		shioriService.createShiori(request, SecurityUtils.currentUserId());

		return ResponseEntity.status(HttpStatus.CREATED).build();
	}

	@PatchMapping("/{shioriId}/period")
	public ResponseEntity<Void> updatePeriod(
			@PathVariable UUID shioriId,
			@Valid @RequestBody ShioriPeriodUpdateRequest request) {

		shioriService.updatePeriod(shioriId, SecurityUtils.currentUserId(), request);

		return ResponseEntity.ok().build();
	}

	@PatchMapping("/{shioriId}/page-permissions")
	public ResponseEntity<Void> updatePagePermissions(
			@PathVariable UUID shioriId,
			@RequestBody ShioriPagePermissionsUpdateRequest request) {

		shioriService.updatePagePermissions(shioriId, SecurityUtils.currentUserId(), request);

		return ResponseEntity.ok().build();
	}

	@PatchMapping("/{shioriId}")
	public ResponseEntity<Void> updateShiori(
			@PathVariable UUID shioriId,
			@RequestBody ShioriUpdateRequest request) {

		shioriService.updateShiori(shioriId, SecurityUtils.currentUserId(), request);

		return ResponseEntity.ok().build();
	}

	@DeleteMapping("/{shioriId}")
	public ResponseEntity<Void> deleteShiori(
			@PathVariable UUID shioriId,
			@Valid @RequestBody ShioriDeleteRequest request) {

		shioriService.deleteShiori(shioriId, SecurityUtils.currentUserId(), request);

		return ResponseEntity.noContent().build();
	}

	@GetMapping
	public ResponseEntity<List<ShioriSummaryResponse>> getShioriList() {

		return ResponseEntity.ok(shioriService.getShioriList(SecurityUtils.currentUserId()));
	}

	@GetMapping("/{shioriId}")
	public ResponseEntity<ShioriDetailResponse> getShioriDetail(@PathVariable UUID shioriId) {

		return ResponseEntity.ok(
				shioriService.getShioriDetail(shioriId, SecurityUtils.currentUserId()));
	}
}
