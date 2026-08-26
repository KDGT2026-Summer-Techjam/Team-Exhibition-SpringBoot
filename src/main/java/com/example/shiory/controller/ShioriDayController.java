package com.example.shiory.controller;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.example.shiory.dto.ShioriDayUpdateRequest;
import com.example.shiory.service.ShioriDayService;

@RestController
public class ShioriDayController {

	private final ShioriDayService shioriDayService;

	public ShioriDayController(ShioriDayService shioriDayService) {
		this.shioriDayService = shioriDayService;
	}

	@PatchMapping("/api/shiori-days/{dayId}")
	public ResponseEntity<Void> updateDay(
			@PathVariable UUID dayId,
			@RequestBody ShioriDayUpdateRequest request) {

		shioriDayService.updateDay(dayId, currentUserId(), request);

		return ResponseEntity.ok().build();
	}

	private UUID currentUserId() {

		String principal = (String) SecurityContextHolder.getContext()
				.getAuthentication()
				.getPrincipal();

		return UUID.fromString(principal);
	}
}
