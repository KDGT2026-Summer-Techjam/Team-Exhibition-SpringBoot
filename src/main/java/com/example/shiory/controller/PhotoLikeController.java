package com.example.shiory.controller;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.shiory.service.PhotoLikeService;

@RestController
public class PhotoLikeController {

	private final PhotoLikeService photoLikeService;

	public PhotoLikeController(PhotoLikeService photoLikeService) {
		this.photoLikeService = photoLikeService;
	}

	@PostMapping("/api/photos/{photoId}/likes")
	public ResponseEntity<Void> likePhoto(@PathVariable UUID photoId) {

		photoLikeService.likePhoto(photoId, currentUserId());

		return ResponseEntity.ok().build();
	}

	private UUID currentUserId() {

		String principal = (String) SecurityContextHolder.getContext()
				.getAuthentication()
				.getPrincipal();

		return UUID.fromString(principal);
	}
}
