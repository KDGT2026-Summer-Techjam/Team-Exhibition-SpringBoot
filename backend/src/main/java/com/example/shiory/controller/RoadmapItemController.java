package com.example.shiory.controller;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.example.shiory.dto.RoadmapItemCreateRequest;
import com.example.shiory.dto.RoadmapItemResponse;
import com.example.shiory.dto.RoadmapItemUpdateRequest;
import com.example.shiory.service.RoadmapItemService;

@RestController
public class RoadmapItemController {

	private final RoadmapItemService roadmapItemService;

	public RoadmapItemController(RoadmapItemService roadmapItemService) {
		this.roadmapItemService = roadmapItemService;
	}

	@PostMapping("/api/shiori-days/{dayId}/roadmap-items")
	public ResponseEntity<RoadmapItemResponse> createRoadmapItem(
			@PathVariable UUID dayId,
			@Valid @RequestBody RoadmapItemCreateRequest request) {

		var item = roadmapItemService.createRoadmapItem(dayId, currentUserId(), request);

		return ResponseEntity.ok(roadmapItemService.getRoadmapItem(item.getId(), currentUserId()));
	}

	@GetMapping("/api/shiori-days/{dayId}/roadmap-items")
	public ResponseEntity<List<RoadmapItemResponse>> getRoadmapItems(@PathVariable UUID dayId) {

		return ResponseEntity.ok(roadmapItemService.getRoadmapItems(dayId, currentUserId()));
	}

	@GetMapping("/api/roadmap-items/{itemId}")
	public ResponseEntity<RoadmapItemResponse> getRoadmapItem(@PathVariable UUID itemId) {

		return ResponseEntity.ok(roadmapItemService.getRoadmapItem(itemId, currentUserId()));
	}

	@PatchMapping("/api/roadmap-items/{itemId}")
	public ResponseEntity<Void> updateRoadmapItem(
			@PathVariable UUID itemId,
			@RequestBody RoadmapItemUpdateRequest request) {

		roadmapItemService.updateRoadmapItem(itemId, currentUserId(), request);

		return ResponseEntity.ok().build();
	}

	@DeleteMapping("/api/roadmap-items/{itemId}")
	public ResponseEntity<Void> deleteRoadmapItem(@PathVariable UUID itemId) {

		roadmapItemService.deleteRoadmapItem(itemId, currentUserId());

		return ResponseEntity.noContent().build();
	}

	private UUID currentUserId() {

		String principal = (String) SecurityContextHolder.getContext()
				.getAuthentication()
				.getPrincipal();

		return UUID.fromString(principal);
	}
}
