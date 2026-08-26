package com.example.shiory.dto;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class RoadmapItemResponse {

	private UUID id;
	private LocalTime startsAt;
	private LocalTime endsAt;
	private String title;
	private BigDecimal amount;
	private Integer sortOrder;
}
