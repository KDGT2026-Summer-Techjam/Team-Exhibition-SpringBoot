package com.example.shiory.controller;

import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.shiory.dto.ShioriDayInsertRequest;
import com.example.shiory.service.ShioriDayService;

@RestController
@RequestMapping("/api")
public class ShioriDayController {
	
	private final ShioriDayService shioriDayService;

	public ShioriDayController(ShioriDayService shioriDayService) {
		this.shioriDayService = shioriDayService;
	}

	@PostMapping("/shioris/{shioriId}/days")
	public ResponseEntity<Void> insertDay(
			@PathVariable UUID shioriId,
			@Valid @RequestBody ShioriDayInsertRequest request) {

		shioriDayService.insertDay(
				shioriId,
				currentUserId(),
				request);

		return ResponseEntity.ok().build();
	}

	@DeleteMapping("/shiori-days/{dayId}")
	public ResponseEntity<Void> deleteDay(
			@PathVariable UUID dayId) {

		shioriDayService.deleteDay(
				dayId,
				currentUserId());

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
