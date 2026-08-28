package com.example.shiory.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ShioriCreateRequest {

	@NotBlank
	@Size(max = 255)
	private String title;

	@NotBlank
	@Size(min = 10)
	private String password;

	private String description;

	private LocalDate startDate;

	private LocalDate endDate;
}
