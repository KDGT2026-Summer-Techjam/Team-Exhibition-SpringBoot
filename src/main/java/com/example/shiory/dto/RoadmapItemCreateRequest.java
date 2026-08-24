package com.example.shiory.dto;

import java.math.BigDecimal;
import java.time.LocalTime;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RoadmapItemCreateRequest {

	@NotNull
	private LocalTime startsAt;

	@NotNull
	private LocalTime endsAt;

	@NotBlank
	private String title;

	private BigDecimal amount;

	private Integer sortOrder;
}
