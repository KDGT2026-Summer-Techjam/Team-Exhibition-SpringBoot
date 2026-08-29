package com.example.shiory.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.shiory.dto.PhotoResponse;
import com.example.shiory.service.PhotoService;
import com.example.shiory.util.SecurityUtils;

@RestController
public class PhotoController {

	private final PhotoService photoService;

	public PhotoController(PhotoService photoService) {
		this.photoService = photoService;
	}

	@PostMapping("/api/shiori-days/{dayId}/photos")
	public ResponseEntity<PhotoResponse> uploadPhoto(
			@PathVariable UUID dayId,
			@RequestParam("file") MultipartFile file) {

		var photo = photoService.uploadPhoto(dayId, SecurityUtils.currentUserId(), file);

		return ResponseEntity.ok(
				photoService.getPhoto(photo.getId(), SecurityUtils.currentUserId()));
	}

	@DeleteMapping("/api/photos/{photoId}")
	public ResponseEntity<Void> deletePhoto(@PathVariable UUID photoId) {

		photoService.deletePhoto(photoId, SecurityUtils.currentUserId());

		return ResponseEntity.noContent().build();
	}

	@GetMapping("/api/shioris/{shioriId}/photos")
	public ResponseEntity<List<PhotoResponse>> getPhotos(
			@PathVariable UUID shioriId,
			@RequestParam(required = false) Boolean includeDeleted) {

		return ResponseEntity.ok(photoService.getPhotos(
				shioriId,
				SecurityUtils.currentUserId(),
				includeDeleted));
	}

	@GetMapping("/api/photos/{photoId}")
	public ResponseEntity<PhotoResponse> getPhoto(@PathVariable UUID photoId) {

		return ResponseEntity.ok(
				photoService.getPhoto(photoId, SecurityUtils.currentUserId()));
	}
}
