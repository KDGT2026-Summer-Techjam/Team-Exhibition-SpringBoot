package com.example.shiory.dto;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ShioriSummaryResponse {

	private UUID id;
	private String title;
	private LocalDate startDate;
	private LocalDate endDate;
	private UUID ownerId;
	private OffsetDateTime createdAt;
}
