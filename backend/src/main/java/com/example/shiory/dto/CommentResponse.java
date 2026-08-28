package com.example.shiory.dto;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class CommentResponse {

	private UUID id;
	private UUID shioriId;
	private UUID authorId;
	private String authorName;
	private String body;
	private String targetType;
	private UUID targetId;
	private String targetField;
	private OffsetDateTime createdAt;
	private OffsetDateTime updatedAt;
}
