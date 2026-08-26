package com.example.shiory.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PhotoResponse {

	private UUID id;
	private UUID dayId;
	private UUID userId;
	private String url;
	private long likeCount;
	private OffsetDateTime createdAt;
}
