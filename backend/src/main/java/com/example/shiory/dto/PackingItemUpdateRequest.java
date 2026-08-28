package com.example.shiory.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PackingItemUpdateRequest {

	private String name;

	@Min(1)
	private Integer requiredCount;

	private Integer sortOrder;

	private boolean namePresent;
	private boolean requiredCountPresent;
	private boolean sortOrderPresent;

	public void setName(String name) {
		this.name = name;
		this.namePresent = true;
	}

	public void setRequiredCount(Integer requiredCount) {
		this.requiredCount = requiredCount;
		this.requiredCountPresent = true;
	}

	public void setSortOrder(Integer sortOrder) {
		this.sortOrder = sortOrder;
		this.sortOrderPresent = true;
	}
}
