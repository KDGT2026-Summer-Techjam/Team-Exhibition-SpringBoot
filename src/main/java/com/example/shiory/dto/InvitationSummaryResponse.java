package com.example.shiory.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class InvitationSummaryResponse {

	private UUID id;
	private String inviteeEmail;
	private String status;
	private OffsetDateTime createdAt;
	private OffsetDateTime acceptedAt;
}
