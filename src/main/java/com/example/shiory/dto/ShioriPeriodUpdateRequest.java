package com.example.shiory.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotNull;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ShioriPeriodUpdateRequest {

	@NotNull
	private LocalDate startDate;

	@NotNull
	private LocalDate endDate;
}
