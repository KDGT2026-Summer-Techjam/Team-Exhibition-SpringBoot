package com.example.shiory.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PackingItemCreateRequest {
	
	@NotBlank
	private String name;

	@NotNull
	@Min(1)
	private Integer requiredCount = 1;
}
