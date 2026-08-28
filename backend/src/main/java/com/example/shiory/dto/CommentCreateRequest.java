package com.example.shiory.dto;

import java.util.UUID;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CommentCreateRequest {

	private UUID shioriId;

	private String targetType;

	private UUID targetId;

	private String targetField;

	private String body;
}