package com.example.shiory.dto;

import java.time.LocalTime;
import java.math.BigDecimal;

import jakarta.validation.constraints.NotNull;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RoadmapItemCreateRequest {

	@NotNull
	private LocalTime startsAt;

	private LocalTime endsAt;

	private String title;

	private BigDecimal amount;

	private Integer sortOrder;
}
