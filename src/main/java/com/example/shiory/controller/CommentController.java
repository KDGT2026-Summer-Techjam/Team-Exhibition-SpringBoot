package com.example.shiory.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.shiory.dto.CommentCreateRequest;
import com.example.shiory.dto.CommentUpdateRequest;
import com.example.shiory.entity.Comment;
import com.example.shiory.service.CommentService;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api")
public class CommentController {

	private final CommentService commentService;
	
	@PostMapping("/comments")
	public ResponseEntity<Comment> createComment(
			@RequestBody CommentCreateRequest request,
			Authentication authentication) {

		UUID userId = UUID.fromString(authentication.getName());

		Comment comment = commentService.createComment(request, userId);

		return ResponseEntity.status(HttpStatus.CREATED).body(comment);
	}

	@GetMapping("/shioris/{shioriId}/comments")
	public ResponseEntity<List<Comment>> getComments(
			@PathVariable UUID shioriId) {

		List<Comment> comments = commentService.getComments(shioriId);

		return ResponseEntity.ok(comments);
	}

	@GetMapping("/comments/{id}")
	public ResponseEntity<Comment> getComment(@PathVariable UUID id) {

		return ResponseEntity.ok(commentService.getComment(id));
	}

	@PatchMapping("/comments/{id}")
	public ResponseEntity<Comment> updateComment(
			@PathVariable UUID id,
			@RequestBody CommentUpdateRequest request,
			Authentication authentication) {

		UUID userId = UUID.fromString(authentication.getName());

		Comment comment = commentService.updateComment(id, request, userId);

		return ResponseEntity.ok(comment);
	}

	@DeleteMapping("/comments/{id}")
	public ResponseEntity<Void> deleteComment(
			@PathVariable UUID id,
			Authentication authentication) {

		UUID userId = UUID.fromString(authentication.getName());

		commentService.deleteComment(id, userId);

		return ResponseEntity.noContent().build();
	}
}