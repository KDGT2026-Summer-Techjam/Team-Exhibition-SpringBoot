package com.example.shiory.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ShioriMemberResponse {

	private UUID userId;
	private String username;
	private String role;
	private OffsetDateTime joinedAt;
}
