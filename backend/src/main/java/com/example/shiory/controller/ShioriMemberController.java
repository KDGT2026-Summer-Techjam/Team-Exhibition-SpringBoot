package com.example.shiory.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.shiory.dto.ShioriMemberResponse;
import com.example.shiory.service.ShioriMemberService;
import com.example.shiory.util.SecurityUtils;

@RestController
@RequestMapping("/api/shioris")
public class ShioriMemberController {

	private final ShioriMemberService shioriMemberService;

	public ShioriMemberController(ShioriMemberService shioriMemberService) {
		this.shioriMemberService = shioriMemberService;
	}

	@DeleteMapping("/{shioriId}/members/me")
	public ResponseEntity<Void> leave(@PathVariable UUID shioriId) {

		shioriMemberService.leave(shioriId, SecurityUtils.currentUserId());

		return ResponseEntity.noContent().build();
	}

	@DeleteMapping("/{shioriId}/members/{userId}")
	public ResponseEntity<Void> ban(
			@PathVariable UUID shioriId,
			@PathVariable UUID userId) {

		shioriMemberService.ban(shioriId, userId, SecurityUtils.currentUserId());

		return ResponseEntity.noContent().build();
	}

	@GetMapping("/{shioriId}/members")
	public ResponseEntity<List<ShioriMemberResponse>> getMembers(@PathVariable UUID shioriId) {

		return ResponseEntity.ok(
				shioriMemberService.getMembers(shioriId, SecurityUtils.currentUserId()));
	}
}
