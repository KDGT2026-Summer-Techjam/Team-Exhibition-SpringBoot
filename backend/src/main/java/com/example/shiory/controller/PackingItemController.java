package com.example.shiory.controller;

import java.util.List;
import java.util.UUID;

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

import com.example.shiory.dto.PackingItemCreateRequest;
import com.example.shiory.dto.PackingItemResponse;
import com.example.shiory.dto.PackingItemUpdateRequest;
import com.example.shiory.service.PackingItemService;
import com.example.shiory.util.SecurityUtils;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PackingItemController {

	private final PackingItemService packingItemService;

	@PostMapping("/shioris/{shioriId}/packing-items")
	public ResponseEntity<PackingItemResponse> createPackingItem(
			@PathVariable UUID shioriId,
			@Valid @RequestBody PackingItemCreateRequest request) {

		PackingItemResponse item = packingItemService.createPackingItem(
				shioriId,
				SecurityUtils.currentUserId(),
				request);

		return ResponseEntity.status(HttpStatus.CREATED).body(item);
	}

	@GetMapping("/shioris/{shioriId}/packing-items")
	public ResponseEntity<List<PackingItemResponse>> getPackingItems(@PathVariable UUID shioriId) {

		return ResponseEntity.ok(
				packingItemService.getPackingItems(shioriId, SecurityUtils.currentUserId()));
	}

	@PatchMapping("/packing-items/{itemId}")
	public ResponseEntity<PackingItemResponse> updatePackingItem(
			@PathVariable UUID itemId,
			@RequestBody PackingItemUpdateRequest request) {

		return ResponseEntity.ok(packingItemService.updatePackingItem(
				itemId,
				SecurityUtils.currentUserId(),
				request));
	}

	@DeleteMapping("/packing-items/{itemId}")
	public ResponseEntity<Void> deletePackingItem(@PathVariable UUID itemId) {

		packingItemService.deletePackingItem(itemId, SecurityUtils.currentUserId());

		return ResponseEntity.noContent().build();
	}

	@PostMapping("/packing-items/{itemId}/contribute")
	public ResponseEntity<PackingItemResponse> contribute(@PathVariable UUID itemId) {

		return ResponseEntity.ok(packingItemService.contribute(
				itemId,
				SecurityUtils.currentUserId()));
	}
}
