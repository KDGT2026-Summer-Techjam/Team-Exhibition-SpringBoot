package com.example.shiory.controller;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.example.shiory.dto.InvitationAcceptRequest;
import com.example.shiory.dto.InvitationCreateRequest;
import com.example.shiory.dto.InvitationPublicResponse;
import com.example.shiory.dto.InvitationResponse;
import com.example.shiory.dto.InvitationSummaryResponse;
import com.example.shiory.entity.Invitation;
import com.example.shiory.service.InvitationService;
import com.example.shiory.util.SecurityUtils;

@RestController
public class InvitationController {

	private final InvitationService invitationService;
	private final String frontendBaseUrl;

	public InvitationController(
			InvitationService invitationService,
			@Value("${frontend.base-url}") String frontendBaseUrl) {

		this.invitationService = invitationService;
		this.frontendBaseUrl = frontendBaseUrl;
	}

	@GetMapping("/api/invitations/{token}")
	public ResponseEntity<InvitationPublicResponse> getInvitation(@PathVariable String token) {

		return ResponseEntity.ok(invitationService.getInvitationByToken(token));
	}

	@PostMapping("/api/shioris/{shioriId}/invitations")
	public ResponseEntity<InvitationResponse> createInvitation(
			@PathVariable UUID shioriId,
			@Valid @RequestBody InvitationCreateRequest request) {

		Invitation invitation = invitationService.createInvitation(
				shioriId,
				SecurityUtils.currentUserId(),
				request);

		String url = frontendBaseUrl + "/invitations/" + invitation.getToken();

		return ResponseEntity.ok(new InvitationResponse(url));
	}

	@PostMapping("/api/invitations/{token}/accept")
	public ResponseEntity<Void> acceptInvitation(
			@PathVariable String token,
			@Valid @RequestBody InvitationAcceptRequest request) {

		invitationService.acceptInvitation(
				token,
				SecurityUtils.currentUserId(),
				request.getPassword());

		return ResponseEntity.ok().build();
	}

	@GetMapping("/api/shioris/{shioriId}/invitations")
	public ResponseEntity<List<InvitationSummaryResponse>> getInvitations(@PathVariable UUID shioriId) {

		return ResponseEntity.ok(
				invitationService.getInvitations(shioriId, SecurityUtils.currentUserId()));
	}
}
