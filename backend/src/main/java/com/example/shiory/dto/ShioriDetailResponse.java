package com.example.shiory.dto;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ShioriDetailResponse {

	private UUID id;
	private UUID ownerId;
	private String title;
	private String description;
	private LocalDate startDate;
	private LocalDate endDate;
	private boolean editable;
	private boolean commentOpen;
	private String promises;
	private OffsetDateTime createdAt;
	private OffsetDateTime updatedAt;
	private boolean isOwner;
}
