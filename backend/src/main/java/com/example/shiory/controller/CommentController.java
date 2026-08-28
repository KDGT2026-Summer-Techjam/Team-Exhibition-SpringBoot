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

import com.example.shiory.dto.CommentCreateRequest;
import com.example.shiory.dto.CommentResponse;
import com.example.shiory.dto.CommentUpdateRequest;
import com.example.shiory.service.CommentService;
import com.example.shiory.util.SecurityUtils;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api")
public class CommentController {

	private final CommentService commentService;

	@PostMapping("/comments")
	public ResponseEntity<CommentResponse> createComment(
			@RequestBody CommentCreateRequest request) {

		CommentResponse comment = commentService.createComment(
				request,
				SecurityUtils.currentUserId());

		return ResponseEntity.status(HttpStatus.CREATED).body(comment);
	}

	@GetMapping("/shioris/{shioriId}/comments")
	public ResponseEntity<List<CommentResponse>> getComments(@PathVariable UUID shioriId) {

		return ResponseEntity.ok(
				commentService.getComments(shioriId, SecurityUtils.currentUserId()));
	}

	@GetMapping("/comments/{id}")
	public ResponseEntity<CommentResponse> getComment(@PathVariable UUID id) {

		return ResponseEntity.ok(
				commentService.getComment(id, SecurityUtils.currentUserId()));
	}

	@PatchMapping("/comments/{id}")
	public ResponseEntity<CommentResponse> updateComment(
			@PathVariable UUID id,
			@RequestBody CommentUpdateRequest request) {

		return ResponseEntity.ok(commentService.updateComment(
				id,
				request,
				SecurityUtils.currentUserId()));
	}

	@DeleteMapping("/comments/{id}")
	public ResponseEntity<Void> deleteComment(@PathVariable UUID id) {

		commentService.deleteComment(id, SecurityUtils.currentUserId());

		return ResponseEntity.noContent().build();
	}
}
