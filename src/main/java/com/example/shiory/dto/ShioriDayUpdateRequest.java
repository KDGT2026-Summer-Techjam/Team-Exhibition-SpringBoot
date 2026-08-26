package com.example.shiory.dto;

import java.math.BigDecimal;
import java.util.UUID;

import lombok.Getter;

@Getter
public class ShioriDayUpdateRequest {

	private String title;
	private String notes;
	private BigDecimal estimatedCost;
	private UUID representativePhotoId;

	private boolean titlePresent;
	private boolean notesPresent;
	private boolean estimatedCostPresent;
	private boolean representativePhotoIdPresent;

	public void setTitle(String title) {
		this.title = title;
		this.titlePresent = true;
	}

	public void setNotes(String notes) {
		this.notes = notes;
		this.notesPresent = true;
	}

	public void setEstimatedCost(BigDecimal estimatedCost) {
		this.estimatedCost = estimatedCost;
		this.estimatedCostPresent = true;
	}

	public void setRepresentativePhotoId(UUID representativePhotoId) {
		this.representativePhotoId = representativePhotoId;
		this.representativePhotoIdPresent = true;
	}
}
