package com.example.shiory.controller;

import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.example.shiory.dto.RoadmapItemCreateRequest;
import com.example.shiory.service.RoadmapItemService;

@RestController
public class RoadmapItemController {

	private final RoadmapItemService roadmapItemService;

	public RoadmapItemController(RoadmapItemService roadmapItemService) {
		this.roadmapItemService = roadmapItemService;
	}

	@PostMapping("/api/shiori-days/{dayId}/roadmap-items")
	public ResponseEntity<Void> createRoadmapItem(
			@PathVariable UUID dayId,
			@Valid @RequestBody RoadmapItemCreateRequest request) {

		roadmapItemService.createRoadmapItem(dayId, currentUserId(), request);

		return ResponseEntity.ok().build();
	}

	private UUID currentUserId() {

		String principal = (String) SecurityContextHolder.getContext()
				.getAuthentication()
				.getPrincipal();

		return UUID.fromString(principal);
	}
}
