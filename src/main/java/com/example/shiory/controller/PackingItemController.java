package com.example.shiory.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.shiory.dto.PackingItemCreateRequest;
import com.example.shiory.dto.PackingItemResponse;
import com.example.shiory.entity.PackingItem;
import com.example.shiory.service.PackingItemService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PackingItemController {
	
	private final PackingItemService packingItemService;

	@PostMapping("/shioris/{shioriId}/packing-items")
	public ResponseEntity<PackingItem> createPackingItem(
			@PathVariable UUID shioriId,
			@Valid @RequestBody PackingItemCreateRequest request) {

		PackingItem item = packingItemService.createPackingItem(
				shioriId,
				currentUserId(),
				request);

		return ResponseEntity.status(HttpStatus.CREATED).body(item);
	}

	@GetMapping("/shioris/{shioriId}/packing-items")
	public ResponseEntity<List<PackingItemResponse>> getPackingItems(
			@PathVariable UUID shioriId) {

		List<PackingItemResponse> items = packingItemService.getPackingItems(
				shioriId,
				currentUserId());

		return ResponseEntity.ok(items);
	}

	@PostMapping("/packing-items/{itemId}/checks")
	public ResponseEntity<Void> checkItem(
			@PathVariable UUID itemId) {

		packingItemService.checkItem(itemId, currentUserId());

		return ResponseEntity.noContent().build();
	}

	@DeleteMapping("/packing-items/{itemId}/checks/me")
	public ResponseEntity<Void> uncheckItem(
			@PathVariable UUID itemId) {

		packingItemService.uncheckItem(itemId, currentUserId());

		return ResponseEntity.noContent().build();
	}

	private UUID currentUserId() {

		String principal = (String) SecurityContextHolder
				.getContext()
				.getAuthentication()
				.getPrincipal();

		return UUID.fromString(principal);
	}
}
