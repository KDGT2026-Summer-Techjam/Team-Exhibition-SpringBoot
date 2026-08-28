package com.example.shiory.dto;

import java.math.BigDecimal;
import java.time.LocalTime;

import lombok.Getter;

@Getter
public class RoadmapItemUpdateRequest {

	private LocalTime startsAt;
	private LocalTime endsAt;
	private String title;
	private BigDecimal amount;
	private Integer sortOrder;

	private boolean startsAtPresent;
	private boolean endsAtPresent;
	private boolean titlePresent;
	private boolean amountPresent;
	private boolean sortOrderPresent;

	public void setStartsAt(LocalTime startsAt) {
		this.startsAt = startsAt;
		this.startsAtPresent = true;
	}

	public void setEndsAt(LocalTime endsAt) {
		this.endsAt = endsAt;
		this.endsAtPresent = true;
	}

	public void setTitle(String title) {
		this.title = title;
		this.titlePresent = true;
	}

	public void setAmount(BigDecimal amount) {
		this.amount = amount;
		this.amountPresent = true;
	}

	public void setSortOrder(Integer sortOrder) {
		this.sortOrder = sortOrder;
		this.sortOrderPresent = true;
	}
}
