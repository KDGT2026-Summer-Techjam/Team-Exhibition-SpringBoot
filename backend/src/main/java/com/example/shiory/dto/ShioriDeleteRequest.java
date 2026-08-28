package com.example.shiory.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ShioriDeleteRequest {

	@NotBlank
	private String password;
}
