package com.example.shiory.controller;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.shiory.service.PhotoService;

@RestController
public class PhotoController {

	private final PhotoService photoService;

	public PhotoController(PhotoService photoService) {
		this.photoService = photoService;
	}

	@PostMapping("/api/shiori-days/{dayId}/photos")
	public ResponseEntity<Void> uploadPhoto(
			@PathVariable UUID dayId,
			@RequestParam("file") MultipartFile file) {

		photoService.uploadPhoto(dayId, currentUserId(), file);

		return ResponseEntity.ok().build();
	}

	@DeleteMapping("/api/shiori-days/{dayId}/photos/me")
	public ResponseEntity<Void> deletePhoto(@PathVariable UUID dayId) {

		photoService.deletePhoto(dayId, currentUserId());

		return ResponseEntity.noContent().build();
	}

	private UUID currentUserId() {

		String principal = (String) SecurityContextHolder.getContext()
				.getAuthentication()
				.getPrincipal();

		return UUID.fromString(principal);
	}
}
