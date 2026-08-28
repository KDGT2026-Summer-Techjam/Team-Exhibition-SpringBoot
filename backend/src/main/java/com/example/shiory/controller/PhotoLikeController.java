package com.example.shiory.controller;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.shiory.dto.PhotoResponse;
import com.example.shiory.service.PhotoLikeService;
import com.example.shiory.service.PhotoService;
import com.example.shiory.util.SecurityUtils;

@RestController
public class PhotoLikeController {

	private final PhotoLikeService photoLikeService;
	private final PhotoService photoService;

	public PhotoLikeController(PhotoLikeService photoLikeService, PhotoService photoService) {
		this.photoLikeService = photoLikeService;
		this.photoService = photoService;
	}

	@PostMapping("/api/photos/{photoId}/likes")
	public ResponseEntity<PhotoResponse> likePhoto(@PathVariable UUID photoId) {

		UUID callerId = SecurityUtils.currentUserId();
		photoLikeService.likePhoto(photoId, callerId);

		return ResponseEntity.ok(photoService.getPhoto(photoId, callerId));
	}
}
