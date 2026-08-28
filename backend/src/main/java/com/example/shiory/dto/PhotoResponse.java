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
	private int dayNumber;
	private UUID userId;
	private String userName;
	private String imageUrl;
	private boolean isDeleted;
	private long likeCount;
	private OffsetDateTime createdAt;
}
