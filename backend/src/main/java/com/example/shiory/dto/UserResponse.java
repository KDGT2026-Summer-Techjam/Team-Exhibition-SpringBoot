package com.example.shiory.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UserResponse {

	private UUID id;
	private String username;
	private String email;
	private OffsetDateTime createdAt;
}
