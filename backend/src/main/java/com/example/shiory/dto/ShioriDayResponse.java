package com.example.shiory.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ShioriDayResponse {

	private UUID id;
	private LocalDate tripDate;
	private int dayNumber;
	private String title;
	private String notes;
	private BigDecimal estimatedCost;
	private UUID representativePhotoId;
	private boolean isEditable;
	private boolean isCommentOpen;
}
